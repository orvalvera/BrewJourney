import { ReviewMemento } from '../patterns/memento/ReviewMementoRefactored.js';

/**
 * Review - Clase de dominio refactorizada con soporte Memento mejorado
 * 
 * MEJORAS RESPECTO A LA VERSIÓN ANTERIOR:
 * 1. Soporte para imágenes y tags
 * 2. Validación de datos
 * 3. Timestamps de modificación
 * 4. Integración completa con el nuevo Memento
 */
export class ReviewRefactored {
  constructor(id, user, cafe, text, rating) {
    this._validateInputs(id, user, cafe, text, rating);
    
    this.id = id;
    this.user = user;
    this.cafe = cafe;
    this.text = text;
    this.rating = rating;
    this.images = [];
    this.tags = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Valida los datos de entrada
   * @private
   */
  _validateInputs(id, user, cafe, text, rating) {
    if (!id) throw new Error('ID es requerido');
    if (!user) throw new Error('Usuario es requerido');
    if (!cafe) throw new Error('Cafetería es requerida');
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('Rating debe ser un número entre 1 y 5');
    }
  }

  /**
   * Crea un memento del estado actual
   * @param {Object} metadata - Metadata adicional para el memento
   */
  createMemento(metadata = {}) {
    return new ReviewMemento({
      text: this.text,
      rating: this.rating,
      images: [...this.images],
      tags: [...this.tags]
    }, metadata);
  }

  /**
   * Restaura el estado desde un memento
   * @param {ReviewMemento} memento - Memento a restaurar
   */
  restore(memento) {
    if (!memento || typeof memento.getState !== 'function') {
      throw new Error('Memento inválido');
    }

    const state = memento.getState();
    this.text = state.text;
    this.rating = state.rating;
    this.images = state.images ? [...state.images] : [];
    this.tags = state.tags ? [...state.tags] : [];
    this.updatedAt = new Date();
  }

  /**
   * Actualiza el texto de la reseña
   */
  updateText(newText) {
    if (typeof newText !== 'string') {
      throw new Error('El texto debe ser una cadena');
    }
    this.text = newText;
    this.updatedAt = new Date();
  }

  /**
   * Actualiza la calificación
   */
  updateRating(newRating) {
    if (typeof newRating !== 'number' || newRating < 1 || newRating > 5) {
      throw new Error('Rating debe ser un número entre 1 y 5');
    }
    this.rating = newRating;
    this.updatedAt = new Date();
  }

  /**
   * Agrega una imagen a la reseña
   */
  addImage(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('URL de imagen es requerida');
    }
    this.images.push(imageUrl);
    this.updatedAt = new Date();
  }

  /**
   * Elimina una imagen de la reseña
   */
  removeImage(imageUrl) {
    const index = this.images.indexOf(imageUrl);
    if (index > -1) {
      this.images.splice(index, 1);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Agrega un tag a la reseña
   */
  addTag(tag) {
    if (!tag || typeof tag !== 'string') {
      throw new Error('Tag es requerido');
    }
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
    }
  }

  /**
   * Elimina un tag de la reseña
   */
  removeTag(tag) {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Obtiene un resumen de la reseña
   */
  getSummary() {
    const stars = '⭐'.repeat(this.rating);
    return `${stars} ${this.text?.substring(0, 50)}${this.text?.length > 50 ? '...' : ''}`;
  }

  /**
   * Representación como objeto plano
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.user.id,
      userName: this.user.name,
      cafeId: this.cafe.id,
      cafeName: this.cafe.name,
      text: this.text,
      rating: this.rating,
      images: [...this.images],
      tags: [...this.tags],
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}
