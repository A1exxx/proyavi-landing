/**
 * form.js — клиентская валидация + success-state.
 * Обрабатывает обе формы: секционную (#diagnostika-form / #form-success)
 * и модальную (#modal-form / #modal-success).
 */

const FORMS = [
  { form: '#diagnostika-form', success: '#form-success' },
  { form: '#modal-form', success: '#modal-success' },
];

export function initForm() {
  FORMS.forEach(({ form: formSel, success: successSel }) => {
    const form = document.querySelector(formSel);
    if (!form) return;
    const successEl = document.querySelector(successSel);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const payload = Object.fromEntries(new FormData(form).entries());
      // TODO backend: Telegram-bot / Tilda Forms / Notion API
      console.log('[form] submission', payload);

      const swap = () => {
        form.hidden = true;
        if (successEl) {
          successEl.hidden = false;
          successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      if (document.startViewTransition) document.startViewTransition(swap);
      else swap();
    });

    form.querySelectorAll('input[required], textarea[required]').forEach((input) => {
      input.addEventListener('blur', () => {
        if (input.value && !input.checkValidity()) input.dataset.invalid = 'true';
        else delete input.dataset.invalid;
      });
    });
  });
}
