import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ─── Custom CRT Scanline Shader ──────────────────────────────────────────────

const CRTShader = {
  name: 'CRTShader',
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uScanlineIntensity: { value: 0.12 },
    uScanlineCount: { value: 300.0 },
    uFlickerSpeed: { value: 8.0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uScanlineIntensity;
    uniform float uScanlineCount;
    uniform float uFlickerSpeed;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Scanlines
      float scanline = sin(vUv.y * uScanlineCount * 3.14159) * 0.5 + 0.5;
      scanline = pow(scanline, 1.5) * uScanlineIntensity;

      // Subtle vertical roll flicker
      float flicker = 1.0 - uScanlineIntensity * 0.3 * (0.5 + 0.5 * sin(uTime * uFlickerSpeed));

      color.rgb -= scanline;
      color.rgb *= flicker;

      gl_FragColor = color;
    }
  `,
};

// ─── Chromatic Aberration Shader ─────────────────────────────────────────────

const ChromaticAberrationShader = {
  name: 'ChromaticAberrationShader',
  uniforms: {
    tDiffuse: { value: null },
    uOffset: { value: 0.003 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uOffset;
    varying vec2 vUv;

    void main() {
      vec2 dir = vUv - vec2(0.5);
      float dist = length(dir);
      float offset = uOffset * dist;

      float r = texture2D(tDiffuse, vUv + dir * offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - dir * offset).b;
      float a = texture2D(tDiffuse, vUv).a;

      gl_FragColor = vec4(r, g, b, a);
    }
  `,
};

// ─── Vignette Shader ─────────────────────────────────────────────────────────

const VignetteShader = {
  name: 'VignetteShader',
  uniforms: {
    tDiffuse: { value: null },
    uIntensity: { value: 0.4 },
    uSmoothness: { value: 0.5 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uIntensity;
    uniform float uSmoothness;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 uv = vUv * (1.0 - vUv);
      float vignette = uv.x * uv.y * 15.0;
      vignette = pow(vignette, uIntensity * uSmoothness);
      color.rgb *= vignette;
      gl_FragColor = color;
    }
  `,
};

// ─── PostFX Pipeline ─────────────────────────────────────────────────────────

class PostFX {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.composer = new EffectComposer(renderer);

    // 1. Render scene
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // 2. Bloom — use logical size, not device pixels
    const resolution = renderer.getSize(new THREE.Vector2());
    this.bloomPass = new UnrealBloomPass(resolution, 0.8, 0.4, 0.85);
    this.composer.addPass(this.bloomPass);

    // 3. CRT scanlines
    this.crtPass = new ShaderPass(CRTShader);
    this.composer.addPass(this.crtPass);

    // 4. Chromatic aberration
    this.chromaPass = new ShaderPass(ChromaticAberrationShader);
    this.composer.addPass(this.chromaPass);

    // 5. Vignette
    this.vignettePass = new ShaderPass(VignetteShader);
    this.composer.addPass(this.vignettePass);

    // 6. Output (tone mapping + color space)
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  update(time) {
    this.crtPass.uniforms.uTime.value = time;
  }

  render() {
    this.composer.render();
  }

  setSize(width, height) {
    this.composer.setSize(width, height);
  }
}

export default PostFX;
