/**
 * waveform.js — WebGL fragment shader hero
 * Резонирующие волны как метафора голоса.
 * Использует Three.js (по CDN). Если Three не загрузился — gracefully no-op.
 */

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform float uScroll;
  uniform vec3  uColorAccent;
  uniform vec3  uColorDeep;
  uniform vec3  uColorCool;
  uniform vec3  uColorBg;

  varying vec2 vUv;

  // Hash & noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // FBM
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

    float t = uTime * 0.18;
    float scroll = uScroll * 0.4;

    // Concentric resonance waves
    float r = length(p - vec2(uMouse.x * 0.3, 0.0));
    float wave = sin(r * 12.0 - t * 3.0 - scroll) * 0.5 + 0.5;
    wave *= smoothstep(1.4, 0.2, r);

    // FBM distortion for organic look
    vec2 q = vec2(fbm(p * 1.8 + t), fbm(p * 1.8 - t * 0.7));
    float distortion = fbm(p * 2.5 + q * 1.8 + t * 0.5);

    // Composite color
    vec3 col = uColorBg;
    col = mix(col, uColorDeep * 0.7, distortion * 0.7);
    col = mix(col, uColorAccent, wave * distortion * 0.85);

    // Cool highlights
    float hi = smoothstep(0.6, 1.0, distortion);
    col = mix(col, uColorCool * 0.6, hi * 0.25);

    // Vignette
    float vig = smoothstep(1.4, 0.5, length(p));
    col *= mix(0.6, 1.0, vig);

    // Grain
    float grain = (hash(gl_FragCoord.xy + t * 100.0) - 0.5) * 0.04;
    col += grain;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  const num = parseInt(clean, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

function parseRgbString(str) {
  const m = str.match(/(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  if (!m) return null;
  return [parseInt(m[1]) / 255, parseInt(m[2]) / 255, parseInt(m[3]) / 255];
}

function resolveColor(varName, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!v) return fallback;
  if (v.startsWith('#')) return hexToRgb(v);
  if (v.startsWith('rgb')) {
    const parsed = parseRgbString(v);
    if (parsed) return parsed;
  }
  return fallback;
}

export function initWaveform(container) {
  if (!container) return;
  if (typeof THREE === 'undefined') {
    console.info('[waveform] Three.js not loaded, skipping WebGL hero');
    return;
  }

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime:        { value: 0 },
    uResolution:  { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
    uMouse:       { value: new THREE.Vector2(0, 0) },
    uScroll:      { value: 0 },
    uColorAccent: { value: new THREE.Vector3(...resolveColor('--color-accent', [0.96, 0.64, 0.38])) },
    uColorDeep:   { value: new THREE.Vector3(...resolveColor('--color-accent-deep', [0.79, 0.28, 0.37])) },
    uColorCool:   { value: new THREE.Vector3(...resolveColor('--color-cool', [0.51, 0.55, 0.97])) },
    uColorBg:     { value: new THREE.Vector3(...resolveColor('--color-bg', [0.04, 0.035, 0.03])) },
  };

  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Resize handling
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    uniforms.uResolution.value.set(w, h);
  }
  window.addEventListener('resize', resize, { passive: true });

  // Mouse tracking
  let targetMx = 0, targetMy = 0;
  window.addEventListener('mousemove', (e) => {
    targetMx = (e.clientX / window.innerWidth) * 2 - 1;
    targetMy = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  // Scroll
  let targetScroll = 0;
  window.addEventListener('scroll', () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    targetScroll = Math.min(1, window.scrollY / max);
  }, { passive: true });

  const start = performance.now();
  let frameId = null;
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function loop() {
    const t = (performance.now() - start) / 1000;
    uniforms.uTime.value = prefersReduced ? 0 : t;

    uniforms.uMouse.value.x += (targetMx - uniforms.uMouse.value.x) * 0.06;
    uniforms.uMouse.value.y += (targetMy - uniforms.uMouse.value.y) * 0.06;
    uniforms.uScroll.value += (targetScroll - uniforms.uScroll.value) * 0.08;

    renderer.render(scene, camera);
    frameId = requestAnimationFrame(loop);
  }
  frameId = requestAnimationFrame(loop);

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
    renderer.dispose();
    material.dispose();
    geometry.dispose();
  };
}
