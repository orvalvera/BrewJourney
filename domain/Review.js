import { ReviewMemento } from '../patterns/memento/ReviewMemento.js';

export class Review {
  constructor(id, user, cafe, text, rating) {
    this.id = id;
    this.user = user;
    this.cafe = cafe;
    this.text = text;
    this.rating = rating;
    this.createdAt = new Date();
  }

  createMemento() {
    return new ReviewMemento({
      text: this.text,
      rating: this.rating
    });
  }

  restore(memento) {
    if (memento && memento.state) {
      this.text = memento.state.text;
      this.rating = memento.state.rating;
    }
  }

  updateText(newText) {
    this.text = newText;
  }

  updateRating(newRating) {
    this.rating = newRating;
  }
}
