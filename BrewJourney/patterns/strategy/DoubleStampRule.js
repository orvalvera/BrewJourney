import { IStampRule } from './IStampRule.js';

/**
 * DoubleStampRule - Regla de sellos dobles para promociones
 * 
 * Esta estrategia otorga el doble de sellos bajo ciertas condiciones:
 * - Los fines de semana (sábado y domingo)
 * - Cuando el total de la orden supera un umbral
 */
export class DoubleStampRule extends IStampRule {
  constructor(minimumOrderTotal = 10.00) {
    super();
    this.minimumOrderTotal = minimumOrderTotal;
  }

  getName() {
    return 'Regla de Sellos Dobles';
  }

  getDescription() {
    return `Obtén 2 sellos los fines de semana o con órdenes mayores a $${this.minimumOrderTotal.toFixed(2)}`;
  }

  applyVisit(context, stampPassport) {
    const { cafeId, date, orderTotal = 0 } = context;

    if (!cafeId) {
      return {
        stamped: false,
        message: 'ID de cafetería no proporcionado',
        bonusStamps: 0
      };
    }

    const visitDate = date instanceof Date ? date : new Date(date || Date.now());
    const dateKey = this.formatDateKey(visitDate);
    const dayOfWeek = visitDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHighValueOrder = orderTotal >= this.minimumOrderTotal;

    // Ya tiene sello para este día
    if (stampPassport.hasStamp(cafeId, dateKey)) {
      return {
        stamped: false,
        message: 'Ya tienes un sello para esta cafetería hoy',
        bonusStamps: 0
      };
    }

    // Agregar sello base
    stampPassport.addStamp(cafeId, dateKey);

    // Verificar si aplica sello bonus
    if (isWeekend || isHighValueOrder) {
      const bonusDateKey = `${dateKey}_bonus`;
      stampPassport.addStamp(cafeId, bonusDateKey);

      const reason = isWeekend 
        ? '¡Es fin de semana!' 
        : `¡Tu orden fue mayor a $${this.minimumOrderTotal.toFixed(2)}!`;

      return {
        stamped: true,
        message: `¡Doble sello! ${reason}`,
        bonusStamps: 1
      };
    }

    return {
      stamped: true,
      message: `¡Sello agregado para ${dateKey}!`,
      bonusStamps: 0
    };
  }
}
