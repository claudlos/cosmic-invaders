import * as THREE from 'three';
import Config from '../utils/Config.js';

class Player {
  constructor(input, options = {}) {
    this.input = input;
    this.lives = Config.PLAYER.LIVES;
    this.baseSpeed = Config.PLAYER.SPEED;
    this.fireRate = Config.PLAYER.FIRE_RATE;
    this.lastFireTime = 0;
    this.invincibleUntil = 0;
    this.speedUntil = 0;
    this.multishotUntil = 0;
    this.shieldUntil = 0;

    this.mesh = options.modelFactory ? options.modelFactory() : this.createDefaultMesh();
    this.mesh.position.set(Config.GAME.WIDTH / 2, 40, 0);
  }

  createDefaultMesh() {
    const group = new THREE.Group();

    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(0, 20);
    bodyShape.lineTo(-12, -10);
    bodyShape.lineTo(-4, -6);
    bodyShape.lineTo(0, -8);
    bodyShape.lineTo(4, -6);
    bodyShape.lineTo(12, -10);
    bodyShape.closePath();

    const body = new THREE.Mesh(
      new THREE.ShapeGeometry(bodyShape),
      new THREE.MeshBasicMaterial({ color: 0x00ff88 })
    );
    group.add(body);

    const cockpit = new THREE.Mesh(
      new THREE.CircleGeometry(3, 8),
      new THREE.MeshBasicMaterial({ color: 0x88ffcc })
    );
    cockpit.position.set(0, 6, 0.1);
    group.add(cockpit);

    return group;
  }

  update(dt) {
    const now = performance.now();
    const speedMultiplier = now < this.speedUntil ? 1.75 : 1;
    const movementSpeed = this.baseSpeed * speedMultiplier;

    if (this.input.isDown('ArrowLeft') || this.input.isDown('KeyA')) {
      this.mesh.position.x -= movementSpeed * dt * 60;
    }
    if (this.input.isDown('ArrowRight') || this.input.isDown('KeyD')) {
      this.mesh.position.x += movementSpeed * dt * 60;
    }

    this.mesh.position.x = Math.max(15, Math.min(Config.GAME.WIDTH - 15, this.mesh.position.x));
    this.mesh.visible = now >= this.invincibleUntil || Math.floor(now / 100) % 2 === 0;
  }

  canShoot(now) {
    return now - this.lastFireTime >= this.fireRate;
  }

  markShot(now) {
    this.lastFireTime = now;
  }

  getShotOffsets(now) {
    return now < this.multishotUntil ? [-12, 0, 12] : [0];
  }

  applyPowerUp(type, now, duration = Config.POWERUPS.DURATION) {
    switch (type) {
      case 'speed':
        this.speedUntil = now + duration;
        break;
      case 'multishot':
        this.multishotUntil = now + duration;
        break;
      case 'shield':
        this.shieldUntil = now + duration;
        this.invincibleUntil = Math.max(this.invincibleUntil, now + duration);
        break;
    }
  }

  hit(now) {
    if (now < this.invincibleUntil || now < this.shieldUntil) return false;

    this.lives -= 1;
    this.invincibleUntil = now + Config.PLAYER.INVINCIBILITY_MS;
    return true;
  }

  isAlive() {
    return this.lives > 0;
  }

  reset() {
    this.lives = Config.PLAYER.LIVES;
    this.mesh.position.set(Config.GAME.WIDTH / 2, 40, 0);
    this.invincibleUntil = 0;
    this.speedUntil = 0;
    this.multishotUntil = 0;
    this.shieldUntil = 0;
    this.lastFireTime = 0;
    this.mesh.visible = true;
  }

  dispose(scene) {
    if (scene) {
      scene.remove(this.mesh);
    }

    this.mesh.traverse((child) => {
      if (!child.isMesh) return;
      child.geometry?.dispose();

      if (Array.isArray(child.material)) {
        for (const material of child.material) {
          material.dispose();
        }
      } else {
        child.material?.dispose();
      }
    });
  }
}

export default Player;
