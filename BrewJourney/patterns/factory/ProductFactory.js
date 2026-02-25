import { Beverage } from '../../domain/Beverage.js';
import { Dessert } from '../../domain/Dessert.js';
import { Snack } from '../../domain/Snack.js';
import { Merchandise } from '../../domain/Merchandise.js';

/**
 * ProductFactory - Patrón Factory Method Refactorizado
 * 
 * MEJORAS RESPECTO A LA VERSIÓN ANTERIOR:
 * 1. Eliminación de if/else anidados mediante un registro de creadores
 * 2. Principio Open/Closed: fácil agregar nuevos productos sin modificar código existente
 * 3. Separación de responsabilidades: cada creador sabe cómo construir su producto
 * 4. Validación de datos de entrada para evitar errores en tiempo de ejecución
 * 5. Mensajes de error descriptivos
 */
export class ProductFactory {
  // Registro de creadores de productos (patrón Registry + Factory)
  static creators = new Map();

  /**
   * Registra un nuevo tipo de producto con su función creadora
   * Permite extensibilidad sin modificar la clase
   */
  static registerProduct(type, creator) {
    if (typeof creator !== 'function') {
      throw new Error(`El creador para "${type}" debe ser una función`);
    }
    ProductFactory.creators.set(type.toLowerCase(), creator);
  }

  /**
   * Crea un producto basado en el tipo y datos proporcionados
   * @param {Object} itemData - Datos del producto {type, name, price, ...extras}
   * @returns {Product} Instancia del producto creado
   */
  static createProduct(itemData) {
    // Validación de datos de entrada
    if (!itemData || typeof itemData !== 'object') {
      throw new Error('Los datos del producto son requeridos');
    }

    const { type, name, price } = itemData;

    if (!type) {
      throw new Error('El tipo de producto es requerido');
    }

    if (!name || typeof name !== 'string') {
      throw new Error('El nombre del producto es requerido y debe ser una cadena');
    }

    if (typeof price !== 'number' || price < 0) {
      throw new Error('El precio debe ser un número positivo');
    }

    const normalizedType = type.toLowerCase();
    const creator = ProductFactory.creators.get(normalizedType);

    if (!creator) {
      const availableTypes = Array.from(ProductFactory.creators.keys()).join(', ');
      throw new Error(
        `Tipo de producto desconocido: "${type}". Tipos disponibles: ${availableTypes}`
      );
    }

    return creator(itemData);
  }

  /**
   * Verifica si un tipo de producto está registrado
   */
  static hasProductType(type) {
    return ProductFactory.creators.has(type.toLowerCase());
  }

  /**
   * Obtiene todos los tipos de productos registrados
   */
  static getRegisteredTypes() {
    return Array.from(ProductFactory.creators.keys());
  }
}

// Registro de creadores por defecto
ProductFactory.registerProduct('beverage', (data) => {
  return new Beverage(data.name, data.price, data.size || 'medium');
});

ProductFactory.registerProduct('dessert', (data) => {
  return new Dessert(data.name, data.price, data.typeCategory || 'sweet');
});

ProductFactory.registerProduct('snack', (data) => {
  return new Snack(data.name, data.price, data.flavor || 'salted');
});

ProductFactory.registerProduct('merchandise', (data) => {
  return new Merchandise(data.name, data.price, data.category || 'accessory');
});
