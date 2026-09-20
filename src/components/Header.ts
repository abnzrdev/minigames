import brandLogo from '../assets/games/Brand Logo.svg';
import hamburgerIcon from '../assets/games/Hamburger Button.svg';

const NAV_LINKS = [
  { label: 'Home', href: '#' },
  { label: 'Library', href: '#' },
  { label: 'Tournaments', href: '#' },
  { label: 'Community', href: '#' },
] as const;

export function renderHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'header';

  const navLinks = NAV_LINKS.map(
    ({ label, href }) => `<a href="${href}" class="header__link">${label}</a>`,
  ).join('');

  header.innerHTML = `
  <div class="header__inner layout-container">
    <a href="#" class="header__logo">
      <img src="${brandLogo}" width="172" height="32" alt="MiniGames" />
    </a>
    <nav class="header__nav" id="header__nav" aria-label="Main navigation">
      ${navLinks}
      <button type="button" class="header__auth-btn" id="auth-btn">Sign In</button>
    </nav>
    <button
      type="button"
      class="header__burger"
      id="burger-btn"
      aria-label="Open menu"
      aria-expanded="false"
      aria-controls="header__nav"
    >
      <img src="${hamburgerIcon}" width="32" height="32" alt="" />
    </button>
  </div>
`;

  const burgerBtn = header.querySelector<HTMLButtonElement>('#burger-btn');
  const nav = header.querySelector<HTMLElement>('#header__nav');
  const authBtn = header.querySelector<HTMLButtonElement>('#auth-btn');
  burgerBtn?.addEventListener('click', () => {
    const isOpen = nav?.classList.toggle('header__nav--open');
    burgerBtn.setAttribute('aria-expanded', String(Boolean(isOpen)));
  });
  authBtn?.addEventListener('click', () => {
    const dialog = document.getElementById('auth-dialog');
    if (dialog instanceof HTMLDialogElement) {
      dialog.showModal();
    }
  });
  return header;
}
