/**
 * IStampRule - Interfaz para reglas de sellos
 * 
 * MEJORAS RESPECTO A LA VERSIÓN ANTERIOR:
 * 1. Define claramente el contrato que deben cumplir las estrategias
 * 2. Documentación de métodos esperados
 * 3. Método getName() para identificación de la estrategia
 * 4. Método getDescription() para explicar la regla al usuario
 */
export class IStampRule {
  /**
   * Aplica la regla de visita y determina si se debe agregar un sello
   * @param {Object} context - Contexto de la visita
   * @param {string} context.cafeId - ID de la cafetería
   * @param {Date} context.date - Fecha de la visita
   * @param {number} context.orderTotal - Total de la orden (opcional)
   * @param {StampPassport} stampPassport - Pasaporte del usuario
   * @returns {Object} Resultado {stamped: boolean, message: string, bonusStamps: number}
   */
  applyVisit(context, stampPassport) {
    throw new Error('applyVisit() debe ser implementado por la subclase');
  }

  /**
   * Obtiene el nombre de la estrategia
   * @returns {string}
   */
  getName() {
    throw new Error('getName() debe ser implementado por la subclase');
  }

  /**
   * Obtiene la descripción de la regla
   * @returns {string}
   */
  getDescription() {
    throw new Error('getDescription() debe ser implementado por la subclase');
  }

  /**
   * Formatea una fecha a clave de día (YYYY-MM-DD)
   * @protected
   */
  formatDateKey(date) {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
