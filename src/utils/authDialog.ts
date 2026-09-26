const BODY_MENU_OPEN_CLASS = 'menu-open';

export type AuthDialogTab = 'login' | 'register';

export function openAuthDialog(tab: AuthDialogTab = 'login'): void {
  void tab;
  const dialog = document.getElementById('auth-dialog');
  if (!(dialog instanceof HTMLDialogElement)) {
    return;
  }

  closeMobileMenu();
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
