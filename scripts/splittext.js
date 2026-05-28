/**
 * splittext.js — split heading into characters for char-by-char reveal
 * Использует IntersectionObserver для триггера.
 */

export function initSplitText() {
  const targets = document.querySelectorAll('[data-split-text]');
  if (!targets.length) return;

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  targets.forEach((el) => {
    splitElement(el);
    el.classList.add('is-split');
  });

  if (prefersReduced) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger each char
          const chars = entry.target.querySelectorAll('.split-char');
          chars.forEach((c, i) => {
            c.style.transitionDelay = `${Math.min(i * 28, 800)}ms`;
          });
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  targets.forEach((el) => io.observe(el));
}

function splitElement(el) {
  // Walk through child nodes; preserve <em> / <br>; wrap each char in span
  const fragment = document.createDocumentFragment();

  function walk(node, lineContainer) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      for (const ch of text) {
        if (ch === '\n') continue;
        if (ch === ' ') {
          const sp = document.createElement('span');
          sp.className = 'split-char';
          sp.innerHTML = '&nbsp;';
          lineContainer.appendChild(sp);
        } else {
          const sp = document.createElement('span');
          sp.className = 'split-char';
          sp.textContent = ch;
          lineContainer.appendChild(sp);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        return 'break';
      }
      // Wrap inner of em / span with chars preserving tag
      const inner = document.createElement(node.tagName.toLowerCase());
      Array.from(node.attributes).forEach((a) => inner.setAttribute(a.name, a.value));
      for (const child of Array.from(node.childNodes)) {
        const r = walk(child, inner);
        if (r === 'break') {}
      }
      lineContainer.appendChild(inner);
    }
  }

  // Split by <br> into lines
  const lines = [[]];
  const children = Array.from(el.childNodes);
  children.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'BR') {
      lines.push([]);
    } else {
      lines[lines.length - 1].push(n);
    }
  });

  lines.forEach((lineNodes) => {
    const lineEl = document.createElement('span');
    lineEl.className = 'split-line';
    lineNodes.forEach((node) => walk(node, lineEl));
    fragment.appendChild(lineEl);
  });

  el.innerHTML = '';
  el.appendChild(fragment);
}
