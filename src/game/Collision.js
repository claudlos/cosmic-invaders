import * as THREE from 'three';
class Collision {
  static checkAABB(a, b) {
    if (!a || !b) return false;

    const aBounds = typeof a.getBounds === 'function' ? a.getBounds() : a;
    const bBounds = typeof b.getBounds === 'function' ? b.getBounds() : b;

    return (
      aBounds.left <= bBounds.right &&
      aBounds.right >= bBounds.left &&
      aBounds.bottom <= bBounds.top &&
      aBounds.top >= bBounds.bottom
    );
  }

  static bulletVsInvader(bullet, invaders) {
    if (!bullet?.active) return null;

    for (const invader of invaders) {
      if (!invader?.alive) continue;
      if (!this.checkAABB(bullet, invader)) continue;

      const killed = invader.hit(1);
      bullet.active = false;

      return {
        hit: true,
        bullet,
        invader,
        killed,
      };
    }

    return null;
  }

  static bulletVsPlayer(bullet, player) {
    if (!bullet?.active || !player?.mesh?.position) return null;
    if (!this.checkAABB(bullet, this.getPlayerBounds(player))) return null;

    bullet.active = false;

    return {
      hit: true,
      bullet,
      player,
    };
  }

  static bulletVsBarrier(bullet, barriers) {
    if (!bullet?.active) return null;

    for (const barrier of barriers) {
      if (!barrier) continue;

      const block = barrier.hitByBullet(bullet);
      if (!block) continue;

      bullet.active = false;

      return {
        hit: true,
        bullet,
        barrier,
        block,
      };
    }

    return null;
  }

  static getPlayerBounds(player) {
    const position = player.mesh.position instanceof THREE.Vector3
      ? player.mesh.position
      : new THREE.Vector3(player.mesh.position.x, player.mesh.position.y, 0);

    return {
      left: position.x - 12,
      right: position.x + 12,
      top: position.y + 20,
      bottom: position.y - 10,
    };
  }
}

export default Collision;
