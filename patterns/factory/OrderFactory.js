import { Order } from '../../domain/Order.js';
import { Beverage } from '../../domain/Beverage.js';
import { Dessert } from '../../domain/Dessert.js';

export class OrderFactory {
  static createOrder(type, user, cafe, itemsData) {
    const order = new Order(`${type}_${Date.now()}`, user, cafe);
    
    if (!itemsData || itemsData.length === 0) {
      return order;
    }

    itemsData.forEach(item => {
      let product;
      
      if (item.type === 'beverage') {
        product = new Beverage(item.name, item.price, item.size);
      } else if (item.type === 'dessert') {
        product = new Dessert(item.name, item.price, item.typeCategory);
      } else {
        throw new Error(`Tipo de producto desconocido: ${item.type}`);
      }
      
      order.addProduct(product);
    });

    return order;
  }
}
