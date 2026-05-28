/**
 * main.js — entry point.
 */

import { initWaveform } from './waveform.js';
import { initReveal } from './reveal.js';
import { initSmoothScroll } from './scroll.js';
import { initForm } from './form.js';
import { initCursor } from './cursor.js';
import { initMagnetic } from './magnetic.js';
import { initSplitText } from './splittext.js';

function boot() {
  const params = new URLSearchParams(location.search);
  const screenshotMode = params.has('screenshot');

  if (!screenshotMode) {
    initSmoothScroll();
    initCursor();
    initMagnetic();
  }
  initSplitText();
  initReveal();

  const heroContainer = document.querySelector('#hero-webgl');
  if (heroContainer && !screenshotMode) initWaveform(heroContainer);

  initForm();
  initNavBehavior();

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
