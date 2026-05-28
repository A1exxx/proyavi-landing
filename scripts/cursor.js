/**
 * cursor.js — кастомный курсор с trail + magnetic hover
 */

export function initCursor() {
  // Only on devices with fine pointer
  if (!matchMedia('(pointer: fine)').matches) return;
  if (window.innerWidth < 1024) return;

  const ring = document.createElement('div');
  ring.className = 'cursor';
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.append(ring, dot);

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let dx = mx, dy = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  function loop() {
    // Dot — fast follow
    dx += (mx - dx) * 0.45;
    dy += (my - dy) * 0.45;
    // Ring — slower trail
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;

    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  // Hover state on interactive elements
  const hoverables = 'a, button, summary, .pain-card, .direction-card, .segment-item, .tarif-card, input, textarea, label, .case-card, .marquee';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest && e.target.closest(hoverables)) {
      ring.classList.add('is-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest && e.target.closest(hoverables)) {
      ring.classList.remove('is-hover');
    }
  });

  // Hide when leaving viewport
  document.addEventListener('mouseleave', () => {
    ring.style.opacity = '0';
    dot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    ring.style.opacity = '';
    dot.style.opacity = '';
  });
}
