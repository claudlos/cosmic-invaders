import * as THREE from 'three';
import Config from '../utils/Config.js';

const W = Config.GAME.WIDTH;
const H = Config.GAME.HEIGHT;

class Background {
  constructor(scene) {
    this.scene = scene;
    this.layers = [];

    // Three parallax star layers
    this.layers.push(this.createStarLayer(200, 0.3, 0.5, 2.5)); // far: slow, dim, small
    this.layers.push(this.createStarLayer(120, 0.6, 1.0, 4.0)); // mid
    this.layers.push(this.createStarLayer(60, 1.0, 1.5, 6.0));  // near: fast, bright, large

    // Nebula backdrop
    this.nebula = this.createNebula();
    scene.add(this.nebula);
  }

  createStarLayer(count, brightnessBase, sizeBase, speed) {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = Math.random() * W;
      positions[i * 3 + 1] = Math.random() * H;
      positions[i * 3 + 2] = -5;

      sizes[i] = sizeBase + Math.random() * sizeBase;

      // Slight color variation: bluish-white to warm-white
      const warmth = Math.random();
      const b = brightnessBase + Math.random() * (1 - brightnessBase);
      colors[i * 3] = b * (0.8 + warmth * 0.2);
      colors[i * 3 + 1] = b * (0.85 + warmth * 0.1);
      colors[i * 3 + 2] = b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom ShaderMaterial to support per-vertex star sizes
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute float aSize;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          // Soft circular point
          float d = length(gl_PointCoord - vec2(0.5));
          float alpha = 1.0 - smoothstep(0.3, 0.5, d);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      vertexColors: true,
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    return { points, speed, positions, count };
  }

  createNebula() {
    // Generate a procedural noise texture for the nebula
    const size = 256;
    const data = new Uint8Array(size * size * 4);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const nx = x / size;
        const ny = y / size;

        // Layered pseudo-noise
        let v = 0;
        v += this.noise2D(nx * 3, ny * 3) * 0.5;
        v += this.noise2D(nx * 6, ny * 6) * 0.25;
        v += this.noise2D(nx * 12, ny * 12) * 0.125;
        v = Math.max(0, v - 0.2) * 1.5;

        // Purple/blue nebula colors
        data[i] = v * 30;      // R
        data[i + 1] = v * 15;  // G
        data[i + 2] = v * 80;  // B
        data[i + 3] = v * 60;  // A
      }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(W * 1.5, H * 1.5);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(W / 2, H / 2, -8);
    return mesh;
  }

  // Simple deterministic 2D noise (value noise)
  noise2D(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    const h = (a, b) => {
      let n = a * 127.1 + b * 311.7;
      n = Math.sin(n) * 43758.5453;
      return n - Math.floor(n);
    };

    const v00 = h(ix, iy);
    const v10 = h(ix + 1, iy);
    const v01 = h(ix, iy + 1);
    const v11 = h(ix + 1, iy + 1);

    const a = v00 + sx * (v10 - v00);
    const b = v01 + sx * (v11 - v01);
    return a + sy * (b - a);
  }

  update(dt) {
    for (const layer of this.layers) {
      const posAttr = layer.points.geometry.getAttribute('position');
      const arr = posAttr.array;
      for (let i = 0; i < layer.count; i++) {
        arr[i * 3 + 1] -= layer.speed * dt * 60;
        // Wrap around when star goes below screen
        if (arr[i * 3 + 1] < -5) {
          arr[i * 3 + 1] = H + 5;
          arr[i * 3] = Math.random() * W;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Slow nebula drift
    this.nebula.position.y -= 0.3 * dt * 60;
    if (this.nebula.position.y < -H * 0.25) {
      this.nebula.position.y = H * 0.75;
    }
  }

  dispose() {
    for (const layer of this.layers) {
      this.scene.remove(layer.points);
      layer.points.geometry.dispose();
      layer.points.material.dispose();
    }
    this.scene.remove(this.nebula);
    this.nebula.geometry.dispose();
    this.nebula.material.map.dispose();
    this.nebula.material.dispose();
  }
}

export default Background;
