/**
 * reveal.js — IntersectionObserver-based reveal
 * Добавляет .is-visible на [data-reveal] и [data-reveal-stagger]
 * когда элемент входит в viewport
 */

export function initReveal() {
  const items = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if (!items.length) return;

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  items.forEach((el) => io.observe(el));
}
