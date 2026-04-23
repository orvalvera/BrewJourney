/**
 * ReviewCaretaker - Patrón Memento Refactorizado (Caretaker)
 * 
 * MEJORAS RESPECTO A LA VERSIÓN ANTERIOR:
 * 1. Historial completo de mementos (no solo el último)
 * 2. Límite configurable de historial para evitar memory leaks
 * 3. Métodos undo() y redo() completos
 * 4. Información de diagnóstico y estadísticas
 * 5. Capacidad de restaurar a cualquier punto del historial
 */
export class ReviewCaretaker {
  constructor(maxHistory = 10) {
    // Map<reviewId, { mementos: Memento[], currentIndex: number }>
    this._history = new Map();
    this._maxHistory = maxHistory;
  }

  /**
   * Crea un backup del estado actual de una reseña
   * @param {Review} review - Reseña a respaldar
   * @param {string} reason - Razón del backup
   */
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

  /**
   * Deshace el último cambio (undo)
   * @param {Review} review - Reseña a restaurar
   * @returns {boolean} true si se pudo deshacer
   */
  undo(review) {
    const reviewHistory = this._getHistoryOrNull(review);
    if (!reviewHistory) {
      return false;
    }

    if (reviewHistory.currentIndex <= 0) {
      return false; // No hay más estados anteriores
    }

    reviewHistory.currentIndex--;
    const memento = reviewHistory.mementos[reviewHistory.currentIndex];
    review.restore(memento);

    return true;
  }

  /**
   * Rehace el último cambio deshecho (redo)
   * @param {Review} review - Reseña a restaurar
   * @returns {boolean} true si se pudo rehacer
   */
  redo(review) {
    const reviewHistory = this._getHistoryOrNull(review);
    if (!reviewHistory) {
      return false;
    }

    if (reviewHistory.currentIndex >= reviewHistory.mementos.length - 1) {
      return false; // No hay más estados futuros
    }

    reviewHistory.currentIndex++;
    const memento = reviewHistory.mementos[reviewHistory.currentIndex];
    review.restore(memento);

    return true;
  }

  /**
   * Restaura a una versión específica del historial
   * @param {Review} review - Reseña a restaurar
   * @param {number} index - Índice del historial (0 = más antiguo)
   * @returns {boolean} true si se pudo restaurar
   */
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

  /**
   * Verifica si hay backup disponible
   */
  hasBackup(reviewId) {
    return this._history.has(reviewId) && this._history.get(reviewId).mementos.length > 0;
  }

  /**
   * Verifica si se puede deshacer
   */
  canUndo(reviewId) {
    if (!this._history.has(reviewId)) return false;
    return this._history.get(reviewId).currentIndex > 0;
  }

  /**
   * Verifica si se puede rehacer
   */
  canRedo(reviewId) {
    if (!this._history.has(reviewId)) return false;
    const history = this._history.get(reviewId);
    return history.currentIndex < history.mementos.length - 1;
  }

  /**
   * Obtiene información del historial de una reseña
   */
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

  /**
   * Limpia el historial de una reseña
   */
  clearHistory(reviewId) {
    this._history.delete(reviewId);
  }

  /**
   * Obtiene la siguiente versión para un memento
   * @private
   */
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
