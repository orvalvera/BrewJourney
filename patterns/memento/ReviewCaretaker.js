export class ReviewCaretaker {
  constructor() {
    this.mementos = new Map(); // Map<reviewId, memento>
  }

  backup(review) {
    this.mementos.set(review.id, review.createMemento());
  }

  undo(review) {
    const memento = this.mementos.get(review.id);
    if (memento) {
      review.restore(memento);
      return true;
    }
    return false;
  }

  hasBackup(reviewId) {
    return this.mementos.has(reviewId);
  }
}
