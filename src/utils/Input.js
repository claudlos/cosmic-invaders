class Input {
  constructor() {
    this.keys = new Set();
    this.justPressed = new Set();
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  onKeyDown(e) {
    if (!this.keys.has(e.code)) {
      this.justPressed.add(e.code);
    }
    this.keys.add(e.code);
    e.preventDefault();
  }

  onKeyUp(e) {
    this.keys.delete(e.code);
  }

  isDown(code) {
    return this.keys.has(code);
  }

  isPressed(code) {
    return this.justPressed.has(code);
  }

  update() {
    this.justPressed.clear();
  }
}

export default Input;
