import { IStampRule } from './IStampRule.js';

/**
 * BasicStampRule - Regla básica de sellos (1 sello por día por cafetería)
 * 
 * MEJORAS RESPECTO A BasicRule ANTERIOR:
 * 1. Implementa la interfaz IStampRule correctamente
 * 2. Elimina el parámetro userId no utilizado
 * 3. Usa un objeto context en lugar de múltiples parámetros
 * 4. Retorna un objeto con más información sobre el resultado
 * 5. Incluye nombre y descripción de la regla
 */
export class BasicStampRule extends IStampRule {
  getName() {
    return 'Regla Básica';
  }

  getDescription() {
    return 'Obtén 1 sello por cada visita a una cafetería (máximo 1 por día por cafetería)';
  }

  applyVisit(context, stampPassport) {
    const { cafeId, date } = context;

    if (!cafeId) {
      return {
        stamped: false,
        message: 'ID de cafetería no proporcionado',
        bonusStamps: 0
      };
    }

    const dateKey = this.formatDateKey(date || new Date());

    // Regla: máximo 1 sello por día por cafetería
    if (!stampPassport.hasStamp(cafeId, dateKey)) {
      stampPassport.addStamp(cafeId, dateKey);
      return {
        stamped: true,
        message: `¡Sello agregado para ${dateKey}!`,
        bonusStamps: 0
      };
    }

    return {
      stamped: false,
      message: 'Ya tienes un sello para esta cafetería hoy',
      bonusStamps: 0
    };
  }
}
