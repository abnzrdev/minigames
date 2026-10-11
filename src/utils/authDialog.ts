import { currentRoute, subscribeRoute, updateRoute, type RouteState } from './navigation';

const BODY_MENU_OPEN_CLASS = 'menu-open';
const BODY_DIALOG_OPEN_CLASS = 'auth-open';
const DIALOG_CLOSING_CLASS = 'auth-dialog--closing';

export type AuthDialogTab = 'login' | 'register';
let closeTimer = 0;

/**
 * Restore both authentication forms to their initial state.
 * A mode switch must clear values, errors, and validation status.
 */
function resetAuthForms(dialog: HTMLElement): void {
  dialog.querySelectorAll<HTMLFormElement>('.auth-dialog__form').forEach((form) => {
    // Reset input values to their original defaults.
    form.reset();

    // Remove validation errors from every field.
    form.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      input.setAttribute('aria-invalid', 'false');
      input.closest('.auth-dialog__field')?.classList.remove('auth-dialog__field--invalid');
    });

    form.querySelectorAll<HTMLElement>('.auth-dialog__error').forEach((error) => {
      error.textContent = '';
      error.hidden = true;
    });

    // Reset password visibility to its hidden state.
    form.querySelectorAll<HTMLButtonElement>('.auth-dialog__reveal').forEach((button) => {
      const input = button.parentElement?.querySelector('input');

      if (input instanceof HTMLInputElement) {
        input.type = 'password';
      }

      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', 'Show password');
      button.querySelector('.auth-dialog__reveal-on')?.removeAttribute('hidden');
      button.querySelector('.auth-dialog__reveal-off')?.setAttribute('hidden', '');
    });

    // reset() doesn't restore a button's disabled property.
    const submit = form.querySelector<HTMLButtonElement>('.auth-dialog__submit');

    if (submit) {
      submit.disabled = true;
    }
  });
}

function applyAuthTab(tab: AuthDialogTab): void {
  const dialog = document.getElementById('auth-dialog');
  if (!dialog) {
    return;
  }

  // Clear previous form state whenever a tab is activated.
  resetAuthForms(dialog);

  const loginPanel = dialog.querySelector<HTMLElement>('#auth-panel-login');
  const registerPanel = dialog.querySelector<HTMLElement>('#auth-panel-register');
  const tabButtons = dialog.querySelectorAll<HTMLButtonElement>('[data-auth-tab]');

  tabButtons.forEach((button) => {
    const isActive = button.dataset.authTab === tab;
    button.classList.toggle('auth-dialog__tab--active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });

  const activatePanel = (panel: HTMLElement | null): void => {
    if (!panel) {
      return;
    }
    panel.classList.remove('auth-dialog__panel--hidden');
    panel.removeAttribute('hidden');
    panel.removeAttribute('aria-hidden');
    panel.classList.remove('auth-dialog__panel--switching');
    void panel.offsetWidth;
    panel.classList.add('auth-dialog__panel--switching');
  };

  dialog.querySelectorAll('.auth-dialog__title').forEach((heading) => {
    heading.removeAttribute('id');
  });

  if (tab === 'login') {
    registerPanel?.classList.add('auth-dialog__panel--hidden');
    registerPanel?.setAttribute('hidden', '');
    activatePanel(loginPanel);
    loginPanel?.querySelector('.auth-dialog__title')?.setAttribute('id', 'auth-dialog-title');
  } else {
    loginPanel?.classList.add('auth-dialog__panel--hidden');
    loginPanel?.setAttribute('hidden', '');
    activatePanel(registerPanel);
    registerPanel?.querySelector('.auth-dialog__title')?.setAttribute('id', 'auth-dialog-title');
  }
}

export function openAuthDialog(tab: AuthDialogTab = 'login'): void {
  closeMobileMenu();
  updateRoute({ auth: tab, game: null });
}

function showAuthDialog(tab: AuthDialogTab): void {
  const dialog = document.getElementById('auth-dialog');
  if (!(dialog instanceof HTMLDialogElement)) {
    return;
  }

  closeMobileMenu();
  window.clearTimeout(closeTimer);
  dialog.classList.remove(DIALOG_CLOSING_CLASS);
  applyAuthTab(tab);

  if (!dialog.open) {
    dialog.showModal();
    document.body.classList.add(BODY_DIALOG_OPEN_CLASS);
  }
}

export function closeMobileMenu(): void {
  const nav = document.getElementById('site-nav');
  const burgerBtn = document.getElementById('burger-btn');
  nav?.classList.remove('header__nav--open');
  burgerBtn?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove(BODY_MENU_OPEN_CLASS);
}

export function toggleMobileMenu(): void {
  const nav = document.getElementById('site-nav');
  const burgerBtn = document.getElementById('burger-btn');
  if (!nav || !burgerBtn) {
    return;
  }

  const isOpen = nav.classList.toggle('header__nav--open');
  burgerBtn.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle(BODY_MENU_OPEN_CLASS, isOpen);
}

function closeAuthDialogWithAnimation(dialog: HTMLDialogElement): void {
  if (dialog.classList.contains(DIALOG_CLOSING_CLASS)) {
    return;
  }

  dialog.classList.add(DIALOG_CLOSING_CLASS);

  const finish = (): void => {
    if (!dialog.classList.contains(DIALOG_CLOSING_CLASS)) {
      return;
    }
    dialog.classList.remove(DIALOG_CLOSING_CLASS);
    dialog.close();
    document.body.classList.remove(BODY_DIALOG_OPEN_CLASS);
    dialog.removeEventListener('animationend', onEnd);
  };

  const onEnd = (event: AnimationEvent): void => {
    if (event.target !== dialog) {
      return;
    }
    finish();
  };

  dialog.addEventListener('animationend', onEnd);
  window.clearTimeout(closeTimer);
  closeTimer = window.setTimeout(finish, 220);
}

export function initAuthDialog(): void {
  const dialog = document.getElementById('auth-dialog');
  if (!(dialog instanceof HTMLDialogElement)) {
    return;
  }

  const tabButtons = dialog.querySelectorAll<HTMLButtonElement>('[data-auth-tab]');
  const switchLinks = dialog.querySelectorAll<HTMLButtonElement>('[data-auth-switch]');
  const closeBtn = dialog.querySelector<HTMLButtonElement>('#auth-dialog-close');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.authTab;
      if (tab === 'login' || tab === 'register') {
        openAuthDialog(tab);
      }
    });
  });

  switchLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const tab = link.dataset.authSwitch;
      if (tab === 'login' || tab === 'register') {
        openAuthDialog(tab);
      }
    });
  });

  closeBtn?.addEventListener('click', () => {
    updateRoute({ auth: null });
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      updateRoute({ auth: null });
    }
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    updateRoute({ auth: null });
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove(BODY_DIALOG_OPEN_CLASS);
  });

  let activeMode: AuthDialogTab | null = null;
  const synchronize = (route: RouteState): void => {
    if (route.auth) {
      if (
        route.auth !== activeMode ||
        !dialog.open ||
        dialog.classList.contains(DIALOG_CLOSING_CLASS)
      ) {
        showAuthDialog(route.auth);
      }
    } else if (dialog.open) {
      closeAuthDialogWithAnimation(dialog);
    }
    activeMode = route.auth;
  };
  subscribeRoute(synchronize);
  synchronize(currentRoute());
}
