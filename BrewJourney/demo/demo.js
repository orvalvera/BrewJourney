import { User } from '../domain/User.js';
import { Cafe } from '../domain/Cafe.js';
import { Review } from '../domain/Review.js';
import { StampPassport } from '../domain/StampPassport.js';
import { OrderFactory } from '../patterns/factory/OrderFactory.js';
import { ReviewCaretaker } from '../patterns/memento/ReviewCaretaker.js';
import { BasicRule } from '../patterns/strategy/BasicRule.js';

console.log('BrewJourney Demo\n');

// 1. Crear user y café, registrar visita dos veces mismo día (solo 1 sello), 
//    registrar visita otro día (2do sello)
console.log(' 1. Sistema de Sellos (Patrón Strategy)');
const user1 = new User('u1', 'Orval Vera', 'orvalvera@gmail.com');
const cafe1 = new Cafe('c1', 'Starbucks', 'Av. Temozon');
const passport = new StampPassport(user1.id);
const stampRule = new BasicRule();

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

console.log('Registrando primera visita del día...');
const result1 = stampRule.applyVisit(user1.id, cafe1.id, today, passport);
console.log(`Sello agregado: ${result1 ? 'Sí' : 'No'}`);
console.log(`Sellos en ${cafe1.name}: ${passport.getStampCount(cafe1.id)}`);

console.log('\nRegistrando segunda visita del mismo día...');
const result2 = stampRule.applyVisit(user1.id, cafe1.id, today, passport);
console.log(`Sello agregado: ${result2 ? 'Sí' : 'No'}`);
console.log(`Sellos en ${cafe1.name}: ${passport.getStampCount(cafe1.id)}`);

console.log('\nRegistrando visita al día siguiente...');
const result3 = stampRule.applyVisit(user1.id, cafe1.id, tomorrow, passport);
console.log(`Sello agregado: ${result3 ? 'Sí' : 'No'}`);
console.log(`Sellos en ${cafe1.name}: ${passport.getStampCount(cafe1.id)}`);
console.log(`Todos los sellos:`, passport.getStamps());

// 2. Crear pedido beverage y dessert con OrderFactory
console.log('\n\n 2. Creación de Pedidos (Patrón Factory Method)');
const itemsData = [
  { type: 'beverage', name: 'Cappuccino', price: 4.50, size: 'large' },
  { type: 'dessert', name: 'Tiramisu', price: 6.00, typeCategory: 'sweet' }
];

const order = OrderFactory.createOrder('order', user1, cafe1, itemsData);
user1.addOrder(order);

console.log(`Pedido creado: ${order.id}`);
console.log(`Estado: ${order.status}`);
console.log('Productos:');
order.products.forEach((product, index) => {
  console.log(`  ${index + 1}. ${product.getDescription()}`);
});
console.log(`Total: $${order.getTotal().toFixed(2)}`);

// 3. Escribir reseña con mementos (backup, cambio, undo)
console.log('\n\n 3. Sistema de Reseñas (Patrón Memento)');
const review = new Review('r1', user1, cafe1, 'Excelente café y ambiente acogedor', 5);
user1.addReview(review);
cafe1.addReview(review);

const caretaker = new ReviewCaretaker();

console.log('Reseña original:');
console.log(`  Texto: "${review.text}"`);
console.log(`  Calificación: ${review.rating}`);

console.log('\nCreando respaldo...');
caretaker.backup(review);
console.log('Respaldo creado ✓');

console.log('\nModificando reseña...');
review.updateText('Café regular, nada especial');
review.updateRating(3);
console.log('Reseña modificada:');
console.log(`  Texto: "${review.text}"`);
console.log(`  Calificación: ${review.rating}`);

console.log('\nRestaurando desde respaldo (deshacer)...');
const restored = caretaker.undo(review);
if (restored) {
  console.log('Reseña restaurada ✓');
  console.log('Reseña después de deshacer:');
  console.log(`  Texto: "${review.text}"`);
  console.log(`  Calificación: ${review.rating}`);
} else {
  console.log('No se pudo restaurar la reseña');
}

console.log('\n Demo completado');
