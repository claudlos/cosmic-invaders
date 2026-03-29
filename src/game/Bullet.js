import * as THREE from 'three';
import CONFIG from '../utils/Config.js';

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

    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(this.size.width / 2, this.size.width / 2, this.size.height, 10),
      new THREE.MeshBasicMaterial({
        color: owner === 'enemy' ? 0xff4444 : 0x00ffff,
      })
    );
    this.mesh.rotation.z = Math.PI / 2;
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

    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

export default Bullet;
