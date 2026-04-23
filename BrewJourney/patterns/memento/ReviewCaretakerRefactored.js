export class ReviewCaretaker {
  constructor(maxHistory = 10) {
    this._history = new Map();
    this._maxHistory = maxHistory;
  }

  backup(review, reason = 'User action') {
    if (!this._isValidReview(review)) {
      throw new Error('Se requiere una reseña válida con ID');
    }

    const memento = review.createMemento({ reason, version: this._getNextVersion(review.id) });
    const reviewHistory = this._getOrCreateHistory(review.id);

    this._trimFutureStates(reviewHistory);
    reviewHistory.mementos.push(memento);
    reviewHistory.currentIndex = reviewHistory.mementos.length - 1;
    this._enforceHistoryLimit(reviewHistory);

    return true;
  }

  undo(review) {
    const reviewHistory = this._getHistoryOrNull(review);
    if (!reviewHistory) {
      return false;
    }

    if (reviewHistory.currentIndex <= 0) {
      return false;
    }

    reviewHistory.currentIndex--;
    const memento = reviewHistory.mementos[reviewHistory.currentIndex];
    review.restore(memento);

    return true;
  }

  redo(review) {
    const reviewHistory = this._getHistoryOrNull(review);
    if (!reviewHistory) {
      return false;
    }

    if (reviewHistory.currentIndex >= reviewHistory.mementos.length - 1) {
      return false;
    }

    reviewHistory.currentIndex++;
    const memento = reviewHistory.mementos[reviewHistory.currentIndex];
    review.restore(memento);

    return true;
  }

  restoreToVersion(review, index) {
    const reviewHistory = this._getHistoryOrNull(review);
    if (!reviewHistory) {
      return false;
    }

    if (index < 0 || index >= reviewHistory.mementos.length) {
      return false;
    }

    reviewHistory.currentIndex = index;
    const memento = reviewHistory.mementos[index];
    review.restore(memento);

    return true;
  }

  hasBackup(reviewId) {
    return this._history.has(reviewId) && this._history.get(reviewId).mementos.length > 0;
  }

  canUndo(reviewId) {
    if (!this._history.has(reviewId)) return false;
    return this._history.get(reviewId).currentIndex > 0;
  }

  canRedo(reviewId) {
    if (!this._history.has(reviewId)) return false;
    const history = this._history.get(reviewId);
    return history.currentIndex < history.mementos.length - 1;
  }

  getHistoryInfo(reviewId) {
    if (!this._history.has(reviewId)) {
      return null;
    }

    const reviewHistory = this._history.get(reviewId);
    return {
      totalSnapshots: reviewHistory.mementos.length,
      currentIndex: reviewHistory.currentIndex,
      canUndo: reviewHistory.currentIndex > 0,
      canRedo: reviewHistory.currentIndex < reviewHistory.mementos.length - 1,
      snapshots: reviewHistory.mementos.map((m, i) => ({
        index: i,
        createdAt: m.getMetadata().createdAt,
        reason: m.getMetadata().reason,
        isCurrent: i === reviewHistory.currentIndex
      }))
    };
  }

  clearHistory(reviewId) {
    this._history.delete(reviewId);
  }

  _getNextVersion(reviewId) {
    if (!this._history.has(reviewId)) return 1;
    return this._history.get(reviewId).mementos.length + 1;
  }

  _isValidReview(review) {
    return Boolean(review && review.id);
  }

  _getHistoryOrNull(review) {
    if (!this._isValidReview(review) || !this._history.has(review.id)) {
      return null;
    }
    return this._history.get(review.id);
  }

  _getOrCreateHistory(reviewId) {
    if (!this._history.has(reviewId)) {
      this._history.set(reviewId, {
        mementos: [],
        currentIndex: -1
      });
    }
    return this._history.get(reviewId);
  }

  _trimFutureStates(reviewHistory) {
    if (reviewHistory.currentIndex < reviewHistory.mementos.length - 1) {
      reviewHistory.mementos = reviewHistory.mementos.slice(0, reviewHistory.currentIndex + 1);
    }
  }

  _enforceHistoryLimit(reviewHistory) {
    if (reviewHistory.mementos.length > this._maxHistory) {
      reviewHistory.mementos.shift();
      reviewHistory.currentIndex--;
    }
  }
}
