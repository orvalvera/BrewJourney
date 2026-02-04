export class StampRuleStrategy {
  applyVisit(userId, cafeId, date, stampPassport) {
    throw new Error("applyVisit() debe ser implementado por la subclase");
  }
}
