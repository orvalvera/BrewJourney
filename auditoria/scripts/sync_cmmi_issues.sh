#!/usr/bin/env bash
set -euo pipefail

REPO="orvalvera/BrewJourney"

ensure_label() {
  local name="$1"
  local color="$2"
  local desc="$3"

  if gh label list --repo "$REPO" --json name --jq '.[].name' | grep -qx "$name"; then
    gh label edit "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null
  fi
}

create_issue_if_missing() {
  local title="$1"
  local label="$2"
  local area="$3"
  local objetivo="$4"
  local evidencia="$5"
  local cierre="$6"

  if gh issue list --repo "$REPO" --state all --search "in:title \"$title\"" --json title --jq '.[].title' | grep -qx "$title"; then
    echo "SKIP issue existente: $title"
    return
  fi

  local body
  body=$(
    cat <<EOF
Area CMMI: $area

Objetivo del issue: $objetivo

Evidencia esperada: $evidencia

Criterio de cierre: $cierre
EOF
  )

  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --label "$label" \
    --body "$body" >/dev/null

  echo "CREATED: $title"
}

ensure_label "cmmi-ppqa" "0E8A16" "CMMI PPQA (Process and Product Quality Assurance)"
ensure_label "cmmi-cm" "1D76DB" "CMMI CM (Configuration Management)"
ensure_label "cmmi-ma" "FBCA04" "CMMI MA (Measurement and Analysis)"
ensure_label "cmmi-car" "B60205" "CMMI CAR (Causal Analysis and Resolution)"

create_issue_if_missing \
  "PPQA-01 Matriz de trazabilidad y verificacion de evidencias" \
  "cmmi-ppqa" \
  "PPQA" \
  "Construir la matriz de trazabilidad CMMI con enlaces verificables a evidencias reales del proyecto." \
  "Matriz con vinculos a commits, issues, tags y archivos relevantes." \
  "La matriz cubre PPQA, CM, MA y CAR y todos los enlaces funcionan."

create_issue_if_missing \
  "PPQA-02 Checklist de auditoria tecnica y criterios de calidad" \
  "cmmi-ppqa" \
  "PPQA" \
  "Definir un checklist de calidad para evaluar consistencia, verificabilidad y completitud del expediente." \
  "Checklist aplicado por seccion y registro de hallazgos." \
  "Checklist completo con estado por item y acciones de correccion cerradas."

create_issue_if_missing \
  "CM-01 Definicion de baseline y control de version para auditoria" \
  "cmmi-cm" \
  "CM" \
  "Definir y documentar lineas base del proyecto para comparacion de estado inicial vs estabilizado." \
  "Documento de baseline y referencia explicita a tags de auditoria v1.0.0 y v2.0.0." \
  "Politica de baseline aprobada y lista para defensa tecnica."

create_issue_if_missing \
  "CM-02 Procedimiento de control de cambios y registro de configuracion" \
  "cmmi-cm" \
  "CM" \
  "Establecer procedimiento de control de cambios con criterios de registro y trazabilidad." \
  "Procedimiento documentado y evidencia de cambios vinculados a issues." \
  "Todos los cambios del expediente quedan asociados a issue y commit."

create_issue_if_missing \
  "MA-01 Definicion de KPIs CMMI (formula, herramienta, umbral)" \
  "cmmi-ma" \
  "MA" \
  "Definir KPIs de desempeno con formula, herramienta de medicion y umbral critico." \
  "Tabla KPI con columnas KPI, Formula, Herramienta, Umbral critico y Accion preventiva." \
  "Tabla KPI validada y alineada al analisis estadistico del expediente."

create_issue_if_missing \
  "MA-02 Histograma de code smells y diagrama de control v1.0.0 vs v2.0.0" \
  "cmmi-ma" \
  "MA" \
  "Generar analisis estadistico simplificado con histograma por modulo y comparacion de defectos por baseline." \
  "Graficas exportadas y datos fuente reproducibles en archivos del repositorio." \
  "Histograma y diagrama de control incluidos en el expediente con interpretacion tecnica."

create_issue_if_missing \
  "CAR-01 RCA formal del principal desvio (Ishikawa / 5-Whys)" \
  "cmmi-car" \
  "CAR" \
  "Realizar analisis de causa raiz del desvio principal identificado en el proceso." \
  "Documento RCA con diagrama Ishikawa y/o analisis 5-Whys." \
  "Causa raiz validada con acciones correctivas propuestas y responsables."

create_issue_if_missing \
  "CAR-02 Plan de acciones correctivas y validacion de efectividad" \
  "cmmi-car" \
  "CAR" \
  "Definir acciones correctivas medibles y su validacion de efectividad." \
  "Plan de accion con criterio de exito y evidencias de mejora entre baselines." \
  "Acciones correctivas documentadas y verificables para defensa."

echo "Sincronizacion CMMI terminada."

