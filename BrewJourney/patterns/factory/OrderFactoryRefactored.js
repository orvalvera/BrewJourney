import { Order } from '../../domain/Order.js';
import { ProductFactory } from './ProductFactory.js';

/**
 * OrderFactory - Patrón Factory Method Refactorizado
 * 
 * MEJORAS RESPECTO A LA VERSIÓN ANTERIOR:
 * 1. Delegación a ProductFactory para la creación de productos
 * 2. Generación de IDs más robusta con UUID-like
 * 3. Validación de parámetros de entrada
 * 4. Soporte para diferentes tipos de órdenes
 * 5. Principio de Responsabilidad Única: solo se encarga de crear órdenes
 */
export class OrderFactory {
  static orderCounter = 0;

  /**
   * Genera un ID único para la orden
   */
  static generateOrderId(type = 'order') {
    OrderFactory.orderCounter++;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}_${timestamp}_${random}_${OrderFactory.orderCounter}`;
  }

  /**
   * Crea una nueva orden con los productos especificados
   * @param {Object} options - Opciones de la orden
   * @param {string} options.type - Tipo de orden ('dine-in', 'takeout', 'delivery')
   * @param {User} options.user - Usuario que realiza la orden
   * @param {Cafe} options.cafe - Cafetería donde se realiza la orden
   * @param {Array} options.items - Datos de los productos a incluir
   * @returns {Order} Nueva instancia de Order
   */
  static createOrder({ type = 'dine-in', user, cafe, items = [] }) {
    // Validaciones
    if (!user) {
      throw new Error('Se requiere un usuario para crear la orden');
    }

    if (!cafe) {
      throw new Error('Se requiere una cafetería para crear la orden');
    }

    const orderId = OrderFactory.generateOrderId(type);
    const order = new Order(orderId, user, cafe);
    order.orderType = type;

    // Crear y agregar productos usando ProductFactory
    if (items && items.length > 0) {
      const creationResults = items.map((itemData, index) => {
        try {
          const product = ProductFactory.createProduct(itemData);
          order.addProduct(product);
          return { success: true, index, product };
        } catch (error) {
          return { success: false, index, error: error.message };
        }
      });

      // Verificar si hubo errores
      const errors = creationResults.filter(r => !r.success);
      if (errors.length > 0) {
        const errorMessages = errors.map(e => `Item ${e.index + 1}: ${e.error}`).join('; ');
        throw new Error(`Errores al crear productos: ${errorMessages}`);
      }
    }

    return order;
  }

  /**
   * Crea una orden vacía (para agregar productos después)
   */
  static createEmptyOrder(user, cafe, type = 'dine-in') {
    return OrderFactory.createOrder({ type, user, cafe, items: [] });
  }

  /**
   * Clona una orden existente (útil para reordenar)
   */
  static cloneOrder(originalOrder, newUser = null) {
    const items = originalOrder.products.map(product => ({
      type: product.type || 'beverage',
      name: product.name,
      price: product.price,
      size: product.size,
      typeCategory: product.type,
      flavor: product.flavor,
      category: product.category
    }));

    return OrderFactory.createOrder({
      type: originalOrder.orderType || 'dine-in',
      user: newUser || originalOrder.user,
      cafe: originalOrder.cafe,
      items
    });
  }
}
