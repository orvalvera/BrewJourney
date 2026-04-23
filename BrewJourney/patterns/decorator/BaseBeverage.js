import { IBeverageComponent } from './IBeverageComponent.js';

export class BaseBeverage extends IBeverageComponent {
    constructor(name, price, size = 'medium') {
        super();
        this._name = name;
        this._price = price;
        this._size = size;
    }

    getName() {
        return this._name;
    }

    getPrice() {
        return this._price;
    }

    getSize() {
        return this._size;
    }

    getDescription() {
        return `${this._name} (${this._size}) - $${this._price.toFixed(2)}`;
    }

    getIngredients() {
        return [this._name];
    }
}

export class Espresso extends BaseBeverage {
    constructor() {
        super('Espresso', 2.50, 'small');
    }
}

export class Americano extends BaseBeverage {
    constructor(size = 'medium') {
        const prices = { small: 2.50, medium: 3.00, large: 3.50 };
        super('Americano', prices[size] || 3.00, size);
    }
}

export class Latte extends BaseBeverage {
    constructor(size = 'medium') {
        const prices = { small: 3.50, medium: 4.00, large: 4.50 };
        super('Latte', prices[size] || 4.00, size);
    }
}

export class Cappuccino extends BaseBeverage {
    constructor(size = 'medium') {
        const prices = { small: 3.50, medium: 4.50, large: 5.00 };
        super('Cappuccino', prices[size] || 4.50, size);
    }
}

export class Mocha extends BaseBeverage {
    constructor(size = 'medium') {
        const prices = { small: 4.00, medium: 5.00, large: 5.50 };
        super('Mocha', prices[size] || 5.00, size);
    }
}
