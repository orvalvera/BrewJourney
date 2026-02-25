/**
 * ReviewMemento - Patrón Memento Refactorizado
 * 
 * MEJORAS RESPECTO A LA VERSIÓN ANTERIOR:
 * 1. Estado inmutable (Object.freeze)
 * 2. Timestamp para rastrear cuándo se creó el snapshot
 * 3. Metadata adicional (razón del backup, autor)
 * 4. Validación de estado
 * 5. Método para comparar estados
 */
export class ReviewMemento {
  constructor(state, metadata = {}) {
    // Validar estado
    if (!state || typeof state !== 'object') {
      throw new Error('El estado es requerido y debe ser un objeto');
    }

    // Crear copia profunda del estado
    this._state = Object.freeze({
      text: state.text,
      rating: state.rating,
      images: state.images ? [...state.images] : [],
      tags: state.tags ? [...state.tags] : []
    });

    // Metadata del memento
    this._metadata = Object.freeze({
      createdAt: new Date(),
      reason: metadata.reason || 'Manual backup',
      version: metadata.version || 1
    });

    // Hacer inmutable el memento
    Object.freeze(this);
  }

  /**
   * Obtiene una copia del estado guardado
   */
  getState() {
    return {
      text: this._state.text,
      rating: this._state.rating,
      images: this._state.images ? [...this._state.images] : [],
      tags: this._state.tags ? [...this._state.tags] : []
    };
  }

  /**
   * Obtiene la metadata del memento
   */
  getMetadata() {
    return { ...this._metadata };
  }

  /**
   * Obtiene la fecha de creación del snapshot
   */
  getCreatedAt() {
    return new Date(this._metadata.createdAt);
  }

  /**
   * Compara este memento con otro estado
   * @param {Object} otherState - Estado a comparar
   * @returns {boolean} true si son iguales
   */
  isEqualTo(otherState) {
    return (
      this._state.text === otherState.text &&
      this._state.rating === otherState.rating &&
      JSON.stringify(this._state.images) === JSON.stringify(otherState.images || []) &&
      JSON.stringify(this._state.tags) === JSON.stringify(otherState.tags || [])
    );
  }

  /**
   * Descripción para debugging
   */
  toString() {
    return `Memento[${this._metadata.createdAt.toISOString()}]: "${this._state.text?.substring(0, 30)}..."`;
  }
}
