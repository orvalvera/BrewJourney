export class ReviewMemento {
  constructor(state) {
    this.state = { ...state };
  }

  getState() {
    return { ...this.state };
  }
}
