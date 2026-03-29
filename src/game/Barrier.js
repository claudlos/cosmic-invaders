import * as THREE from 'three';
import CONFIG from '../utils/Config.js';

class Barrier {
  constructor(x, y) {
    this.position = new THREE.Vector3(x, y, 0);
    this.blockSize = CONFIG.BARRIER.BLOCK_SIZE;
    this.group = new THREE.Group();
    this.blocks = [];

    this.createBlocks();
    this.group.position.copy(this.position);
  }

  createBlocks() {
    const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);

    for (let row = 0; row < CONFIG.BARRIER.BLOCKS_HIGH; row++) {
      for (let col = 0; col < CONFIG.BARRIER.BLOCKS_WIDE; col++) {
        if (this.isArchGap(row, col)) continue;

        const material = new THREE.MeshBasicMaterial({ color: 0x44dd88 });
        const mesh = new THREE.Mesh(geometry.clone(), material);
        mesh.position.set(
          (col - (CONFIG.BARRIER.BLOCKS_WIDE - 1) / 2) * this.blockSize,
          ((CONFIG.BARRIER.BLOCKS_HIGH - 1) / 2 - row) * this.blockSize,
          0
        );

        this.group.add(mesh);
        this.blocks.push({
          mesh,
          alive: true,
        });
      }
    }
  }

  isArchGap(row, col) {
    const bottomRow = CONFIG.BARRIER.BLOCKS_HIGH - 1;
    const leftLeg = col < 2;
    const rightLeg = col >= CONFIG.BARRIER.BLOCKS_WIDE - 2;

    if (row === bottomRow && !leftLeg && !rightLeg) return true;
    if (row === bottomRow - 1 && col >= 3 && col <= CONFIG.BARRIER.BLOCKS_WIDE - 4) return true;
    return false;
  }

  getBlockBounds(block) {
    const worldX = this.position.x + block.mesh.position.x;
    const worldY = this.position.y + block.mesh.position.y;
    const half = this.blockSize / 2;

    return {
      left: worldX - half,
      right: worldX + half,
      top: worldY + half,
      bottom: worldY - half,
    };
  }

  hitByBullet(bullet) {
    const bulletBounds = typeof bullet.getBounds === 'function' ? bullet.getBounds() : bullet;

    for (const block of this.blocks) {
      if (!block.alive) continue;

      const bounds = this.getBlockBounds(block);
      const overlap =
        bulletBounds.left <= bounds.right &&
        bulletBounds.right >= bounds.left &&
        bulletBounds.bottom <= bounds.top &&
        bulletBounds.top >= bounds.bottom;

      if (!overlap) continue;

      this.destroyBlock(block);
      return block;
    }

    return null;
  }

  destroyBlock(block) {
    block.alive = false;
    this.group.remove(block.mesh);
    block.mesh.geometry.dispose();
    block.mesh.material.dispose();
  }

  isDestroyed() {
    return this.blocks.every((block) => !block.alive);
  }

  dispose(scene) {
    for (const block of this.blocks) {
      if (block.alive) {
        block.mesh.geometry.dispose();
        block.mesh.material.dispose();
      }
    }

    if (scene) {
      scene.remove(this.group);
    }

    this.group.clear();
  }
}

export default Barrier;
