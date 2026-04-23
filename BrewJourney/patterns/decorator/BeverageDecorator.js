import { IBeverageComponent } from './IBeverageComponent.js';

export class BeverageDecorator extends IBeverageComponent {
    constructor(beverage) {
        super();
        if (!(beverage instanceof IBeverageComponent)) {
            throw new Error('BeverageDecorator requiere un IBeverageComponent');
        }
        this._beverage = beverage;
    }

    getName() {
        return this._beverage.getName();
    }

    getPrice() {
        return this._beverage.getPrice();
    }

    getDescription() {
        return this._beverage.getDescription();
    }

    getIngredients() {
        return this._beverage.getIngredients();
    }

    getSize() {
        return this._beverage.getSize?.() || 'medium';
    }
}
