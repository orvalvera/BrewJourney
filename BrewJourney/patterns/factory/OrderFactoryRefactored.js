import { Order } from '../../domain/Order.js';
import { ProductFactory } from './ProductFactory.js';

export class OrderFactory {
  static orderCounter = 0;

  static generateOrderId(type = 'order') {
    OrderFactory.orderCounter++;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}_${timestamp}_${random}_${OrderFactory.orderCounter}`;
  }

  static createOrder({ type = 'dine-in', user, cafe, items = [] }) {
    if (!user) {
      throw new Error('Se requiere un usuario para crear la orden');
    }

    if (!cafe) {
      throw new Error('Se requiere una cafetería para crear la orden');
    }

    const orderId = OrderFactory.generateOrderId(type);
    const order = new Order(orderId, user, cafe);
    order.orderType = type;

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

      const errors = creationResults.filter(r => !r.success);
      if (errors.length > 0) {
        const errorMessages = errors.map(e => `Item ${e.index + 1}: ${e.error}`).join('; ');
        throw new Error(`Errores al crear productos: ${errorMessages}`);
      }
    }

    return order;
  }

  static createEmptyOrder(user, cafe, type = 'dine-in') {
    return OrderFactory.createOrder({ type, user, cafe, items: [] });
  }

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
