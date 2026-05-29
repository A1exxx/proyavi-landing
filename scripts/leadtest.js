/**
 * leadtest.js — мини-тест «насколько свободен твой голос» (лид-магнит).
 * 6 утверждений × шкала 1-5 → средний балл → вердикт + CTA в модалку.
 */

export function initVoiceTest() {
  const form = document.querySelector('#voicetest');
  const result = document.querySelector('#vt-result');
  if (!form || !result) return;

  const rows = [...form.querySelectorAll('.vt-row')];
  const submit = form.querySelector('#vt-submit');
  const progress = form.querySelector('#vt-progress');
  const scores = {}; // key -> 1..5

  rows.forEach((row) => {
    const key = row.dataset.key;
    const dots = [...row.querySelectorAll('.vt-dot')];
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const v = parseInt(dot.dataset.v, 10);
        scores[key] = v;
        dots.forEach((d, i) => d.classList.toggle('is-on', i < v));
        row.classList.add('is-answered');
        updateProgress();
      });
    });
  });

  function answered() { return Object.keys(scores).length; }

  function updateProgress() {
    const n = answered();
    if (n < rows.length) {
      progress.textContent = `Отмечено ${n} из ${rows.length}`;
      submit.disabled = true;
    } else {
      progress.textContent = 'Готово — смотри результат';
      submit.disabled = false;
    }
  }

  submit.addEventListener('click', () => {
    if (answered() < rows.length) return;
    const vals = Object.values(scores);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

    const numEl = document.querySelector('#vt-score-num');
    const verdictEl = document.querySelector('#vt-verdict');
    numEl.textContent = avg.toFixed(1).replace('.', ',');

    let verdict;
    if (avg <= 2.3) {
      verdict = 'Голос пока сильно сдержан — и это нормально. Хорошая новость: именно это снимается быстрее всего. Тебе точно к нам.';
    } else if (avg < 3.6) {
      verdict = 'Зажимы есть, но фундамент крепкий. На диагностике покажем, что раскрыть первым — и ты удивишься, как быстро меняется звук.';
    } else {
      verdict = 'Ты уже свободнее многих. Дальше — тонкая настройка, сцена и твой собственный звук. Поможем дойти до результата.';
    }
    verdictEl.textContent = verdict;

    const swap = () => {
      form.hidden = true;
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    if (document.startViewTransition) document.startViewTransition(swap);
    else swap();
  });

  const retry = document.querySelector('#vt-retry');
  if (retry) {
    retry.addEventListener('click', () => {
      Object.keys(scores).forEach((k) => delete scores[k]);
      rows.forEach((row) => {
        row.classList.remove('is-answered');
        row.querySelectorAll('.vt-dot').forEach((d) => d.classList.remove('is-on'));
      });
      result.hidden = true;
      form.hidden = false;
      updateProgress();
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  updateProgress();
}
