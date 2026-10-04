export type SnackbarVariant = 'success' | 'error';

const SNACKBAR_TIMEOUT_MS = 3500;

let snackbarElement: HTMLElement | null = null;
let snackbarTimer = 0;

function hideSnackbar(): void {
  if (!snackbarElement) {
    return;
  }

  snackbarElement.classList.remove('snackbar--visible');
}

function getSnackbar(): HTMLElement {
  if (snackbarElement) {
    return snackbarElement;
  }

  const snackbar = document.createElement('div');

  snackbar.className = 'snackbar';
  snackbar.setAttribute('role', 'status');
  snackbar.setAttribute('aria-live', 'polite');

  snackbar.innerHTML = `
    <span class="snackbar__message"></span>

    <button
      type="button"
      class="snackbar__close"
      aria-label="Close notification"
    >
      ×
    </button>
  `;

  const closeButton = snackbar.querySelector<HTMLButtonElement>('.snackbar__close');

  closeButton?.addEventListener('click', hideSnackbar);

  document.body.appendChild(snackbar);

  snackbarElement = snackbar;

  return snackbar;
}

export function showSnackbar(message: string, variant: SnackbarVariant): void {
  const snackbar = getSnackbar();
  const dialog = document.querySelector<HTMLDialogElement>('dialog[open]');

  (dialog ?? document.body).appendChild(snackbar);
  if (dialog) {
    dialog.addEventListener(
      'close',
      () => {
        if (snackbar.parentElement === dialog) {
          document.body.appendChild(snackbar);
        }
      },
      { once: true }
    );
  }

  const messageElement = snackbar.querySelector<HTMLElement>('.snackbar__message');

  if (messageElement) {
    messageElement.textContent = message;
  }

  snackbar.classList.remove('snackbar--success', 'snackbar--error');

  snackbar.classList.add(`snackbar--${variant}`, 'snackbar--visible');

  window.clearTimeout(snackbarTimer);

  snackbarTimer = window.setTimeout(hideSnackbar, SNACKBAR_TIMEOUT_MS);
}
