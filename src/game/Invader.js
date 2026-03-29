import * as THREE from 'three';
import { createInvader } from '../graphics/Models.js';

const TYPE_CONFIG = {
  basic: { color: 0x88ff44, hp: 1 },
  tough: { color: 0xffaa22, hp: 2 },
  elite: { color: 0xff4488, hp: 3 },
};

class Invader {
  constructor(x, y, type = 'basic') {
    const settings = TYPE_CONFIG[type] ?? TYPE_CONFIG.basic;

    this.type = TYPE_CONFIG[type] ? type : 'basic';
    this.hp = settings.hp;
    this.maxHp = settings.hp;
    this.alive = true;
    this.position = new THREE.Vector3(x, y, 0);
    this.size = {
      width: 24,
      height: 16,
      depth: 8,
    };

    // Use Models.js factory for visually distinct invader types
    this.mesh = createInvader(this.type);
    this.mesh.position.copy(this.position);

    this.flashTimer = 0;
  }

  setPosition(x, y) {
    this.position.set(x, y, 0);
    this.mesh.position.copy(this.position);
  }

  translate(dx, dy) {
    this.setPosition(this.position.x + dx, this.position.y + dy);
  }

  hit(damage = 1) {
    if (!this.alive) return false;

    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.mesh.visible = false;
      return true;
    }

    // Flash white on hit (not killed)
    this.flashTimer = 0.12;
    this.mesh.traverse((child) => {
      if (child.isMesh && child.material) {
        child.userData.originalColor = child.material.color.getHex();
        child.material.color.set(0xffffff);
      }
    });

    return false;
  }

  update(dt) {
    // Flash decay
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.flashTimer = 0;
        this.mesh.traverse((child) => {
          if (child.isMesh && child.userData.originalColor !== undefined) {
            child.material.color.set(child.userData.originalColor);
          }
        });
      }
    }
  }

  getBounds() {
    return {
      left: this.position.x - this.size.width / 2,
      right: this.position.x + this.size.width / 2,
      top: this.position.y + this.size.height / 2,
      bottom: this.position.y - this.size.height / 2,
    };
  }

  dispose() {
    this.mesh.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        child.material?.dispose();
      }
    });
  }
}

export default Invader;
