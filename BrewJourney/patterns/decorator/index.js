/**
 * Decorator Pattern - Index
 * 
 * Exporta todos los componentes del patrón Decorator para bebidas
 */

export { IBeverageComponent } from './IBeverageComponent.js';
export { BeverageDecorator } from './BeverageDecorator.js';
export { 
    BaseBeverage, 
    Espresso, 
    Americano, 
    Latte, 
    Cappuccino, 
    Mocha 
} from './BaseBeverage.js';
export { 
    MilkDecorator, 
    ExtraShotDecorator, 
    WhippedCreamDecorator, 
    FlavorSyrupDecorator,
    SizeUpgradeDecorator 
} from './BeverageExtras.js';
