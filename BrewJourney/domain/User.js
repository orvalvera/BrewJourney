export class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.orders = [];
    this.reviews = [];
  }

  addOrder(order) {
    this.orders.push(order);
  }

  addReview(review) {
    this.reviews.push(review);
  }
}
