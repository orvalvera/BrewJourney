#!/usr/bin/env python3
import csv
import json
import re
import subprocess
from pathlib import Path

BASELINE_REF = "v1.0"
OUTPUT_DIR = Path("auditoria/metricas")

MODULES = [
    ("OrderFactory", "BrewJourney/patterns/factory/OrderFactory.js"),
    ("StampRuleContext", "BrewJourney/patterns/strategy/StampRuleContext.js"),
    ("ReviewCaretakerRefactored", "BrewJourney/patterns/memento/ReviewCaretakerRefactored.js"),
]

METHOD_PATTERN = re.compile(r"^\s*(?:static\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\([^;]*\)\s*\{")
CONTROL_KEYWORDS = {"if", "for", "while", "switch", "catch", "constructor"}


def run(cmd):
    return subprocess.run(cmd, check=True, text=True, capture_output=True)


def read_file_at_ref(path, ref=None):
    if ref:
        try:
            return run(["git", "show", f"{ref}:{path}"]).stdout
        except subprocess.CalledProcessError:
            if ref == "v1.0.0":
                return run(["git", "show", f"v1.0:{path}"]).stdout
            raise
    return Path(path).read_text(encoding="utf-8")


def analyze_smells(source):
    lines = source.splitlines()
    smells = []

    if re.search(r"\belse if\b", source):
        smells.append("Conditional Chain")

    i = 0
    while i < len(lines):
        match = METHOD_PATTERN.match(lines[i])
        if match and match.group(1) not in CONTROL_KEYWORDS:
            method_name = match.group(1)
            brace_balance = lines[i].count("{") - lines[i].count("}")
            j = i
            decisions = 0
            while j + 1 < len(lines) and brace_balance > 0:
                j += 1
                line = lines[j]
                brace_balance += line.count("{") - line.count("}")
                decisions += len(re.findall(r"\b(if|else if|for|while|switch|catch)\b", line))

            method_length = j - i + 1
            if method_length > 30:
                smells.append(f"Long Method: {method_name}")
            if decisions > 6:
                smells.append(f"High Complexity: {method_name}")
            i = j
        i += 1

    return smells


def evaluate_modules(ref=None):
    results = []
    for module_name, path in MODULES:
        source = read_file_at_ref(path, ref=ref)
        smells = analyze_smells(source)
        results.append(
            {
                "module": module_name,
                "path": path,
                "smell_count": len(smells),
                "smells": smells,
            }
        )
    return results


def save_csv(filename, rows):
    with (OUTPUT_DIR / filename).open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["module", "smell_count", "smells"])
        for row in rows:
            writer.writerow([row["module"], row["smell_count"], " | ".join(row["smells"])])


def save_kpis_csv():
    rows = [
        [
            "Densidad de defectos por modulo",
            "code_smells / archivos_del_modulo",
            "Analisis estatico (script Python) + GitHub Issues",
            "> 2 = riesgo alto",
            "Refactorizar modulo y repetir medicion",
        ],
        [
            "Tasa de resolucion de issues",
            "issues_cerrados / issues_totales * 100",
            "GitHub Issues",
            "< 80% = accion requerida",
            "Priorizar cierre de issues de PPQA/CM/MA/CAR",
        ],
        [
            "Cobertura de patrones de diseno",
            "patrones_implementados / patrones_planificados * 100",
            "Repositorio + README",
            "< 100% = deuda tecnica",
            "Completar implementacion o ajustar alcance",
        ],
    ]
    with (OUTPUT_DIR / "tabla_kpis_cmmi.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["KPI", "Formula", "Herramienta", "Umbral critico", "Accion preventiva"])
        writer.writerows(rows)


def _max_count(rows):
    return max([row["smell_count"] for row in rows] + [1])


def generate_histogram_svg(rows):
    width = 900
    height = 420
    margin_left = 220
    margin_top = 70
    bar_height = 42
    gap = 26
    chart_width = width - margin_left - 120
    max_count = _max_count(rows)

    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}">',
        '<rect width="100%" height="100%" fill="#ffffff"/>',
        '<text x="32" y="40" font-size="24" font-family="Arial" fill="#1f2937">Histograma de code smells por modulo</text>',
    ]

    y = margin_top
    for row in rows:
        bar_len = 0 if max_count == 0 else int((row["smell_count"] / max_count) * chart_width)
        svg.append(f'<text x="20" y="{y + 28}" font-size="15" font-family="Arial" fill="#111827">{row["module"]}</text>')
        svg.append(
            f'<rect x="{margin_left}" y="{y}" width="{bar_len}" height="{bar_height}" fill="#2563eb" rx="4" ry="4"/>'
        )
        svg.append(
            f'<text x="{margin_left + bar_len + 10}" y="{y + 28}" font-size="15" font-family="Arial" fill="#111827">{row["smell_count"]}</text>'
        )
        y += bar_height + gap

    svg.append("</svg>")
    (OUTPUT_DIR / "histograma_code_smells.svg").write_text("\n".join(svg), encoding="utf-8")


def generate_control_svg(total_v1, total_v2):
    width = 900
    height = 380
    x1, x2 = 220, 650
    y_base = 300
    max_val = max(total_v1, total_v2, 1)
    scale = 180 / max_val
    y_v1 = y_base - int(total_v1 * scale)
    y_v2 = y_base - int(total_v2 * scale)
    mean = (total_v1 + total_v2) / 2
    y_mean = y_base - int(mean * scale)

    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}">',
        '<rect width="100%" height="100%" fill="#ffffff"/>',
        '<text x="28" y="40" font-size="24" font-family="Arial" fill="#1f2937">Diagrama de control simple: defectos v1.0.0 vs v2.0.0</text>',
        '<line x1="120" y1="300" x2="780" y2="300" stroke="#9ca3af" stroke-width="1.5"/>',
        '<line x1="120" y1="90" x2="120" y2="300" stroke="#9ca3af" stroke-width="1.5"/>',
        f'<line x1="120" y1="{y_mean}" x2="780" y2="{y_mean}" stroke="#f59e0b" stroke-dasharray="6 6" stroke-width="2"/>',
        f'<text x="785" y="{y_mean + 5}" font-size="13" font-family="Arial" fill="#92400e">Media</text>',
        f'<line x1="{x1}" y1="{y_v1}" x2="{x2}" y2="{y_v2}" stroke="#2563eb" stroke-width="3"/>',
        f'<circle cx="{x1}" cy="{y_v1}" r="7" fill="#2563eb"/>',
        f'<circle cx="{x2}" cy="{y_v2}" r="7" fill="#2563eb"/>',
        f'<text x="{x1 - 35}" y="{y_base + 28}" font-size="14" font-family="Arial" fill="#111827">v1.0.0</text>',
        f'<text x="{x2 - 35}" y="{y_base + 28}" font-size="14" font-family="Arial" fill="#111827">v2.0.0</text>',
        f'<text x="{x1 + 10}" y="{y_v1 - 10}" font-size="14" font-family="Arial" fill="#111827">{total_v1}</text>',
        f'<text x="{x2 + 10}" y="{y_v2 - 10}" font-size="14" font-family="Arial" fill="#111827">{total_v2}</text>',
        "</svg>",
    ]
    (OUTPUT_DIR / "control_defectos_v1_vs_v2.svg").write_text("\n".join(svg), encoding="utf-8")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    baseline_rows = evaluate_modules(ref=BASELINE_REF)
    current_rows = evaluate_modules(ref=None)

    save_csv("code_smells_v1_0_0.csv", baseline_rows)
    save_csv("code_smells_v2_0_0.csv", current_rows)
    save_kpis_csv()
    generate_histogram_svg(current_rows)

    total_v1 = sum(row["smell_count"] for row in baseline_rows)
    total_v2 = sum(row["smell_count"] for row in current_rows)
    generate_control_svg(total_v1, total_v2)

    summary = {
        "baseline_ref_real": BASELINE_REF,
        "baseline_label": "v1.0.0",
        "current_label": "v2.0.0",
        "total_defects_v1_0_0": total_v1,
        "total_defects_v2_0_0": total_v2,
        "modules": {
            row["module"]: {
                "v1_0_0": baseline_rows[idx]["smell_count"],
                "v2_0_0": current_rows[idx]["smell_count"],
            }
            for idx, row in enumerate(current_rows)
        },
    }
    (OUTPUT_DIR / "resumen_metricas.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print("Metricas generadas en auditoria/metricas")


if __name__ == "__main__":
    main()

