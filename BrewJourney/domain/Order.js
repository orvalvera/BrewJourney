export class Order {
  constructor(id, user, cafe) {
    this.id = id;
    this.user = user;
    this.cafe = cafe;
    this.status = 'pending';
    this.products = [];
    this.createdAt = new Date();
  }

  addProduct(product) {
    this.products.push(product);
  }

  getTotal() {
    return this.products.reduce((total, product) => total + product.price, 0);
  }

  setStatus(status) {
    this.status = status;
  }
}
