import * as THREE from 'three';
import CONFIG from '../utils/Config.js';
import { createBullet } from '../graphics/Models.js';

class Bullet {
  constructor(x, y, owner = 'player') {
    this.owner = owner;
    this.speed = owner === 'enemy' ? CONFIG.BULLET.ENEMY_SPEED : CONFIG.BULLET.SPEED;
    this.velocity = new THREE.Vector3(0, owner === 'enemy' ? -this.speed : this.speed, 0);
    this.position = new THREE.Vector3(x, y, 0);
    this.size = {
      width: 4,
      height: 12,
      depth: 4,
    };
    this.active = true;

    // Use Models.js factory for styled bullets
    this.mesh = createBullet(owner !== 'enemy');
    this.mesh.position.copy(this.position);
  }

  update(dt) {
    if (!this.active) return false;

    this.position.addScaledVector(this.velocity, dt * 60);
    this.mesh.position.copy(this.position);

    if (this.position.y < -20 || this.position.y > CONFIG.GAME.HEIGHT + 20) {
      this.active = false;
    }

    return this.active;
  }

  // Reset for pool reuse
  reset(x, y, owner = 'player') {
    this.owner = owner;
    this.speed = owner === 'enemy' ? CONFIG.BULLET.ENEMY_SPEED : CONFIG.BULLET.SPEED;
    this.velocity.set(0, owner === 'enemy' ? -this.speed : this.speed, 0);
    this.position.set(x, y, 0);
    this.mesh.position.copy(this.position);
    this.active = true;
    this.mesh.visible = true;
  }

  getBounds() {
    return {
      left: this.position.x - this.size.width / 2,
      right: this.position.x + this.size.width / 2,
      top: this.position.y + this.size.height / 2,
      bottom: this.position.y - this.size.height / 2,
    };
  }

  dispose(scene) {
    if (scene) {
      scene.remove(this.mesh);
    }
    this.mesh.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        child.material?.dispose();
      }
    });
  }
}

export default Bullet;
