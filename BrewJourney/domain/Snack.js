import { Product } from './Product.js';

/**
 * Snack - Nueva clase de producto para snacks salados
 * Extiende Product siguiendo el patrón Template Method
 */
export class Snack extends Product {
  constructor(name, price, flavor = 'salted') {
    super(name, price);
    this.flavor = flavor;
    this.type = 'snack';
  }

  getDescription() {
    return `🥨 ${this.name} (${this.flavor}) - $${this.price.toFixed(2)}`;
  }
}
