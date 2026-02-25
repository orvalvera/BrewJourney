/**
 * BrewJourney - Demo Refactorizado v1.0
 * 
 * Este demo muestra la implementación de los 3 patrones de diseño:
 * 1. Factory Method (Creacional) - Creación de productos y órdenes
 * 2. Decorator (Estructural) - Extras en bebidas
 * 3. Strategy (Comportamiento) - Reglas de sellos intercambiables
 * 
 * Bonus: Memento (Comportamiento) - Historial de reseñas con undo/redo
 */

import { User } from '../domain/User.js';
import { Cafe } from '../domain/Cafe.js';
import { StampPassport } from '../domain/StampPassport.js';
import { ReviewRefactored as Review } from '../domain/ReviewRefactored.js';

// Factory Pattern (Creacional)
import { OrderFactory } from '../patterns/factory/OrderFactoryRefactored.js';
import { ProductFactory } from '../patterns/factory/ProductFactory.js';

// Decorator Pattern (Estructural)
import { Latte, Cappuccino, Mocha, Espresso } from '../patterns/decorator/BaseBeverage.js';
import { 
    MilkDecorator, 
    ExtraShotDecorator, 
    WhippedCreamDecorator, 
    FlavorSyrupDecorator,
    SizeUpgradeDecorator 
} from '../patterns/decorator/BeverageExtras.js';

// Strategy Pattern (Comportamiento)
import { StampRuleContext } from '../patterns/strategy/StampRuleContext.js';
import { BasicStampRule } from '../patterns/strategy/BasicStampRule.js';
import { DoubleStampRule } from '../patterns/strategy/DoubleStampRule.js';
import { LoyaltyBonusRule } from '../patterns/strategy/LoyaltyBonusRule.js';

// Memento Pattern (Comportamiento - Bonus)
import { ReviewCaretaker } from '../patterns/memento/ReviewCaretakerRefactored.js';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function header(text) {
  console.log(`\n${colors.bright}${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${text}${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
}

function subheader(text) {
  console.log(`\n${colors.yellow}▸ ${text}${colors.reset}`);
}

function success(text) {
  console.log(`${colors.green}✓ ${text}${colors.reset}`);
}

function info(text) {
  console.log(`${colors.blue}ℹ ${text}${colors.reset}`);
}

// ============================================================
// DEMO PRINCIPAL
// ============================================================

console.log(`
${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════╗
║           ☕ BREWJOURNEY - Demo Refactorizado v1.0       ║
║         Patrones de Diseño en JavaScript ES6             ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

// Crear datos de prueba
const user1 = new User('u1', 'Samuel Orval', 'orval@brewjourney.com');
const user2 = new User('u2', 'Karla Nava', 'karla@brewjourney.com');
const cafe1 = new Cafe('c1', 'Starbucks', 'Av. Temozon Norte');
const cafe2 = new Cafe('c2', 'The Italian Coffee', 'Plaza Altabrisa');

// ============================================================
// 1. PATRÓN FACTORY METHOD
// ============================================================
header('1. PATRÓN FACTORY METHOD');

subheader('1.1 Creación de Productos Individuales');

// Demostrar ProductFactory
const cappuccino = ProductFactory.createProduct({
  type: 'beverage',
  name: 'Cappuccino',
  price: 4.50,
  size: 'large'
});
success(`Producto creado: ${cappuccino.getDescription()}`);

const tiramisu = ProductFactory.createProduct({
  type: 'dessert',
  name: 'Tiramisu',
  price: 6.00,
  typeCategory: 'italian'
});
success(`Producto creado: ${tiramisu.getDescription()}`);

// Nuevos tipos de productos
const croissant = ProductFactory.createProduct({
  type: 'snack',
  name: 'Croissant de Almendra',
  price: 3.50,
  flavor: 'sweet'
});
success(`Producto creado: ${croissant.getDescription()}`);

const mug = ProductFactory.createProduct({
  type: 'merchandise',
  name: 'Taza BrewJourney',
  price: 15.00,
  category: 'mug'
});
success(`Producto creado: ${mug.getDescription()}`);

info(`Tipos de productos registrados: ${ProductFactory.getRegisteredTypes().join(', ')}`);

subheader('1.2 Creación de Órdenes Completas');

const order1 = OrderFactory.createOrder({
  type: 'dine-in',
  user: user1,
  cafe: cafe1,
  items: [
    { type: 'beverage', name: 'Latte', price: 4.00, size: 'medium' },
    { type: 'beverage', name: 'Espresso', price: 2.50, size: 'small' },
    { type: 'dessert', name: 'Cheesecake', price: 5.50, typeCategory: 'sweet' },
    { type: 'snack', name: 'Galletas', price: 2.00, flavor: 'chocolate' }
  ]
});

user1.addOrder(order1);

console.log(`\n  📋 Orden: ${order1.id}`);
console.log(`  👤 Cliente: ${user1.name}`);
console.log(`  ☕ Cafetería: ${cafe1.name}`);
console.log(`  📦 Tipo: ${order1.orderType}`);
console.log(`  📝 Productos:`);
order1.products.forEach((product, i) => {
  console.log(`     ${i + 1}. ${product.getDescription()}`);
});
console.log(`  💰 Total: $${order1.getTotal().toFixed(2)}`);

subheader('1.3 Extensibilidad - Registrar Nuevo Tipo de Producto');

// Demostrar extensibilidad
import { Product } from '../domain/Product.js';

class Combo extends Product {
  constructor(name, price, items) {
    super(name, price);
    this.items = items;
    this.type = 'combo';
  }
  getDescription() {
    return `🎁 COMBO: ${this.name} (${this.items.join(' + ')}) - $${this.price.toFixed(2)}`;
  }
}

ProductFactory.registerProduct('combo', (data) => {
  return new Combo(data.name, data.price, data.items || []);
});

const breakfastCombo = ProductFactory.createProduct({
  type: 'combo',
  name: 'Desayuno Completo',
  price: 12.99,
  items: ['Café', 'Croissant', 'Jugo']
});
success(`Nuevo tipo registrado: ${breakfastCombo.getDescription()}`);

// ============================================================
// 2. PATRÓN DECORATOR (ESTRUCTURAL)
// ============================================================
header('2. PATRÓN DECORATOR (Estructural)');

subheader('2.1 Bebida Base sin Extras');

let beverage = new Latte('medium');
console.log(`\n  ☕ Bebida base: ${beverage.getDescription()}`);
console.log(`  📝 Ingredientes: ${beverage.getIngredients().join(', ')}`);

subheader('2.2 Agregando Extras con Decoradores');

// Agregar leche de almendra
beverage = new MilkDecorator(beverage, 'almond');
console.log(`  + Leche de Almendra: ${beverage.getDescription()}`);

// Agregar shot extra
beverage = new ExtraShotDecorator(beverage, 1);
console.log(`  + Shot Extra: ${beverage.getDescription()}`);

// Agregar crema batida
beverage = new WhippedCreamDecorator(beverage);
console.log(`  + Crema Batida: ${beverage.getDescription()}`);

console.log(`\n  📝 Ingredientes finales: ${beverage.getIngredients().join(', ')}`);
console.log(`  💰 Precio total: $${beverage.getPrice().toFixed(2)}`);

subheader('2.3 Otro Ejemplo: Mocha Personalizado');

let mocha = new Mocha('large');
console.log(`\n  ☕ Base: ${mocha.getDescription()}`);

mocha = new MilkDecorator(mocha, 'oat');
mocha = new ExtraShotDecorator(mocha, 2);
mocha = new FlavorSyrupDecorator(mocha, 'caramel');
mocha = new WhippedCreamDecorator(mocha);

console.log(`  🎨 Personalizado: ${mocha.getName()}`);
console.log(`  💰 Precio final: $${mocha.getPrice().toFixed(2)}`);
console.log(`  📝 Ingredientes: ${mocha.getIngredients().join(', ')}`);

subheader('2.4 Espresso Simple con Upgrade de Tamaño');

let espresso = new Espresso();
console.log(`\n  ☕ Original: ${espresso.getDescription()}`);

espresso = new SizeUpgradeDecorator(espresso, 'large');
espresso = new ExtraShotDecorator(espresso, 1);
console.log(`  ⬆️ Con upgrade: ${espresso.getDescription()}`);

success('Patrón Decorator permite agregar funcionalidades dinámicamente sin modificar las clases base');

// ============================================================
// 3. PATRÓN STRATEGY (COMPORTAMIENTO)
// ============================================================
header('3. PATRÓN STRATEGY (Comportamiento)');

const passport1 = new StampPassport(user1.id);
const passport2 = new StampPassport(user2.id);
const ruleContext = new StampRuleContext();

subheader('3.1 Regla Básica (1 sello por día)');

info(`Estrategia activa: ${ruleContext.getRuleInfo().name}`);
info(`Descripción: ${ruleContext.getRuleInfo().description}`);

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

console.log('\n  Registrando visitas de Samuel:');
let result = ruleContext.applyVisit({ cafeId: cafe1.id, date: today }, passport1);
console.log(`  • Primera visita hoy: ${result.message}`);

result = ruleContext.applyVisit({ cafeId: cafe1.id, date: today }, passport1);
console.log(`  • Segunda visita hoy: ${result.message}`);

result = ruleContext.applyVisit({ cafeId: cafe1.id, date: tomorrow }, passport1);
console.log(`  • Visita mañana: ${result.message}`);

console.log(`  📊 Total sellos en ${cafe1.name}: ${passport1.getStampCount(cafe1.id)}`);

subheader('3.2 Cambio Dinámico a Regla de Sellos Dobles');

ruleContext.setRule(new DoubleStampRule(10.00));
info(`Nueva estrategia: ${ruleContext.getRuleInfo().name}`);
info(`Descripción: ${ruleContext.getRuleInfo().description}`);

// Simular un sábado (para sellos dobles)
const saturday = new Date('2026-02-28'); // Sábado
console.log('\n  Registrando visita de Karla en fin de semana:');
result = ruleContext.applyVisit({
  cafeId: cafe2.id,
  date: saturday,
  orderTotal: 15.00
}, passport2);
console.log(`  • Visita fin de semana: ${result.message}`);
console.log(`  • Sellos bonus: ${result.bonusStamps}`);
console.log(`  📊 Total sellos: ${passport2.getStampCount(cafe2.id)}`);

subheader('3.3 Regla de Lealtad con Bonificaciones');

ruleContext.setRule(new LoyaltyBonusRule());
info(`Nueva estrategia: ${ruleContext.getRuleInfo().name}`);
info(`Descripción: ${ruleContext.getRuleInfo().description}`);

const passport3 = new StampPassport('u3');
console.log('\n  Simulando múltiples visitas para alcanzar hito:');

for (let i = 1; i <= 6; i++) {
  const visitDate = new Date();
  visitDate.setDate(visitDate.getDate() + i);
  result = ruleContext.applyVisit({ cafeId: cafe1.id, date: visitDate }, passport3);
  if (i >= 4) {
    console.log(`  • Visita ${i}: ${result.message}`);
  }
}
console.log(`  📊 Total sellos después de 6 visitas: ${passport3.getStampCount(cafe1.id)}`);

subheader('3.4 Historial de Cambios de Estrategia');
const history = ruleContext.getRuleHistory();
console.log('  📜 Historial de reglas aplicadas:');
history.forEach((h, i) => {
  console.log(`     ${i + 1}. ${h.rule} (${h.changedAt.toLocaleTimeString()})`);
});

// ============================================================
// 4. PATRÓN MEMENTO (Bonus - Comportamiento)
// ============================================================
header('4. PATRÓN MEMENTO (Bonus)');

const caretaker = new ReviewCaretaker(5); // Máximo 5 estados en historial

subheader('4.1 Crear Reseña y Primer Backup');

const review = new Review('r1', user1, cafe1, 'Excelente café, muy buen ambiente', 5);
review.addTag('acogedor');
review.addTag('wifi gratis');
review.addImage('https://example.com/cafe1.jpg');

user1.addReview(review);
cafe1.addReview(review);

console.log('  📝 Reseña original:');
console.log(`     Texto: "${review.text}"`);
console.log(`     Rating: ${'⭐'.repeat(review.rating)}`);
console.log(`     Tags: ${review.tags.join(', ')}`);
console.log(`     Imágenes: ${review.images.length}`);

caretaker.backup(review, 'Estado inicial');
success('Backup creado');

subheader('4.2 Modificar Reseña');

review.updateText('Regular, el café estaba frío');
review.updateRating(2);
review.removeTag('acogedor');
review.addTag('mejorable');

caretaker.backup(review, 'Después de edición negativa');

console.log('\n  📝 Reseña modificada:');
console.log(`     Texto: "${review.text}"`);
console.log(`     Rating: ${'⭐'.repeat(review.rating)}`);
console.log(`     Tags: ${review.tags.join(', ')}`);

subheader('4.3 Deshacer Cambio (Undo)');

if (caretaker.canUndo(review.id)) {
  caretaker.undo(review);
  success('Cambio deshecho');
  console.log('\n  📝 Reseña restaurada:');
  console.log(`     Texto: "${review.text}"`);
  console.log(`     Rating: ${'⭐'.repeat(review.rating)}`);
  console.log(`     Tags: ${review.tags.join(', ')}`);
}

subheader('4.4 Rehacer Cambio (Redo)');

if (caretaker.canRedo(review.id)) {
  caretaker.redo(review);
  success('Cambio rehecho');
  console.log('\n  📝 Reseña después de redo:');
  console.log(`     Texto: "${review.text}"`);
  console.log(`     Rating: ${'⭐'.repeat(review.rating)}`);
}

subheader('4.5 Información del Historial');

const historyInfo = caretaker.getHistoryInfo(review.id);
console.log(`\n  📊 Estadísticas del historial:`);
console.log(`     Total snapshots: ${historyInfo.totalSnapshots}`);
console.log(`     Índice actual: ${historyInfo.currentIndex}`);
console.log(`     Puede deshacer: ${historyInfo.canUndo ? 'Sí' : 'No'}`);
console.log(`     Puede rehacer: ${historyInfo.canRedo ? 'Sí' : 'No'}`);

console.log('\n  📜 Snapshots guardados:');
historyInfo.snapshots.forEach(s => {
  const marker = s.isCurrent ? '→' : ' ';
  console.log(`     ${marker} [${s.index}] ${s.reason} (${s.createdAt.toLocaleTimeString()})`);
});

// ============================================================
// RESUMEN FINAL
// ============================================================
header('RESUMEN DE LA DEMOSTRACIÓN');

console.log(`
  ${colors.green}✓${colors.reset} Factory Method (Creacional): Creación flexible de productos
    • ProductFactory con registro dinámico de tipos
    • OrderFactory delegando a ProductFactory
    • Fácil extensibilidad (se agregó tipo "combo" en runtime)

  ${colors.green}✓${colors.reset} Decorator (Estructural): Extras en bebidas
    • Composición dinámica de funcionalidades
    • MilkDecorator, ExtraShotDecorator, WhippedCreamDecorator
    • FlavorSyrupDecorator, SizeUpgradeDecorator
    • Precio calculado recursivamente

  ${colors.green}✓${colors.reset} Strategy (Comportamiento): Reglas de sellos intercambiables
    • BasicStampRule: 1 sello por día
    • DoubleStampRule: Sellos dobles en promociones
    • LoyaltyBonusRule: Bonificaciones por lealtad
    • Cambio dinámico de estrategia con historial

  ${colors.green}✓${colors.reset} Memento (Comportamiento - Bonus): Historial de reseñas
    • Estados inmutables (Object.freeze)
    • Historial completo con undo/redo
    • Metadata de snapshots

  ${colors.bright}Principios SOLID aplicados:${colors.reset}
    • Open/Closed: Extensible sin modificar código existente
    • Single Responsibility: Cada clase con una responsabilidad
    • Liskov Substitution: Estrategias intercambiables
    • Dependency Inversion: Dependemos de abstracciones
`);

console.log(`${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════╗
║                   Demo completado ☕                      ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);
