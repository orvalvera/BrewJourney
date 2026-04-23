import { BasicStampRule } from './BasicStampRule.js';

/**
 * StampRuleContext - Contexto para el patrón Strategy
 * 
 * Esta clase permite cambiar dinámicamente la estrategia de sellos
 * y mantiene un registro de las reglas aplicadas
 */
export class StampRuleContext {
  constructor(defaultRule = null) {
    this.currentRule = this._validateRule(defaultRule || new BasicStampRule());
    this.ruleHistory = [];
  }

  /**
   * Establece la estrategia de sellos actual
   * @param {IStampRule} rule - Nueva regla a aplicar
   */
  setRule(rule) {
    const validatedRule = this._validateRule(rule);
    this.ruleHistory.push(this._buildHistoryEntry(this.currentRule, validatedRule));
    this.currentRule = validatedRule;
  }

  /**
   * Obtiene la regla actual
   */
  getRule() {
    return this.currentRule;
  }

  /**
   * Aplica la visita usando la regla actual
   * @param {Object} context - Contexto de la visita
   * @param {StampPassport} stampPassport - Pasaporte del usuario
   */
  applyVisit(context, stampPassport) {
    return this.currentRule.applyVisit(context, stampPassport);
  }

  /**
   * Obtiene información sobre la regla actual
   */
  getRuleInfo() {
    return {
      name: this.currentRule.getName(),
      description: this.currentRule.getDescription()
    };
  }

  /**
   * Obtiene el historial de cambios de regla
   */
  getRuleHistory() {
    return [...this.ruleHistory];
  }

  _validateRule(rule) {
    if (!rule || typeof rule.applyVisit !== 'function') {
      throw new Error('La regla debe implementar el método applyVisit');
    }
    if (typeof rule.getName !== 'function' || typeof rule.getDescription !== 'function') {
      throw new Error('La regla debe implementar getName y getDescription');
    }
    return rule;
  }

  _buildHistoryEntry(previousRule, nextRule) {
    return {
      from: previousRule.getName(),
      to: nextRule.getName(),
      changedAt: new Date()
    };
  }
}
