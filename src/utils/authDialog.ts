const BODY_MENU_OPEN_CLASS = 'menu-open';
const BODY_DIALOG_OPEN_CLASS = 'auth-open';
const DIALOG_CLOSING_CLASS = 'auth-dialog--closing';

export type AuthDialogTab = 'login' | 'register';

function applyAuthTab(tab: AuthDialogTab): void {
  const dialog = document.getElementById('auth-dialog');
  if (!dialog) {
    return;
  }

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
  const dialog = document.getElementById('auth-dialog');
  if (!(dialog instanceof HTMLDialogElement)) {
    return;
  }

  closeMobileMenu();
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

  const onEnd = (event: AnimationEvent): void => {
    if (event.target !== dialog) {
      return;
    }
    dialog.classList.remove(DIALOG_CLOSING_CLASS);
    dialog.close();
    document.body.classList.remove(BODY_DIALOG_OPEN_CLASS);
    dialog.removeEventListener('animationend', onEnd);
  };

  dialog.addEventListener('animationend', onEnd);
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
        applyAuthTab(tab);
      }
    });
  });

  switchLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const tab = link.dataset.authSwitch;
      if (tab === 'login' || tab === 'register') {
        applyAuthTab(tab);
      }
    });
  });

  closeBtn?.addEventListener('click', () => {
    closeAuthDialogWithAnimation(dialog);
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closeAuthDialogWithAnimation(dialog);
    }
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeAuthDialogWithAnimation(dialog);
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove(BODY_DIALOG_OPEN_CLASS);
  });
}
