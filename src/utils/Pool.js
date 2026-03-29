class Pool {
  constructor(factory, initialSize = 20) {
    this.factory = factory;
    this.pool = [];
    this.active = [];

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  get() {
    const obj = this.pool.length > 0 ? this.pool.pop() : this.factory();
    this.active.push(obj);
    return obj;
  }

  release(obj) {
    const idx = this.active.indexOf(obj);
    if (idx !== -1) {
      this.active.splice(idx, 1);
      this.pool.push(obj);
    }
  }

  releaseAll() {
    while (this.active.length > 0) {
      this.pool.push(this.active.pop());
    }
  }

  getActive() {
    return this.active;
  }

  forEach(fn) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      fn(this.active[i], i);
    }
  }
}

export default Pool;
