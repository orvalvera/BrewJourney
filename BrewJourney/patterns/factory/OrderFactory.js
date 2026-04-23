import { Order } from '../../domain/Order.js';
import { Beverage } from '../../domain/Beverage.js';
import { Dessert } from '../../domain/Dessert.js';

const PRODUCT_BUILDERS = {
  beverage: (item) => new Beverage(item.name, item.price, item.size),
  dessert: (item) => new Dessert(item.name, item.price, item.typeCategory)
};

export class OrderFactory {
  static createOrder(type, user, cafe, itemsData) {
    const order = new Order(`${type}_${Date.now()}`, user, cafe);

    if (!itemsData || itemsData.length === 0) {
      return order;
    }

    itemsData.forEach((item) => {
      const product = OrderFactory.createProduct(item);
      order.addProduct(product);
    });

    return order;
  }

  static createProduct(item) {
    const builder = PRODUCT_BUILDERS[item.type];
    if (!builder) {
      throw new Error(`Tipo de producto desconocido: ${item.type}`);
    }
    return builder(item);
  }
}
