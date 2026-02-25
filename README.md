# BrewJourney

> **Pasaporte Digital de Cafeterías** - Sistema con Patrones de Diseño en JavaScript ES6

## 📋 Descripción

BrewJourney es una aplicación conceptual que funciona como un "pasaporte de cafeterías". Los usuarios pueden:

- 🎫 **Registrar visitas** a cafeterías y acumular sellos digitales
- 🛒 **Crear órdenes** con diferentes tipos de productos
- ⭐ **Escribir reseñas** con funcionalidad de undo/redo
- 🎁 **Obtener beneficios** mediante reglas de lealtad y promociones

## 🏗️ Patrones de Diseño Implementados

| Tipo | Patrón | Aplicación |
|------|--------|------------|
| **Creacional** | Factory Method | Creación de productos y órdenes |
| **Estructural** | Decorator | Personalización de bebidas con extras |
| **Comportamiento** | Strategy | Reglas de acumulación de sellos |
| **Comportamiento** | Memento | Historial de ediciones de reseñas |

## 📁 Estructura del Proyecto

```
BrewJourney/
├── server.js                    # Backend Express
├── database.js                  # Persistencia con lowdb
├── data/
│   └── db.json                  # Base de datos JSON
├── frontend/
│   ├── index.html               # Interfaz web
│   ├── styles.css               # Estilos
│   └── app.js                   # Lógica frontend
├── domain/                      # Clases de dominio
│   ├── User.js                  # Usuario
│   ├── Cafe.js                  # Cafetería
│   ├── Order.js                 # Orden
│   ├── Product.js               # Producto (abstracto)
│   ├── Beverage.js              # Bebida
│   ├── Dessert.js               # Postre
│   ├── Snack.js                 # Snack
│   ├── Merchandise.js           # Mercancía
│   ├── Review.js                # Reseña
│   ├── ReviewRefactored.js      # Reseña mejorada
│   └── StampPassport.js         # Pasaporte de sellos
├── patterns/
│   ├── factory/                 # Patrón Factory Method (Creacional)
│   │   ├── OrderFactory.js      # Factory original
│   │   ├── OrderFactoryRefactored.js
│   │   └── ProductFactory.js    # Factory con Registry
│   ├── decorator/               # Patrón Decorator (Estructural)
│   │   ├── IBeverageComponent.js # Interfaz
│   │   ├── BaseBeverage.js      # Componente concreto
│   │   ├── BeverageDecorator.js # Decorador abstracto
│   │   ├── BeverageExtras.js    # Decoradores concretos
│   │   └── index.js             # Exportaciones
│   ├── strategy/                # Patrón Strategy (Comportamiento)
│   │   ├── IStampRule.js        # Interfaz
│   │   ├── BasicStampRule.js    # Regla básica
│   │   ├── DoubleStampRule.js   # Sellos dobles
│   │   ├── LoyaltyBonusRule.js  # Bonificación lealtad
│   │   └── StampRuleContext.js  # Contexto
│   └── memento/                 # Patrón Memento (Comportamiento)
│       ├── ReviewMementoRefactored.js
│       └── ReviewCaretakerRefactored.js
└── demo/
    ├── demo.js                  # Demo original
    └── demo-refactored.js       # Demo refactorizado
```

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js >= 18.0.0

### Instalación
```bash
# Clonar el repositorio
git clone repo
cd brewjourney

# Instalar dependencias
npm install
```

### Ejecutar Servidor Web (con Base de Datos Persistente)
```bash
npm start
# Servidor disponible en http://localhost:3000
```

### Ejecutar Demo de Consola
```bash
# Demo refactorizado (recomendado)
npm run demo

# Demo original (para comparación)
npm run demo:old
```

## 🌐 API Endpoints

| Método | Endpoint | Descripción | Patrón |
|--------|----------|-------------|--------|
| GET | `/api/cafes` | Lista de cafeterías | - |
| GET | `/api/users/:id` | Información de usuario | - |
| GET | `/api/stamps/:userId` | Sellos del usuario | Strategy |
| POST | `/api/stamps` | Registrar visita (sello) | Strategy |
| POST | `/api/stamps/rule` | Cambiar regla de sellos | Strategy |
| GET | `/api/orders` | Lista de órdenes | Factory |
| POST | `/api/orders` | Crear nueva orden | Factory |
| GET | `/api/beverages/options` | Opciones de personalización | Decorator |
| POST | `/api/beverages/customize` | **Personalizar bebida** | Decorator |
| GET | `/api/reviews/:cafeId` | Reseñas de cafetería | Memento |
| POST | `/api/reviews` | Crear reseña | Memento |
| PUT | `/api/reviews/:id` | Editar reseña (con snapshot) | Memento |
| POST | `/api/reviews/:id/undo` | Deshacer cambio | Memento |
| GET | `/api/info` | Info del sistema | - |

## 📊 Ejemplo de Salida (Demo)

```
╔══════════════════════════════════════════════════════════╗
║           ☕ BREWJOURNEY - Demo Refactorizado v1.0       ║
╚══════════════════════════════════════════════════════════╝

▸ 1.1 Creación de Productos Individuales
✓ Producto creado: Cappuccino (large) - $4.5
✓ Producto creado: Tiramisu (italian) - $6
✓ Producto creado: 🥨 Croissant de Almendra (sweet) - $3.50
✓ Producto creado: 🛍️ Taza BrewJourney (mug) - $15.00

▸ 2.1 Regla Básica (1 sello por día)
• Primera visita hoy: ¡Sello agregado para 2026-02-24!
• Segunda visita hoy: Ya tienes un sello para esta cafetería hoy

▸ 3.3 Deshacer Cambio (Undo)
✓ Cambio deshecho
📝 Reseña restaurada:
   Texto: "Excelente café, muy buen ambiente"
   Rating: ⭐⭐⭐⭐⭐
```

## 🔄 Mejoras Implementadas (v1.0)

### Factory Method (Creacional)
- ✅ Eliminación de if/else encadenados
- ✅ Registry pattern para extensibilidad
- ✅ Soporte para 5+ tipos de productos
- ✅ Validación robusta de datos

### Decorator (Estructural)
- ✅ Personalización dinámica de bebidas
- ✅ 5 decoradores: Leche, Shot Extra, Crema, Jarabe, Tamaño
- ✅ Cadena de decoradores visible en UI
- ✅ Cálculo de precio dinámico

### Strategy (Comportamiento)
- ✅ 3 estrategias de sellos intercambiables
- ✅ Contexto con historial de cambios
- ✅ Resultado estructurado (no solo boolean)
- ✅ Eliminación de parámetros no usados

### Memento (Comportamiento)
- ✅ Historial completo de estados
- ✅ Operaciones undo/redo
- ✅ Estados inmutables (Object.freeze)
- ✅ Metadata con timestamp y razón

## 👥 Equipo

| Nombre | Rol |
|--------|-----|
| Karla Nava García | Desarrolladora |
| Ximena Geraldine García Pérez | Desarrolladora |
| Jesús Aarón Guillermo Escobar Pérez | Desarrollador |
| Samuel Orval Vera Lavalle | Desarrollador |

**Asignatura:** Ingeniería de Software II  
**Docente:** Jaziel Carballo  
**Semestre:** Sexto semestre  
**Fecha:** 24/02/2026




