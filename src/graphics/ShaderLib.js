import * as THREE from 'three';

// ─── Glow Shader ─────────────────────────────────────────────────────────────
// Pulsing emissive effect for enemies and player.
// Uses standard ShaderMaterial with time-driven emission pulse.

export const GlowShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x00ffaa) },
    uEmissiveIntensity: { value: 1.5 },
    uPulseSpeed: { value: 2.0 },
    uPulseMin: { value: 0.6 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uEmissiveIntensity;
    uniform float uPulseSpeed;
    uniform float uPulseMin;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      float pulse = uPulseMin + (1.0 - uPulseMin) * (0.5 + 0.5 * sin(uTime * uPulseSpeed));
      vec3 emissive = uColor * uEmissiveIntensity * pulse;

      // Simple rim-light effect
      float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
      rim = pow(rim, 2.0);
      emissive += uColor * rim * 0.5;

      gl_FragColor = vec4(emissive, 1.0);
    }
  `,
};

// ─── Shield Energy Shader ────────────────────────────────────────────────────
// Animated hex pattern for barriers.

export const ShieldShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x4488ff) },
    uOpacity: { value: 0.85 },
    uHexScale: { value: 12.0 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uHexScale;
    varying vec2 vUv;

    // Hex distance function
    float hexDist(vec2 p) {
      p = abs(p);
      return max(dot(p, normalize(vec2(1.0, 1.73))), p.x);
    }

    vec4 hexCoords(vec2 uv) {
      vec2 r = vec2(1.0, 1.73);
      vec2 h = r * 0.5;
      vec2 a = mod(uv, r) - h;
      vec2 b = mod(uv - h, r) - h;
      vec2 gv = length(a) < length(b) ? a : b;
      float x = atan(gv.x, gv.y);
      float y = 0.5 - hexDist(gv);
      return vec4(gv.x, gv.y, x, y);
    }

    void main() {
      vec2 uv = vUv * uHexScale;
      uv.y += uTime * 0.3;
      vec4 hc = hexCoords(uv);

      // Hex edge glow
      float edge = smoothstep(0.0, 0.05, hc.w) - smoothstep(0.05, 0.1, hc.w);

      // Energy pulse traveling across the hex grid
      float energy = 0.5 + 0.5 * sin(uTime * 3.0 + vUv.y * 10.0);

      // Interior fill with subtle animation
      float fill = smoothstep(0.0, 0.15, hc.w) * 0.3;

      float alpha = (edge * 0.8 + fill) * energy;
      vec3 col = uColor * (1.0 + edge * 0.5);

      gl_FragColor = vec4(col, alpha * uOpacity);
    }
  `,
};

// ─── Dissolve Shader ─────────────────────────────────────────────────────────
// Enemy death animation — fragments break apart using noise-based threshold.

export const DissolveShader = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 }, // 0 = solid, 1 = fully dissolved
    uColor: { value: new THREE.Color(0xff4400) },
    uEdgeColor: { value: new THREE.Color(0xffaa00) },
    uEdgeWidth: { value: 0.05 },
    uNoiseScale: { value: 4.0 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uProgress;
    uniform vec3 uColor;
    uniform vec3 uEdgeColor;
    uniform float uEdgeWidth;
    uniform float uNoiseScale;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Simple 2D hash noise
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      float n = fbm(vUv * uNoiseScale + uTime * 0.5);

      // Discard pixels below the dissolve threshold
      float threshold = uProgress;
      if (n < threshold) discard;

      // Hot edge at the dissolve boundary
      float edgeFactor = 1.0 - smoothstep(0.0, uEdgeWidth, n - threshold);
      vec3 col = mix(uColor, uEdgeColor, edgeFactor);

      // Brighten the edge
      col += uEdgeColor * edgeFactor * 2.0;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

// ─── Helper: create ShaderMaterial from a shader definition ──────────────────

export function createGlowMaterial(color = 0x00ffaa) {
  const mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(GlowShader.uniforms),
    vertexShader: GlowShader.vertexShader,
    fragmentShader: GlowShader.fragmentShader,
    transparent: false,
  });
  mat.uniforms.uColor.value.set(color);
  return mat;
}

export function createShieldMaterial(color = 0x4488ff) {
  const mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(ShieldShader.uniforms),
    vertexShader: ShieldShader.vertexShader,
    fragmentShader: ShieldShader.fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  mat.uniforms.uColor.value.set(color);
  return mat;
}

export function createDissolveMaterial(color = 0xff4400) {
  const mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(DissolveShader.uniforms),
    vertexShader: DissolveShader.vertexShader,
    fragmentShader: DissolveShader.fragmentShader,
    transparent: true,
  });
  mat.uniforms.uColor.value.set(color);
  return mat;
}
