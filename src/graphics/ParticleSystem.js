import * as THREE from 'three';

const POOL_SIZE = 500;
const _color = new THREE.Color();
const _dummy = new THREE.Object3D();

class Particle {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.life = 0;
    this.maxLife = 1;
    this.size = 1;
    this.r = 1;
    this.g = 1;
    this.b = 1;
    this.gravity = 0;
    this.drag = 0;
    this.fadeOut = true;
  }
}

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      this.particles.push(new Particle());
    }

    // InstancedMesh with small plane geometry
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.InstancedMesh(geo, mat, POOL_SIZE);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;

    // Instance colors
    this.colorAttr = new THREE.InstancedBufferAttribute(
      new Float32Array(POOL_SIZE * 3), 3
    );
    this.colorAttr.setUsage(THREE.DynamicDrawUsage);
    this.mesh.instanceColor = this.colorAttr;

    // Hide all instances initially
    _dummy.scale.set(0, 0, 0);
    _dummy.updateMatrix();
    for (let i = 0; i < POOL_SIZE; i++) {
      this.mesh.setMatrixAt(i, _dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;

    scene.add(this.mesh);
  }

  allocate() {
    for (let i = 0; i < POOL_SIZE; i++) {
      if (!this.particles[i].active) return this.particles[i];
    }
    return null;
  }

  // ─── Explosion: radial burst ────────────────────────────────────────────────

  explosion(x, y, color = 0xff4400, count = 30) {
    _color.set(color);
    for (let i = 0; i < count; i++) {
      const p = this.allocate();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      p.active = true;
      p.x = x;
      p.y = y;
      p.z = 0;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.vz = (Math.random() - 0.5) * 20;
      p.life = 0.4 + Math.random() * 0.6;
      p.maxLife = p.life;
      p.size = 2 + Math.random() * 4;
      p.r = _color.r + (Math.random() - 0.5) * 0.2;
      p.g = _color.g + (Math.random() - 0.5) * 0.1;
      p.b = _color.b + (Math.random() - 0.5) * 0.1;
      p.gravity = -80;
      p.drag = 0.97;
      p.fadeOut = true;
    }
  }

  // ─── Spark: small fast particles for bullet impacts ─────────────────────────

  spark(x, y, color = 0xffff00, count = 10) {
    _color.set(color);
    for (let i = 0; i < count; i++) {
      const p = this.allocate();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 160;
      p.active = true;
      p.x = x;
      p.y = y;
      p.z = 0;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.vz = 0;
      p.life = 0.1 + Math.random() * 0.2;
      p.maxLife = p.life;
      p.size = 1 + Math.random() * 2;
      p.r = _color.r;
      p.g = _color.g;
      p.b = _color.b;
      p.gravity = 0;
      p.drag = 0.95;
      p.fadeOut = true;
    }
  }

  // ─── Trail: for bullets ─────────────────────────────────────────────────────

  trail(x, y, color = 0x88ffff, count = 3) {
    _color.set(color);
    for (let i = 0; i < count; i++) {
      const p = this.allocate();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 3;
      p.y = y + (Math.random() - 0.5) * 3;
      p.z = -0.1;
      p.vx = (Math.random() - 0.5) * 10;
      p.vy = -20 - Math.random() * 20;
      p.vz = 0;
      p.life = 0.1 + Math.random() * 0.15;
      p.maxLife = p.life;
      p.size = 1 + Math.random() * 1.5;
      p.r = _color.r;
      p.g = _color.g;
      p.b = _color.b;
      p.gravity = 0;
      p.drag = 1;
      p.fadeOut = true;
    }
  }

  // ─── Update all particles ───────────────────────────────────────────────────

  update(dt) {
    let needsUpdate = false;

    for (let i = 0; i < POOL_SIZE; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        _dummy.position.set(0, 0, -1000);
        _dummy.scale.set(0, 0, 0);
        _dummy.updateMatrix();
        this.mesh.setMatrixAt(i, _dummy.matrix);
        needsUpdate = true;
        continue;
      }

      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      const lifeRatio = p.life / p.maxLife;
      const scale = p.fadeOut ? p.size * lifeRatio : p.size;

      _dummy.position.set(p.x, p.y, p.z);
      _dummy.scale.set(scale, scale, scale);
      _dummy.updateMatrix();
      this.mesh.setMatrixAt(i, _dummy.matrix);

      // Fade color toward darker as particle dies
      const fade = p.fadeOut ? lifeRatio : 1;
      this.colorAttr.setXYZ(i, p.r * fade, p.g * fade, p.b * fade);

      needsUpdate = true;
    }

    if (needsUpdate) {
      this.mesh.instanceMatrix.needsUpdate = true;
      this.colorAttr.needsUpdate = true;
    }
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

export default ParticleSystem;
