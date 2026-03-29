import * as THREE from 'three';
const TYPE_CONFIG = {
  basic: { color: 0x00ff00, hp: 1 },
  tough: { color: 0xffff00, hp: 2 },
  elite: { color: 0xff0000, hp: 3 },
};

class Invader {
  constructor(x, y, type = 'basic') {
    const settings = TYPE_CONFIG[type] ?? TYPE_CONFIG.basic;

    this.type = TYPE_CONFIG[type] ? type : 'basic';
    this.hp = settings.hp;
    this.alive = true;
    this.position = new THREE.Vector3(x, y, 0);
    this.size = {
      width: 24,
      height: 16,
      depth: 8,
    };

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(this.size.width, this.size.height, this.size.depth),
      new THREE.MeshBasicMaterial({ color: settings.color })
    );
    this.mesh.position.copy(this.position);
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

    return false;
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

export default Invader;
