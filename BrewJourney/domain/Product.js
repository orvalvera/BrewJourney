export class Product {
  constructor(name, price) {
    if (this.constructor === Product) {
      throw new Error("Product es una clase abstracta y no puede ser instanciada directamente");
    }
    this.name = name;
    this.price = price;
  }

  getDescription() {
    throw new Error("getDescription() debe ser implementado por la subclase");
  }
}
