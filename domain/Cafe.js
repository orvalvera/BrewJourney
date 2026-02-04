export class Cafe {
  constructor(id, name, location) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.reviews = [];
  }

  addReview(review) {
    this.reviews.push(review);
  }
}
