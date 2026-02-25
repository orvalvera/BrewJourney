/**
 * Decoradores concretos para extras de bebidas
 * 
 * Cada decorador agrega una funcionalidad/extra específica a la bebida
 * y modifica su precio y descripción.
 * 
 * @pattern Decorator (Estructural) - Concrete Decorators
 */
import { BeverageDecorator } from './BeverageDecorator.js';

/**
 * MilkDecorator - Agrega diferentes tipos de leche
 */
export class MilkDecorator extends BeverageDecorator {
    static MILK_TYPES = {
        regular: { name: 'Leche', price: 0.00 },
        almond: { name: 'Leche de Almendra', price: 0.60 },
        oat: { name: 'Leche de Avena', price: 0.70 },
        soy: { name: 'Leche de Soya', price: 0.50 },
        coconut: { name: 'Leche de Coco', price: 0.65 }
    };

    constructor(beverage, milkType = 'regular') {
        super(beverage);
        this._milkType = MilkDecorator.MILK_TYPES[milkType] || MilkDecorator.MILK_TYPES.regular;
    }

    getName() {
        if (this._milkType.name === 'Leche') {
            return this._beverage.getName();
        }
        return `${this._beverage.getName()} con ${this._milkType.name}`;
    }

    getPrice() {
        return this._beverage.getPrice() + this._milkType.price;
    }

    getDescription() {
        const base = `${this.getName()} (${this.getSize()}) - $${this.getPrice().toFixed(2)}`;
        return base;
    }

    getIngredients() {
        return [...this._beverage.getIngredients(), this._milkType.name];
    }
}

/**
 * ExtraShotDecorator - Agrega shots extra de espresso
 */
export class ExtraShotDecorator extends BeverageDecorator {
    static PRICE_PER_SHOT = 0.75;

    constructor(beverage, shots = 1) {
        super(beverage);
        this._shots = Math.max(1, Math.min(shots, 4)); // 1-4 shots
    }

    getName() {
        const shotText = this._shots === 1 ? 'Shot Extra' : `${this._shots} Shots Extra`;
        return `${this._beverage.getName()} + ${shotText}`;
    }

    getPrice() {
        return this._beverage.getPrice() + (ExtraShotDecorator.PRICE_PER_SHOT * this._shots);
    }

    getDescription() {
        return `${this.getName()} (${this.getSize()}) - $${this.getPrice().toFixed(2)}`;
    }

    getIngredients() {
        return [...this._beverage.getIngredients(), `${this._shots}x Espresso Shot`];
    }
}

/**
 * WhippedCreamDecorator - Agrega crema batida
 */
export class WhippedCreamDecorator extends BeverageDecorator {
    static PRICE = 0.50;

    constructor(beverage) {
        super(beverage);
    }

    getName() {
        return `${this._beverage.getName()} con Crema`;
    }

    getPrice() {
        return this._beverage.getPrice() + WhippedCreamDecorator.PRICE;
    }

    getDescription() {
        return `${this.getName()} (${this.getSize()}) - $${this.getPrice().toFixed(2)}`;
    }

    getIngredients() {
        return [...this._beverage.getIngredients(), 'Crema Batida'];
    }
}

/**
 * FlavorSyrupDecorator - Agrega jarabes de sabor
 */
export class FlavorSyrupDecorator extends BeverageDecorator {
    static FLAVORS = {
        vanilla: { name: 'Vainilla', price: 0.50 },
        caramel: { name: 'Caramelo', price: 0.50 },
        hazelnut: { name: 'Avellana', price: 0.55 },
        mocha: { name: 'Chocolate', price: 0.50 },
        cinnamon: { name: 'Canela', price: 0.45 },
        pumpkinSpice: { name: 'Pumpkin Spice', price: 0.65 }
    };

    constructor(beverage, flavor = 'vanilla') {
        super(beverage);
        this._flavor = FlavorSyrupDecorator.FLAVORS[flavor] || FlavorSyrupDecorator.FLAVORS.vanilla;
    }

    getName() {
        return `${this._beverage.getName()} con ${this._flavor.name}`;
    }

    getPrice() {
        return this._beverage.getPrice() + this._flavor.price;
    }

    getDescription() {
        return `${this.getName()} (${this.getSize()}) - $${this.getPrice().toFixed(2)}`;
    }

    getIngredients() {
        return [...this._beverage.getIngredients(), `Jarabe de ${this._flavor.name}`];
    }
}

/**
 * SizeUpgradeDecorator - Aumenta el tamaño de la bebida
 */
export class SizeUpgradeDecorator extends BeverageDecorator {
    static UPGRADES = {
        'small-medium': { price: 0.50, newSize: 'medium' },
        'small-large': { price: 1.00, newSize: 'large' },
        'medium-large': { price: 0.50, newSize: 'large' }
    };

    constructor(beverage, targetSize = 'large') {
        super(beverage);
        const currentSize = beverage.getSize?.() || 'medium';
        const upgradeKey = `${currentSize}-${targetSize}`;
        this._upgrade = SizeUpgradeDecorator.UPGRADES[upgradeKey];
        this._targetSize = this._upgrade ? targetSize : currentSize;
    }

    getName() {
        return this._beverage.getName();
    }

    getPrice() {
        return this._beverage.getPrice() + (this._upgrade?.price || 0);
    }

    getSize() {
        return this._targetSize;
    }

    getDescription() {
        return `${this.getName()} (${this.getSize()}) - $${this.getPrice().toFixed(2)}`;
    }

    getIngredients() {
        return this._beverage.getIngredients();
    }
}
