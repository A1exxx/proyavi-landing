/**
 * scroll.js — Lenis smooth scroll initialization
 * Использует Lenis (по CDN). Если не загрузился — gracefully падаем на нативный smooth scroll.
 */

export function initSmoothScroll() {
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  if (typeof Lenis === 'undefined') {
    // Lenis не загрузился — оставляем нативный scroll-behavior из CSS
    console.info('[scroll] Lenis не доступен — используем native smooth scroll');
    return;
  }

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Anchor links — плавный скролл к секциям
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    });
  });

  return lenis;
}
