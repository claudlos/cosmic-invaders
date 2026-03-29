import * as THREE from 'three';
import CONFIG from '../utils/Config.js';

class PowerUp {
  constructor(x, y, type) {
    const availableTypes = CONFIG.POWERUPS.TYPES;

    this.type = availableTypes.includes(type)
      ? type
      : availableTypes[Math.floor(Math.random() * availableTypes.length)];
    this.position = new THREE.Vector3(x, y, 0);
    this.velocity = new THREE.Vector3(0, -2, 0);
    this.duration = CONFIG.POWERUPS.DURATION;
    this.active = true;
    this.size = {
      width: 16,
      height: 16,
      depth: 6,
    };

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(this.size.width, this.size.height, this.size.depth),
      new THREE.MeshBasicMaterial({ color: this.getColor() })
    );
    this.mesh.position.copy(this.position);
  }

  static maybeDrop(x, y) {
    if (Math.random() >= CONFIG.POWERUPS.CHANCE) return null;
    return new PowerUp(x, y);
  }

  getColor() {
    switch (this.type) {
      case 'speed':
        return 0x44ccff;
      case 'multishot':
        return 0xff66cc;
      case 'shield':
        return 0x66ff66;
      default:
        return 0xffffff;
    }
  }

  update(dt) {
    if (!this.active) return false;

    this.position.addScaledVector(this.velocity, dt * 60);
    this.mesh.position.copy(this.position);

    if (this.position.y < -20) {
      this.active = false;
    }

    return this.active;
  }

  collect(player) {
    if (!this.active) return null;
    this.active = false;

    return {
      type: this.type,
      duration: this.duration,
      player,
    };
  }

  checkCollected(player) {
    if (!this.active || !player?.mesh?.position) return null;
    if (!this.intersectsPlayer(player)) return null;
    return this.collect(player);
  }

  intersectsPlayer(player) {
    const playerBounds = {
      left: player.mesh.position.x - 12,
      right: player.mesh.position.x + 12,
      top: player.mesh.position.y + 20,
      bottom: player.mesh.position.y - 10,
    };

    const bounds = this.getBounds();
    return (
      bounds.left <= playerBounds.right &&
      bounds.right >= playerBounds.left &&
      bounds.bottom <= playerBounds.top &&
      bounds.top >= playerBounds.bottom
    );
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

export default PowerUp;
