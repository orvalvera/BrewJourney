import { StampRuleStrategy } from './StampRuleStrategy.js';

export class BasicRule extends StampRuleStrategy {
  applyVisit(userId, cafeId, date, stampPassport) {
    // Formato de dateKey: YYYY-MM-DD
    const dateKey = this.formatDateKey(date);
    
    // Regla: máximo 1 sello por día por cafetería
    if (!stampPassport.hasStamp(cafeId, dateKey)) {
      stampPassport.addStamp(cafeId, dateKey);
      return true; // Sello agregado
    }
    
    return false; // Ya tiene sello para este día en esta cafetería
  }

  formatDateKey(date) {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
