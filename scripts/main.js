/**
 * main.js — entry point. Vocal Studio v3
 * Only Lenis smooth scroll + opacity reveal + form. No cursor / magnetic / WebGL / SplitText.
 */

import { initReveal } from './reveal.js';
import { initForm } from './form.js';
import {
  initBeforeAfter,
  initHeroBlob,
  initTilt,
  initMagneticLite,
  initScrollProgress,
  initParallax,
} from './interactions.js';

function boot() {
  // Native scroll — Lenis отключён, ощущался ватным
  initReveal();
  initForm();
  initNavBehavior();

  // V5 micro-interactions
  initBeforeAfter();
  initHeroBlob();
  initTilt();
  initMagneticLite();
  initScrollProgress();
  initParallax();

  const yearEl = document.querySelector('#current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initNavBehavior() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 80);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
