/**
 * form.js — клиентская валидация формы заявки + View Transitions API success-state
 */

export function initForm() {
  const form = document.querySelector('#diagnostika-form');
  if (!form) return;

  const successEl = document.querySelector('#form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Простая валидация (HTML5 атрибуты уже на полях)
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    // На бэкенд пока ничего не шлём — TODO в README
    // POST endpoint будет добавлен на следующей итерации (Telegram-bot / Tilda-форма / Notion API)
    console.log('[form] submission', payload);

    // View Transition если доступен — кинематографический переход
    const swap = () => {
      form.hidden = true;
      if (successEl) {
        successEl.hidden = false;
        // Прокручиваем к success
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(swap);
    } else {
      swap();
    }
  });

  // Lightweight live validation hint
  form.querySelectorAll('input[required], textarea[required]').forEach((input) => {
    input.addEventListener('blur', () => {
      if (input.value && !input.checkValidity()) {
        input.dataset.invalid = 'true';
      } else {
        delete input.dataset.invalid;
      }
    });
  });
}
