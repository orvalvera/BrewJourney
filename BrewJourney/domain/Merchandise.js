import { Product } from './Product.js';

/**
 * Merchandise - Nueva clase de producto para mercancía de cafetería
 * Extiende Product siguiendo el patrón Template Method
 */
export class Merchandise extends Product {
  constructor(name, price, category = 'accessory') {
    super(name, price);
    this.category = category; // 'accessory', 'mug', 'tumbler', 'apparel'
    this.type = 'merchandise';
  }

  getDescription() {
    return `🛍️ ${this.name} (${this.category}) - $${this.price.toFixed(2)}`;
  }
}
