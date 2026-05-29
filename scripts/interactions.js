/**
 * interactions.js — premium micro-interactions для V4.5+
 *  • Draggable before/after slider (touch + mouse)
 *  • Cursor-reactive warm blob in hero
 *  • Tilt-3D on team cards
 *  • Magnetic CTA
 *  • Scroll-progress bar
 */

const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer  = matchMedia('(pointer: fine)').matches;
const isTouchDevice  = matchMedia('(hover: none)').matches;

/* ============= 1) BEFORE / AFTER — теперь CSS auto-crossfade =============
 * Анимация полностью в v7.css (ba-before/ba-after). JS больше не нужен.
 * Оставлено пустым ради совместимости импорта.
 */
export function initBeforeAfter() { /* no-op — CSS crossfade в v7.css */ }

/* ============= 1b) LEAD MODAL — анкета по кнопке «Записаться» ============= */

export function initModal() {
  const modal = document.querySelector('#lead-modal');
  if (!modal || !modal.showModal) return; // нет <dialog> support → ссылки ведут на #form (fallback)

  let lastFocus = null;

  function open(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    // сброс success-состояния если повторно открыли
    const form = modal.querySelector('#modal-form');
    const success = modal.querySelector('#modal-success');
    if (form && success && success.hidden === false) {
      success.hidden = true;
      form.hidden = false;
      form.reset();
      modal.querySelectorAll('.goal-chip[aria-pressed="true"]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    }
    modal.showModal();
    const firstInput = modal.querySelector('input[type="text"]');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }

  function close() {
    modal.close();
  }

  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', open);
  });

  modal.querySelectorAll('[data-modal-close]').forEach((b) => b.addEventListener('click', close));

  // клик по подложке закрывает
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  modal.addEventListener('close', () => {
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });

  // goal chips → hidden input
  const chips = modal.querySelectorAll('.goal-chip');
  const goalInput = modal.querySelector('#m-goal');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const pressed = chip.getAttribute('aria-pressed') === 'true';
      chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', String(!pressed));
      if (goalInput) goalInput.value = pressed ? '' : chip.textContent.trim();
    });
  });
}

/* ============= 2) CURSOR-REACTIVE HERO BLOB ============= */

export function initHeroBlob() {
  if (prefersReduced || !isFinePointer) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const blob = document.createElement('div');
  blob.className = 'hero-blob';
  hero.appendChild(blob);

  let targetX = 50, targetY = 50;
  let curX = 50, curY = 50;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width) * 100;
    targetY = ((e.clientY - rect.top) / rect.height) * 100;
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 50; targetY = 50;
  });

  function tick() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    blob.style.setProperty('--bx', curX + '%');
    blob.style.setProperty('--by', curY + '%');
    requestAnimationFrame(tick);
  }
  tick();
}

/* ============= 3) TILT 3D — team & direction cards ============= */

export function initTilt() {
  if (prefersReduced || !isFinePointer) return;
  const cards = document.querySelectorAll('.person-card, [data-tilt]');

  cards.forEach((card) => {
    const inner = card.querySelector('.person-photo') || card;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (-y * 6).toFixed(2);
      const ry = (x * 8).toFixed(2);
      inner.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = '';
    });
  });
}

/* ============= 4) MAGNETIC CTA ============= */

export function initMagneticLite() {
  if (prefersReduced || !isFinePointer) return;
  const targets = document.querySelectorAll('[data-magnetic]');

  targets.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.3;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.3;
      el.style.transform = `translate(${x * 24}px, ${y * 24}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ============= 5) SCROLL PROGRESS BAR ============= */

export function initScrollProgress() {
  const bar = document.querySelector('.nav-progress');
  if (!bar) return;
  // If scroll-driven animations are supported — CSS handles it. Otherwise JS.
  if (CSS && CSS.supports && CSS.supports('animation-timeline: scroll()')) return;

  function update() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p = Math.min(1, window.scrollY / max);
    bar.style.transform = `scaleX(${p})`;
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ============= 6) SUBTLE PARALLAX on spread images ============= */

export function initParallax() {
  if (prefersReduced) return;
  const spreads = document.querySelectorAll('.spread img');
  if (!spreads.length) return;

  function update() {
    spreads.forEach((img) => {
      const rect = img.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = (vh - rect.top) / (vh + rect.height);
      const offset = (progress - 0.5) * 40;
      img.style.transform = `translate3d(0, ${offset}px, 0) scale(1.08)`;
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

/* ============= 7) STICKY MOBILE CTA — показывать после hero, прятать у формы ============= */

export function initStickyCta() {
  const cta = document.querySelector('#sticky-cta');
  const hero = document.querySelector('.hero');
  const form = document.querySelector('#form');
  if (!cta || !hero) return;

  let ticking = false;
  function update() {
    ticking = false;
    const heroBottom = hero.getBoundingClientRect().bottom;
    let nearForm = false;
    if (form) {
      const r = form.getBoundingClientRect();
      nearForm = r.top < window.innerHeight && r.bottom > 0;
    }
    // показываем когда hero ушёл вверх и мы не на форме
    cta.classList.toggle('is-visible', heroBottom < 0 && !nearForm);
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}
