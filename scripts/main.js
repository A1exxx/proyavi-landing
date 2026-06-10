/**
 * main.js — entry point. Vocal Studio v3
 * Only Lenis smooth scroll + opacity reveal + form. No cursor / magnetic / WebGL / SplitText.
 */

import { initReveal } from './reveal.js';
import { initForm } from './form.js';
import { initVoiceTest } from './leadtest.js';
import {
  initBeforeAfter,
  initModal,
  initHeroBlob,
  initTilt,
  initMagneticLite,
  initScrollProgress,
  initParallax,
  initStickyCta,
} from './interactions.js';

function boot() {
  // screenshot-режим (?screenshot=1) — облегчает страницу для headless-рендера
  if (new URLSearchParams(location.search).has('screenshot')) {
    const s = document.createElement('style');
    s.textContent = '*,*::before,*::after{animation:none!important}body::before{display:none!important}';
    document.head.appendChild(s);
    document.querySelectorAll('video').forEach((v) => { v.pause(); v.removeAttribute('autoplay'); });
  }

  // Native scroll — Lenis отключён, ощущался ватным
  initReveal();
  initForm();
  initNavBehavior();

  // V5/V7 micro-interactions
  initBeforeAfter();
  initModal();
  initHeroBlob();
  initTilt();
  initMagneticLite();
  initScrollProgress();
  initParallax();
  initStickyCta();
  initVoiceTest();
  initLiveDemo();

  const yearEl = document.querySelector('#current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Live-демо тренажёра «Распевка»: iframe грузится ТОЛЬКО по клику —
// страница остаётся лёгкой, а микрофон запрашивается осознанным жестом.
function initLiveDemo() {
  const btn = document.getElementById('livedemo-start');
  const frame = document.getElementById('livedemo-frame');
  if (!btn || !frame) return;
  btn.addEventListener('click', () => {
    const ifr = document.createElement('iframe');
    ifr.src = 'https://a1exxx.github.io/raspevka/demo.html';
    ifr.allow = 'microphone';
    ifr.title = 'Демо тренажёра «Распевка»: спой ноту — увидь её';
    frame.classList.add('is-live');
    frame.innerHTML = '';
    frame.appendChild(ifr);
  });
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
