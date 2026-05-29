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

/* ============= 1) BEFORE / AFTER — SCROLL-LINKED AUTO-WIPE =============
 * Кадр сам «протирается» с «было» → «стало» по мере прохождения через вьюпорт.
 * pointer-events: none на всём → касание НИКОГДА не захватывается → скролл на
 * телефоне работает нативно (фикс жалобы пользователя на залипание).
 */

export function initBeforeAfter() {
  const cards = document.querySelectorAll('.case-photo-pair');
  if (!cards.length) return;

  // reduced-motion: сразу показываем «стало»
  if (prefersReduced) {
    cards.forEach((c) => c.style.setProperty('--split', '100%'));
    return;
  }

  // активные (видимые) карточки — обновляем только их
  const active = new Set();

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) active.add(e.target);
      else active.delete(e.target);
    });
    if (active.size) requestTick();
  }, { threshold: [0, 0.25, 0.5, 0.75, 1] });

  cards.forEach((c) => {
    c.style.setProperty('--split', '0%');
    io.observe(c);
  });

  let ticking = false;
  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function update() {
    ticking = false;
    const vh = window.innerHeight;
    active.forEach((card) => {
      const rect = card.getBoundingClientRect();
      // progress: 0 когда карточка только входит снизу, 1 когда уходит сверху.
      // «Рабочая зона» — пока центр карточки идёт от 85% до 35% высоты экрана.
      const center = rect.top + rect.height / 2;
      const raw = (vh * 0.85 - center) / (vh * 0.5);
      const p = Math.max(0, Math.min(1, raw));
      // ease-in-out для мягкости
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      card.style.setProperty('--split', (eased * 100).toFixed(1) + '%');
    });
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  update();
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
