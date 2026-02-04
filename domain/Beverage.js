import { Product } from './Product.js';

export class Beverage extends Product {
  constructor(name, price, size = 'medium') {
    super(name, price);
    this.size = size;
  }

  getDescription() {
    return `${this.name} (${this.size}) - $${this.price}`;
  }
}
