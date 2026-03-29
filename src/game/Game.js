import Player from './Player.js';
import Config from '../utils/Config.js';

const State = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
};

class Game {
  constructor(renderer, input) {
    this.renderer = renderer;
    this.scene = renderer.scene;
    this.input = input;
    this.state = State.MENU;
    this.player = null;
    this.lastTime = 0;
    this.score = 0;
    this.running = false;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  loop(now) {
    if (!this.running) return;
    requestAnimationFrame((t) => this.loop(t));

    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // cap delta at 50ms
    this.lastTime = now;

    this.handleInput();
    this.update(dt);
    this.renderer.render();
    this.input.update();
  }

  handleInput() {
    switch (this.state) {
      case State.MENU:
        if (this.input.isPressed('Enter') || this.input.isPressed('Space')) {
          this.startGame();
        }
        break;
      case State.PLAYING:
        if (this.input.isPressed('KeyP') || this.input.isPressed('Escape')) {
          this.state = State.PAUSED;
        }
        break;
      case State.PAUSED:
        if (this.input.isPressed('KeyP') || this.input.isPressed('Escape')) {
          this.state = State.PLAYING;
        }
        break;
      case State.GAMEOVER:
        if (this.input.isPressed('Enter') || this.input.isPressed('Space')) {
          this.returnToMenu();
        }
        break;
    }
  }

  update(dt) {
    if (this.state !== State.PLAYING) return;

    this.player.update(dt, this.scene);

    if (!this.player.isAlive()) {
      this.state = State.GAMEOVER;
    }
  }

  startGame() {
    this.state = State.PLAYING;
    this.score = 0;

    if (this.player) {
      this.player.dispose(this.scene);
    }

    this.player = new Player(this.input);
    this.scene.add(this.player.mesh);
  }

  returnToMenu() {
    this.state = State.MENU;
    if (this.player) {
      this.player.dispose(this.scene);
      this.player = null;
    }
  }
}

export { State };
export default Game;
