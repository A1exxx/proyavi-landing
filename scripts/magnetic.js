/**
 * magnetic.js — magnetic hover на интерактивных кнопках
 */

export function initMagnetic() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!matchMedia('(pointer: fine)').matches) return;

  const targets = document.querySelectorAll('[data-magnetic]');

  targets.forEach((el) => {
    const strength = parseFloat(el.dataset.magneticStrength || '0.35');
    let rect = null;

    function update() { rect = el.getBoundingClientRect(); }
    update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('scroll', update, { passive: true });

    el.addEventListener('mouseenter', update);
    el.addEventListener('mousemove', (e) => {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}
