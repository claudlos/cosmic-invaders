import * as THREE from 'three';
import CONFIG from '../utils/Config.js';
import Invader from './Invader.js';

class InvaderGrid {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.invaders = [];
    this.direction = 1;
    this.baseSpeed = CONFIG.INVADER.SPEED;
    this.spacing = { x: 48, y: 36 };
    this.margin = { x: 48, top: 80 };
    this.invaderSize = { width: 24, height: 16 };
    this.totalInvaders = CONFIG.INVADER.ROWS * CONFIG.INVADER.COLS;

    this.createFormation();

    if (this.scene) {
      this.scene.add(this.group);
    }
  }

  createFormation() {
    const formationWidth = (CONFIG.INVADER.COLS - 1) * this.spacing.x;
    const startX = this.margin.x + this.invaderSize.width / 2;
    const offsetX = (CONFIG.GAME.WIDTH - formationWidth - this.invaderSize.width) / 2;

    for (let row = 0; row < CONFIG.INVADER.ROWS; row++) {
      const invaderRow = [];
      const type = CONFIG.INVADER.TYPES[Math.min(row, CONFIG.INVADER.TYPES.length - 1)];
      const y = CONFIG.GAME.HEIGHT - this.margin.top - row * this.spacing.y;

      for (let col = 0; col < CONFIG.INVADER.COLS; col++) {
        const x = startX + offsetX + col * this.spacing.x;
        const invader = new Invader(x, y, type);
        invaderRow.push(invader);
        this.group.add(invader.mesh);
      }

      this.invaders.push(invaderRow);
    }
  }

  update(dt, bulletFactory) {
    const aliveInvaders = this.getAliveInvaders();
    if (aliveInvaders.length === 0) return;

    const speedMultiplier = 1 + (this.totalInvaders - aliveInvaders.length) / this.totalInvaders;
    const step = this.baseSpeed * speedMultiplier * dt * 60;

    let minX = Infinity;
    let maxX = -Infinity;

    for (const invader of aliveInvaders) {
      const bounds = invader.getBounds();
      minX = Math.min(minX, bounds.left);
      maxX = Math.max(maxX, bounds.right);
    }

    const hitRightEdge = this.direction > 0 && maxX + step >= CONFIG.GAME.WIDTH;
    const hitLeftEdge = this.direction < 0 && minX - step <= 0;

    if (hitRightEdge || hitLeftEdge) {
      for (const invader of aliveInvaders) {
        invader.translate(0, -CONFIG.INVADER.DROP_DISTANCE);
      }
      this.direction *= -1;
    } else {
      for (const invader of aliveInvaders) {
        invader.translate(step * this.direction, 0);
      }
    }

    this.tryShoot(bulletFactory);
  }

  tryShoot(bulletFactory) {
    if (typeof bulletFactory !== 'function') return null;
    if (Math.random() >= CONFIG.INVADER.FIRE_CHANCE) return null;

    const shooters = [];

    for (let col = 0; col < CONFIG.INVADER.COLS; col++) {
      for (let row = CONFIG.INVADER.ROWS - 1; row >= 0; row--) {
        const invader = this.invaders[row]?.[col];
        if (invader?.alive) {
          shooters.push(invader);
          break;
        }
      }
    }

    if (shooters.length === 0) return null;

    const shooter = shooters[Math.floor(Math.random() * shooters.length)];
    return bulletFactory(shooter.position.x, shooter.position.y - this.invaderSize.height / 2, 'enemy', shooter);
  }

  getAliveInvaders() {
    return this.invaders.flat().filter((invader) => invader.alive);
  }

  getLowestY() {
    const aliveInvaders = this.getAliveInvaders();
    if (aliveInvaders.length === 0) return null;
    return Math.min(...aliveInvaders.map((invader) => invader.position.y - this.invaderSize.height / 2));
  }

  dispose(scene = this.scene) {
    for (const invader of this.invaders.flat()) {
      invader.dispose();
    }

    if (scene) {
      scene.remove(this.group);
    }

    this.group.clear();
  }
}

export default InvaderGrid;
