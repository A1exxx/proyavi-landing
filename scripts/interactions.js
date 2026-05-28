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

/* ============= 1) BEFORE / AFTER SLIDER ============= */

export function initBeforeAfter() {
  const sliders = document.querySelectorAll('.case-photo-pair');
  if (!sliders.length) return;

  sliders.forEach((root) => {
    const before = root.querySelector('.case-img-before');
    const after  = root.querySelector('.case-img-after');
    if (!before || !after) return;

    // Inject handle (visible knob)
    const handle = document.createElement('div');
    handle.className = 'case-handle';
    handle.innerHTML = '<span class="case-handle-knob" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 6 4 11 8 16"></polyline><polyline points="14 6 18 11 14 16"></polyline></svg></span>';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    handle.setAttribute('aria-valuenow', '50');
    handle.tabIndex = 0;
    root.appendChild(handle);

    let percent = 50;
    function setPercent(p) {
      percent = Math.max(2, Math.min(98, p));
      root.style.setProperty('--split', `${percent}%`);
      handle.setAttribute('aria-valuenow', String(Math.round(percent)));
    }
    setPercent(50);

    let dragging = false;

    function pointerToPercent(clientX) {
      const rect = root.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function onDown(e) {
      dragging = true;
      root.classList.add('is-dragging');
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPercent(pointerToPercent(x));
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPercent(pointerToPercent(x));
    }
    function onUp() {
      dragging = false;
      root.classList.remove('is-dragging');
    }

    handle.addEventListener('mousedown', onDown);
    root.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    handle.addEventListener('touchstart', onDown, { passive: false });
    root.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    handle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  setPercent(percent - 4);
      if (e.key === 'ArrowRight') setPercent(percent + 4);
    });

    // Auto-demo: ping the slider when scrolled into view
    if (!prefersReduced) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            root.classList.add('is-demo');
            setTimeout(() => root.classList.remove('is-demo'), 2200);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      io.observe(root);
    }
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
