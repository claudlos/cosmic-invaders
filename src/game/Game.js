import Config from '../utils/Config.js';
import Player from './Player.js';
import InvaderGrid from './InvaderGrid.js';
import Bullet from './Bullet.js';
import Barrier from './Barrier.js';
import Collision from './Collision.js';
import PowerUp from './PowerUp.js';
import Score from './Score.js';

const State = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
};

class Game {
  constructor(renderer, input, systems = {}) {
    this.renderer = renderer;
    this.scene = renderer.scene;
    this.input = input;
    this.background = systems.background ?? null;
    this.particleSystem = systems.particleSystem ?? null;
    this.postFX = systems.postFX ?? null;
    this.audioManager = systems.audioManager ?? null;
    this.hud = systems.hud ?? null;
    this.menu = systems.menu ?? null;
    this.models = systems.models ?? {};
    this.ScoreClass = systems.classes?.Score ?? Score;
    this.PlayerClass = systems.classes?.Player ?? Player;
    this.InvaderGridClass = systems.classes?.InvaderGrid ?? InvaderGrid;
    this.score = systems.score ?? new this.ScoreClass();

    this.state = State.MENU;
    this.player = null;
    this.invaderGrid = null;
    this.barriers = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.powerUps = [];
    this.lastTime = 0;
    this.running = false;

    this.menu?.showTitle();
    this.hud?.setVisible(false);
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  loop(now) {
    if (!this.running) return;
    requestAnimationFrame((t) => this.loop(t));

    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.handleInput(now);
    this.update(dt, now);

    if (this.postFX) {
      this.postFX.update(now / 1000);
      this.postFX.render();
    } else {
      this.renderer.render();
    }

    this.input.update();
  }

  handleInput(now) {
    switch (this.state) {
      case State.MENU:
        if (this.input.isPressed('Enter') || this.input.isPressed('Space')) {
          this.audioManager?.resume();
          this.startGame();
        }
        break;
      case State.PLAYING:
        if (this.input.isPressed('KeyP') || this.input.isPressed('Escape')) {
          this.setState(State.PAUSED);
        }
        if (this.input.isDown('Space')) {
          this.firePlayerBullets(now);
        }
        break;
      case State.PAUSED:
        if (this.input.isPressed('KeyP') || this.input.isPressed('Escape')) {
          this.setState(State.PLAYING);
        }
        break;
      case State.GAMEOVER:
        if (this.input.isPressed('Enter') || this.input.isPressed('Space')) {
          this.audioManager?.resume();
          this.startGame();
        }
        break;
    }
  }

  update(dt, now) {
    this.background?.update(dt);
    this.particleSystem?.update(dt);

    if (this.state === State.PLAYING) {
      this.updatePlaying(dt, now);
    }

    this.score.update(dt);
    this.hud?.update({
      score: this.score.score,
      lives: this.player?.lives ?? this.score.lives,
      wave: this.score.wave,
      highScore: this.score.getHighScore(),
      combo: this.score.combo,
    });
  }

  updatePlaying(dt, now) {
    this.player?.update(dt);
    this.invaderGrid?.update(dt, (x, y, owner) => this.spawnEnemyBullet(x, y, owner));

    this.updateBullets(this.playerBullets, dt, 0x88ffff);
    this.updateBullets(this.enemyBullets, dt, 0xff6666);
    this.updatePowerUps(dt);
    this.handleCollisions(now);

    if (this.invaderGrid && this.invaderGrid.getAliveInvaders().length === 0) {
      this.audioManager?.playWaveClear();
      this.score.nextWave();
      this.startNextWave();
    }

    if (this.invaderGrid && this.player) {
      const lowestInvader = this.invaderGrid.getLowestY();
      if (lowestInvader !== null && lowestInvader <= this.player.mesh.position.y + 20) {
        this.triggerGameOver();
      }
    }

    this.score.setLives(this.player?.lives ?? 0);
  }

  updateBullets(bullets, dt, trailColor) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      const active = bullet.update(dt);

      if (active) {
        this.particleSystem?.trail(bullet.position.x, bullet.position.y, trailColor, 1);
        continue;
      }

      bullet.dispose(this.scene);
      bullets.splice(i, 1);
    }
  }

  updatePowerUps(dt) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      const active = powerUp.update(dt);

      if (active) {
        const collected = powerUp.checkCollected(this.player);
        if (collected) {
          this.player.applyPowerUp(collected.type, performance.now(), collected.duration);
          this.audioManager?.playPowerUp();
          powerUp.dispose(this.scene);
          this.powerUps.splice(i, 1);
        }
        continue;
      }

      powerUp.dispose(this.scene);
      this.powerUps.splice(i, 1);
    }
  }

  handleCollisions(now) {
    const invaders = this.invaderGrid?.getAliveInvaders() ?? [];

    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];
      const barrierHit = Collision.bulletVsBarrier(bullet, this.barriers);
      if (barrierHit) {
        this.particleSystem?.spark(bullet.position.x, bullet.position.y, 0x44dd88, 8);
      }

      if (!bullet.active) continue;

      const invaderHit = Collision.bulletVsInvader(bullet, invaders);
      if (!invaderHit) continue;

      this.particleSystem?.spark(bullet.position.x, bullet.position.y, 0xffff00, 10);
      if (invaderHit.killed) {
        this.particleSystem?.explosion(invaderHit.invader.position.x, invaderHit.invader.position.y, 0xff8844, 24);
        this.audioManager?.playExplosion();
        this.score.addKill(invaderHit.invader.type);

        const powerUp = PowerUp.maybeDrop(invaderHit.invader.position.x, invaderHit.invader.position.y);
        if (powerUp) {
          this.scene.add(powerUp.mesh);
          this.powerUps.push(powerUp);
        }
      }
    }

    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      const barrierHit = Collision.bulletVsBarrier(bullet, this.barriers);
      if (barrierHit) {
        this.particleSystem?.spark(bullet.position.x, bullet.position.y, 0xff4444, 8);
      }

      if (!bullet.active || !this.player) continue;

      const playerHit = Collision.bulletVsPlayer(bullet, this.player);
      if (!playerHit) continue;

      if (this.player.hit(now)) {
        this.score.loseLife();
        this.audioManager?.playPlayerHit();
        this.particleSystem?.explosion(this.player.mesh.position.x, this.player.mesh.position.y, 0x44aaff, 18);
      }

      if (!this.player.isAlive()) {
        this.triggerGameOver();
      }
    }
  }

  firePlayerBullets(now) {
    if (!this.player || !this.player.canShoot(now)) return;

    this.player.markShot(now);
    for (const offset of this.player.getShotOffsets(now)) {
      const bullet = new Bullet(this.player.mesh.position.x + offset, this.player.mesh.position.y + 22, 'player');
      this.playerBullets.push(bullet);
      this.scene.add(bullet.mesh);
    }

    this.audioManager?.playShoot();
  }

  spawnEnemyBullet(x, y) {
    const bullet = new Bullet(x, y - 12, 'enemy');
    this.enemyBullets.push(bullet);
    this.scene.add(bullet.mesh);
    this.audioManager?.playEnemyShoot();
    return bullet;
  }

  startGame() {
    this.clearGameplay();
    this.score.reset();
    this.createPlayer();
    this.createBarriers();
    this.createInvaderWave();
    this.setState(State.PLAYING);
  }

  startNextWave() {
    this.disposeInvaderGrid();
    this.clearArray(this.enemyBullets);
    this.clearArray(this.powerUps);
    this.createInvaderWave();
  }

  createPlayer() {
    this.player = new this.PlayerClass(this.input, {
      modelFactory: this.models.createPlayerShip,
    });
    this.scene.add(this.player.mesh);
  }

  createInvaderWave() {
    this.invaderGrid = new this.InvaderGridClass(this.scene);
  }

  createBarriers() {
    const spacing = Config.GAME.WIDTH / (Config.BARRIER.COUNT + 1);
    const y = 110;

    for (let i = 0; i < Config.BARRIER.COUNT; i++) {
      const barrier = new Barrier(spacing * (i + 1), y);
      this.barriers.push(barrier);
      this.scene.add(barrier.group);
    }
  }

  clearGameplay() {
    this.disposeInvaderGrid();
    this.clearArray(this.playerBullets);
    this.clearArray(this.enemyBullets);
    this.clearArray(this.powerUps);

    for (const barrier of this.barriers) {
      barrier.dispose(this.scene);
    }
    this.barriers.length = 0;

    if (this.player) {
      this.player.dispose(this.scene);
      this.player = null;
    }
  }

  disposeInvaderGrid() {
    if (!this.invaderGrid) return;

    this.invaderGrid.dispose(this.scene);
    this.invaderGrid = null;
  }

  clearArray(items) {
    for (const item of items) {
      item.dispose?.(this.scene);
    }
    items.length = 0;
  }

  triggerGameOver() {
    this.score.saveHighScore();
    this.audioManager?.playGameOver();
    this.setState(State.GAMEOVER);
  }

  setState(state) {
    this.state = state;

    switch (state) {
      case State.MENU:
        this.hud?.setVisible(false);
        this.menu?.showTitle();
        break;
      case State.PLAYING:
        this.hud?.setVisible(true);
        this.menu?.hide();
        break;
      case State.PAUSED:
        this.hud?.setVisible(true);
        this.menu?.showPause();
        break;
      case State.GAMEOVER:
        this.hud?.setVisible(true);
        this.menu?.showGameOver({
          score: this.score.score,
          highScore: this.score.getHighScore(),
          wave: this.score.wave,
        });
        break;
    }
  }
}

export { State };
export default Game;
