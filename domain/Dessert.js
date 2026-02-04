import { Product } from './Product.js';

export class Dessert extends Product {
  constructor(name, price, type = 'sweet') {
    super(name, price);
    this.type = type;
  }

  getDescription() {
    return `${this.name} (${this.type}) - $${this.price}`;
  }
}
