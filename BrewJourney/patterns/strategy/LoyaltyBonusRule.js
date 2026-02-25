import { IStampRule } from './IStampRule.js';

/**
 * LoyaltyBonusRule - Regla con bonificación por lealtad
 * 
 * Esta estrategia otorga sellos adicionales cuando el usuario
 * alcanza ciertos hitos de visitas en una cafetería:
 * - 5 visitas: +1 sello bonus
 * - 10 visitas: +2 sellos bonus
 * - 25 visitas: +5 sellos bonus
 */
export class LoyaltyBonusRule extends IStampRule {
  constructor() {
    super();
    this.milestones = [
      { visits: 5, bonus: 1, message: '¡5 visitas! +1 sello de lealtad' },
      { visits: 10, bonus: 2, message: '¡10 visitas! +2 sellos de lealtad' },
      { visits: 25, bonus: 5, message: '¡25 visitas! +5 sellos de lealtad VIP' }
    ];
  }

  getName() {
    return 'Regla de Lealtad';
  }

  getDescription() {
    return 'Obtén sellos bonus al alcanzar 5, 10 y 25 visitas en una cafetería';
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

    // Verificar hitos de lealtad
    const currentStampCount = stampPassport.getStampCount(cafeId);
    let totalBonusStamps = 0;
    const bonusMessages = [];

    for (const milestone of this.milestones) {
      if (currentStampCount === milestone.visits) {
        // Agregar sellos bonus
        for (let i = 0; i < milestone.bonus; i++) {
          const bonusKey = `${dateKey}_loyalty_${milestone.visits}_${i}`;
          stampPassport.addStamp(cafeId, bonusKey);
        }
        totalBonusStamps += milestone.bonus;
        bonusMessages.push(milestone.message);
      }
    }

    if (totalBonusStamps > 0) {
      return {
        stamped: true,
        message: bonusMessages.join(' | '),
        bonusStamps: totalBonusStamps
      };
    }

    return {
      stamped: true,
      message: `¡Sello agregado! Total: ${currentStampCount} visitas`,
      bonusStamps: 0
    };
  }
}
