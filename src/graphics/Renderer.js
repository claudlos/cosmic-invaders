import * as THREE from 'three';
import Config from '../utils/Config.js';
import PostFX from './PostFX.js';
import Background from './Background.js';

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
    this.postfx = null;
    this.background = null;
    this.ready = false;
    this.usePostFX = false;

    // Screen shake state
    this.shakeIntensity = 0;
    this.shakeDecay = 5;
    this.cameraBaseX = 0;
    this.cameraBaseY = 0;
  }

  async init() {
    // Try WebGPU first, fall back to WebGL
    let isWebGL = false;
    try {
      const { default: WebGPURenderer } = await import('three/src/renderers/webgpu/WebGPURenderer.js');
      this.renderer = new WebGPURenderer({ antialias: true });
      await this.renderer.init();
      console.log('Using WebGPU renderer');
    } catch (e) {
      console.warn('WebGPU not available, falling back to WebGL:', e.message);
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      isWebGL = true;
    }

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    // PostFX only works with WebGLRenderer (EffectComposer needs it)
    if (isWebGL) {
      try {
        this.postfx = new PostFX(this.renderer, this.scene, this.camera);
        this.postfx.crtPass.uniforms.uScanlineIntensity.value = 0.1;
        this.usePostFX = true;
        console.log('PostFX pipeline active');
      } catch (e) {
        console.warn('PostFX init failed:', e.message);
      }
    }

    // Background starfield
    this.background = new Background(this.scene);

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
    if (this.postfx) {
      this.postfx.setSize(renderWidth, renderHeight);
    }
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.left = `${(window.innerWidth - renderWidth) / 2}px`;
    this.renderer.domElement.style.top = `${(window.innerHeight - renderHeight) / 2}px`;
  }

  shake(intensity = 8) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  update(dt, time) {
    // Update background
    if (this.background) {
      this.background.update(dt);
    }

    // Update PostFX time
    if (this.postfx) {
      this.postfx.update(time);
    }

    // Screen shake decay
    if (this.shakeIntensity > 0.1) {
      const offX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      const offY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.camera.position.x = this.cameraBaseX + offX;
      this.camera.position.y = this.cameraBaseY + offY;
      this.shakeIntensity *= Math.max(0, 1 - this.shakeDecay * dt);
    } else {
      this.shakeIntensity = 0;
      this.camera.position.x = this.cameraBaseX;
      this.camera.position.y = this.cameraBaseY;
    }
  }

  render() {
    if (!this.ready) return;
    if (this.usePostFX) {
      this.postfx.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

export default Renderer;
