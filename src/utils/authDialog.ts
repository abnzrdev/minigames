import { currentRoute, subscribeRoute, updateRoute, type RouteState } from './navigation';

const BODY_MENU_OPEN_CLASS = 'menu-open';
const BODY_DIALOG_OPEN_CLASS = 'auth-open';
const DIALOG_CLOSING_CLASS = 'auth-dialog--closing';

export type AuthDialogTab = 'login' | 'register';
let closeTimer = 0;

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
