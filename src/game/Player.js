import * as THREE from 'three';
import Config from '../utils/Config.js';

class Player {
  constructor(input) {
    this.input = input;
    this.lives = Config.PLAYER.LIVES;
    this.speed = Config.PLAYER.SPEED;
    this.fireRate = Config.PLAYER.FIRE_RATE;
    this.lastFireTime = 0;
    this.bullets = [];
    this.invincibleUntil = 0;

    // Ship group
    this.mesh = new THREE.Group();

    // Main body — triangle/arrow shape
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(0, 20);
    bodyShape.lineTo(-12, -10);
    bodyShape.lineTo(-4, -6);
    bodyShape.lineTo(0, -8);
    bodyShape.lineTo(4, -6);
    bodyShape.lineTo(12, -10);
    bodyShape.closePath();

    const bodyGeo = new THREE.ShapeGeometry(bodyShape);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.mesh.add(body);

    // Cockpit accent
    const cockpitGeo = new THREE.CircleGeometry(3, 8);
    const cockpitMat = new THREE.MeshBasicMaterial({ color: 0x88ffcc });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 6, 0.1);
    this.mesh.add(cockpit);

    // Start at bottom center
    this.mesh.position.set(Config.GAME.WIDTH / 2, 40, 0);

    // Bullet geometry (shared)
    this.bulletGeo = new THREE.PlaneGeometry(3, 10);
    this.bulletMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  }

  update(dt, scene) {
    const now = performance.now();

    // Movement
    if (this.input.isDown('ArrowLeft') || this.input.isDown('KeyA')) {
      this.mesh.position.x -= this.speed * dt * 60;
    }
    if (this.input.isDown('ArrowRight') || this.input.isDown('KeyD')) {
      this.mesh.position.x += this.speed * dt * 60;
    }

    // Clamp to screen
    this.mesh.position.x = Math.max(15, Math.min(Config.GAME.WIDTH - 15, this.mesh.position.x));

    // Shooting
    if (this.input.isDown('Space') && now - this.lastFireTime >= this.fireRate) {
      this.shoot(scene, now);
    }

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.position.y += Config.BULLET.SPEED * dt * 60;
      if (b.position.y > Config.GAME.HEIGHT + 10) {
        scene.remove(b);
        this.bullets.splice(i, 1);
      }
    }

    // Invincibility blink
    if (now < this.invincibleUntil) {
      this.mesh.visible = Math.floor(now / 100) % 2 === 0;
    } else {
      this.mesh.visible = true;
    }
  }

  shoot(scene, now) {
    this.lastFireTime = now;
    const bullet = new THREE.Mesh(this.bulletGeo, this.bulletMat);
    bullet.position.set(this.mesh.position.x, this.mesh.position.y + 20, 0);
    scene.add(bullet);
    this.bullets.push(bullet);
  }

  hit(now) {
    if (now < this.invincibleUntil) return false;
    this.lives--;
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
    this.lastFireTime = 0;
  }

  dispose(scene) {
    for (const b of this.bullets) {
      scene.remove(b);
    }
    this.bullets.length = 0;
    scene.remove(this.mesh);
  }
}

export default Player;
