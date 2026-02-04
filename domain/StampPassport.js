export class StampPassport {
  constructor(userId) {
    this.userId = userId;
    this.stamps = new Map(); // Map<cafeId, Set<dateKey>>
  }

  addStamp(cafeId, dateKey) {
    if (!this.stamps.has(cafeId)) {
      this.stamps.set(cafeId, new Set());
    }
    this.stamps.get(cafeId).add(dateKey);
  }

  hasStamp(cafeId, dateKey) {
    return this.stamps.has(cafeId) && this.stamps.get(cafeId).has(dateKey);
  }

  getStamps() {
    const result = {};
    for (const [cafeId, dateKeys] of this.stamps.entries()) {
      result[cafeId] = Array.from(dateKeys);
    }
    return result;
  }

  getStampCount(cafeId) {
    return this.stamps.has(cafeId) ? this.stamps.get(cafeId).size : 0;
  }
}
