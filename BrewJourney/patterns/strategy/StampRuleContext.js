import { BasicStampRule } from './BasicStampRule.js';

export class StampRuleContext {
  constructor(defaultRule = null) {
    this.currentRule = this._validateRule(defaultRule || new BasicStampRule());
    this.ruleHistory = [];
  }

  setRule(rule) {
    const validatedRule = this._validateRule(rule);
    this.ruleHistory.push(this._buildHistoryEntry(this.currentRule, validatedRule));
    this.currentRule = validatedRule;
  }

  getRule() {
    return this.currentRule;
  }

  applyVisit(context, stampPassport) {
    return this.currentRule.applyVisit(context, stampPassport);
  }

  getRuleInfo() {
    return {
      name: this.currentRule.getName(),
      description: this.currentRule.getDescription()
    };
  }

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
