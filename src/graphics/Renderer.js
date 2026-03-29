import * as THREE from 'three';
import Config from '../utils/Config.js';

class Renderer {
  constructor() {
    this.width = Config.GAME.WIDTH;
    this.height = Config.GAME.HEIGHT;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000011);

    // Orthographic camera: origin at bottom-left, units = pixels
    const w = this.width;
    const h = this.height;
    this.camera = new THREE.OrthographicCamera(0, w, h, 0, -100, 100);
    this.camera.position.z = 10;

    this.renderer = null;
    this.ready = false;
  }

  async init() {
    // Try WebGPU first, fall back to WebGL
    try {
      const { default: WebGPURenderer } = await import('three/src/renderers/webgpu/WebGPURenderer.js');
      this.renderer = new WebGPURenderer({ antialias: true });
      await this.renderer.init();
      console.log('Using WebGPU renderer');
    } catch (e) {
      console.warn('WebGPU not available, falling back to WebGL:', e.message);
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
    }

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this.onResize());
    this.onResize();

    this.ready = true;
  }

  onResize() {
    const aspect = this.width / this.height;
    const windowAspect = window.innerWidth / window.innerHeight;

    let renderWidth, renderHeight;
    if (windowAspect > aspect) {
      renderHeight = window.innerHeight;
      renderWidth = renderHeight * aspect;
    } else {
      renderWidth = window.innerWidth;
      renderHeight = renderWidth / aspect;
    }

    this.renderer.setSize(renderWidth, renderHeight);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.left = `${(window.innerWidth - renderWidth) / 2}px`;
    this.renderer.domElement.style.top = `${(window.innerHeight - renderHeight) / 2}px`;
  }

  render() {
    if (this.ready) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

export default Renderer;
