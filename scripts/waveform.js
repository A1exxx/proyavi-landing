/**
 * waveform.js — animated audio-waveform на Canvas
 * Реагирует на скролл + лёгкая базовая анимация
 * Без микрофона по умолчанию (privacy-friendly)
 */

export function initWaveform(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // CSS custom property resolution
  const root = getComputedStyle(document.documentElement);
  const accent = root.getPropertyValue('--color-accent').trim() || '#6B2737';
  const tech = root.getPropertyValue('--color-tech').trim() || '#4F46E5';
  const warm = root.getPropertyValue('--color-warm').trim() || '#FFB47A';

  // Multiple wave layers — каждая со своей частотой и фазой
  const waves = [
    { amp: 0.18, freq: 0.018, speed: 0.0008, phase: 0,    color: accent, alpha: 0.55, width: 1.5 },
    { amp: 0.12, freq: 0.026, speed: 0.0012, phase: 1.5,  color: tech,   alpha: 0.45, width: 1.2 },
    { amp: 0.08, freq: 0.038, speed: 0.0018, phase: 3.0,  color: warm,   alpha: 0.50, width: 1.0 },
    { amp: 0.05, freq: 0.062, speed: 0.0024, phase: 4.5,  color: accent, alpha: 0.30, width: 0.8 },
  ];

  let scrollNorm = 0;
  let targetScrollNorm = 0;

  function updateScroll() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    targetScrollNorm = Math.min(1, window.scrollY / max);
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  let prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let rafId = null;
  let lastTime = 0;
  function frame(t) {
    if (!lastTime) lastTime = t;
    const dt = t - lastTime;
    lastTime = t;

    scrollNorm += (targetScrollNorm - scrollNorm) * 0.08;

    ctx.clearRect(0, 0, width, height);

    const baseY = height * 0.5;
    const energyBoost = 1 + scrollNorm * 0.6; // больше энергии по скроллу

    for (let i = 0; i < waves.length; i++) {
      const w = waves[i];
      const animT = prefersReduced ? 0 : t * w.speed;

      ctx.beginPath();
      ctx.lineWidth = w.width;
      ctx.strokeStyle = w.color;
      ctx.globalAlpha = w.alpha;
      ctx.lineCap = 'round';

      const step = 4;
      for (let x = 0; x <= width; x += step) {
        const norm = x / width;
        // Усиление амплитуды в центре canvas
        const env = Math.sin(norm * Math.PI);
        const y = baseY +
          Math.sin(x * w.freq + animT + w.phase) * height * w.amp * env * energyBoost +
          Math.sin(x * w.freq * 0.5 + animT * 1.2 + w.phase) * height * w.amp * 0.3 * env;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);

  // Cleanup для случая если будет понадобится
  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    window.removeEventListener('scroll', updateScroll);
  };
}
