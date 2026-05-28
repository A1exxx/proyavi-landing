/**
 * main.js — entry point.
 * Инициализирует все модули после DOMContentLoaded.
 */

import { initWaveform } from './waveform.js';
import { initReveal } from './reveal.js';
import { initSmoothScroll } from './scroll.js';
import { initForm } from './form.js';

function boot() {
  // Smooth scroll
  initSmoothScroll();

  // Reveal animations
  initReveal();

  // Hero waveform
  const canvas = document.querySelector('#hero-waveform-canvas');
  initWaveform(canvas);

  // Form
  initForm();

  // Nav scroll behavior — hide/show on scroll
  initNavBehavior();

  // Year in footer
  const yearEl = document.querySelector('#current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initNavBehavior() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  let lastY = 0;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (y > 100 && y > lastY) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
