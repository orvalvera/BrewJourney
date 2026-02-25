/**
 * IBeverageComponent - Interfaz base para el patrón Decorator
 * 
 * Define el contrato que deben cumplir tanto el componente base (Beverage)
 * como los decoradores (extras).
 * 
 * @pattern Decorator (Estructural)
 */
export class IBeverageComponent {
    /**
     * Obtiene el nombre del producto con sus extras
     * @returns {string}
     */
    getName() {
        throw new Error('Método getName() debe ser implementado');
    }

    /**
     * Obtiene el precio total incluyendo extras
     * @returns {number}
     */
    getPrice() {
        throw new Error('Método getPrice() debe ser implementado');
    }

    /**
     * Obtiene la descripción completa del producto
     * @returns {string}
     */
    getDescription() {
        throw new Error('Método getDescription() debe ser implementado');
    }

    /**
     * Lista los ingredientes/extras
     * @returns {string[]}
     */
    getIngredients() {
        throw new Error('Método getIngredients() debe ser implementado');
    }
}
