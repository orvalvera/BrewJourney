# BrewJourney

Sistema de gestión de cafeterías con sellos y reseñas tipo pasaporte implementado en JavaScript con patrones de diseño.

## Estructura del Proyecto

```
BrewJourney/
├── BrewJourney/
│   ├── domain/              # Clases del dominio
│   │   ├── User.js
│   │   ├── Cafe.js
│   │   ├── Order.js
│   │   ├── Product.js       # Clase abstracta
│   │   ├── Beverage.js
│   │   ├── Dessert.js
│   │   ├── Review.js
│   │   └── StampPassport.js
│   ├── patterns/
│   │   ├── factory/
│   │   │   └── OrderFactory.js    # Factory Method Pattern
│   │   ├── memento/
│   │   │   ├── ReviewMemento.js   # Memento Pattern
│   │   │   └── ReviewCaretaker.js
│   │   └── strategy/
│   │       ├── StampRuleStrategy.js  # Strategy Pattern (interface)
│   │       └── BasicRule.js           # Implementación concreta
│   └── demo/
│       └── demo.js          # Demostración de funcionalidades
├── package.json
└── README.md
```

## Patrones de Diseño Implementados

### 1. Factory Method Pattern
**Ubicación:** `BrewJourney/patterns/factory/OrderFactory.js`

El patrón Factory Method se utiliza para crear objetos `Order` con productos (`Beverage` o `Dessert`) de manera encapsulada.

**Uso:**
```javascript
import { OrderFactory } from './BrewJourney/patterns/factory/OrderFactory.js';

const itemsData = [
  { type: 'beverage', name: 'Cappuccino', price: 4.50, size: 'large' },
  { type: 'dessert', name: 'Tiramisu', price: 6.00, typeCategory: 'sweet' }
];

const order = OrderFactory.createOrder('order', user, cafe, itemsData);
```

### 2. Memento Pattern
**Ubicación:** `BrewJourney/patterns/memento/ReviewMemento.js` y `BrewJourney/patterns/memento/ReviewCaretaker.js`

El patrón Memento permite guardar y restaurar el estado de objetos `Review` sin violar la encapsulación.

**Componentes:**
- `ReviewMemento`: Almacena el estado de una reseña (texto y calificación)
- `ReviewCaretaker`: Gestiona los mementos (respaldo y deshacer)

**Uso:**
```javascript
import { ReviewCaretaker } from './BrewJourney/patterns/memento/ReviewCaretaker.js';

const caretaker = new ReviewCaretaker();
caretaker.backup(review);  // Guardar estado
// ... modificar review ...
caretaker.undo(review);    // Restaurar estado
```

**Métodos en Review:**
- `createMemento()`: Crea un memento con el estado actual
- `restore(memento)`: Restaura el estado desde un memento

### 3. Strategy Pattern
**Ubicación:** `BrewJourney/patterns/strategy/StampRuleStrategy.js` y `BrewJourney/patterns/strategy/BasicRule.js`

El patrón Strategy define una familia de algoritmos intercambiables para aplicar reglas de sellos. La implementación `BasicRule` aplica la regla: "máximo 1 sello por día por cafetería".

**Componentes:**
- `StampRuleStrategy`: Interfaz/clase abstracta que define `applyVisit()`
- `BasicRule`: Implementación concreta que aplica la regla de 1 sello por día

**Uso:**
```javascript
import { BasicRule } from './BrewJourney/patterns/strategy/BasicRule.js';
import { StampPassport } from './BrewJourney/domain/StampPassport.js';

const stampRule = new BasicRule();
const passport = new StampPassport(userId);
stampRule.applyVisit(userId, cafeId, date, passport);
```

## Clases del Dominio

### User
Representa un usuario del sistema con órdenes y reseñas.

### Cafe
Representa una cafetería con reseñas asociadas.

### Order
Representa un pedido con productos, estado y total.

### Product (Abstracta)
Clase base abstracta para productos. No puede instanciarse directamente.

### Beverage
Extiende `Product`. Representa bebidas con tamaño.

### Dessert
Extiende `Product`. Representa postres con categoría.

### Review
Representa una reseña de un usuario sobre una cafetería. Implementa métodos para crear y restaurar mementos.

### StampPassport
Gestiona los sellos de un usuario. Usa un `Map` para almacenar sellos por cafetería y fecha.

## Ejecutar el Demo

Para ejecutar la demostración de todas las funcionalidades:

```bash
npm run demo
```

El demo muestra:
1. **Sistema de Sellos (Strategy)**: Registro de visitas con regla de máximo 1 sello por día
2. **Creación de Pedidos (Factory Method)**: Creación de órdenes con bebidas y postres
3. **Sistema de Reseñas (Memento)**: Respaldo y restauración de reseñas

## Tecnologías

- **Node.js** con ES Modules (`"type": "module"`)
- **JavaScript puro** (sin dependencias externas por ahora)
- Patrones de diseño: Factory Method, Memento, Strategy


