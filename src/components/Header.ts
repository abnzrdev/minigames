import brandLogo from '../assets/games/Brand Logo.svg';
import hamburgerIcon from '../assets/games/Hamburger Button.svg';
import { bindPageLinks, currentPage, type AppPage } from '../utils/navigation';
import { closeMobileMenu, openAuthDialog, toggleMobileMenu } from '../utils/authDialog';

const NAV_LINKS: { label: string; target: AppPage; nav?: AppPage }[] = [
  { label: 'Home', target: 'home', nav: 'home' },
  { label: 'Library', target: 'library', nav: 'library' },
  { label: 'Tournaments', target: 'home' },
  { label: 'Community', target: 'home' },
];

function logoMarkup(variant: 'bar' | 'menu'): string {
  if (variant === 'menu') {
    return `
      <a href="#home" class="header__logo header__logo--menu" data-target="home">
        <span class="header__logo-mark" aria-hidden="true">
          <img src="${brandLogo}" width="32" height="32" alt="" />
        </span>
        <span class="header__logo-text">MiniGames</span>
      </a>
    `;
  }

  return `
    <a href="#home" class="header__logo header__logo--bar" data-target="home" aria-label="MiniGames">
      <img
        class="header__logo--bar-full"
        src="${brandLogo}"
        width="172"
        height="32"
        alt=""
      />
      <span class="header__logo--bar-compact">
        <span class="header__logo-mark" aria-hidden="true">
          <img src="${brandLogo}" width="32" height="32" alt="" />
        </span>
        <span class="header__logo-text header__logo-text--bar">MiniGames</span>
      </span>
    </a>
  `;
}

export function renderHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'header';

  const navLinks = NAV_LINKS.map(({ label, target, nav }) => {
    const isActive = Boolean(nav && nav === currentPage());
    const activeClass = isActive ? ' header__link--active' : ' header__link--muted';
    const navAttr = nav ? ` data-nav="${nav}"` : '';
    return `<li><a href="#${target}" class="header__link${activeClass}" data-target="${target}"${navAttr}>${label}</a></li>`;
  }).join('');

  header.innerHTML = `
    <div class="header__inner layout-container">
      ${logoMarkup('bar')}
      <nav class="header__nav" id="site-nav" aria-label="Main navigation">
        <div class="header__menu-bar">
          ${logoMarkup('menu')}
          <button type="button" class="header__menu-close" id="menu-close-btn" aria-label="Close menu">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <ul class="header__nav-links">
          ${navLinks}
        </ul>
        <div class="header__auth header__auth--menu">
          <button type="button" class="header__auth-btn header__auth-btn--login" id="auth-menu-login-btn">
            Log In
          </button>
          <button type="button" class="header__auth-btn header__auth-btn--signup" id="auth-menu-signup-btn">
            Sign Up
          </button>
        </div>
      </nav>
      <div class="header__actions">
        <div class="header__toolbar">
          <button type="button" class="header__auth-btn header__auth-btn--login header__auth-btn--desktop" id="auth-login-btn">
            Log In
          </button>
          <button type="button" class="header__auth-btn header__auth-btn--signup" id="auth-signup-btn">
            Sign Up
          </button>
        </div>
        <button
          type="button"
          class="header__burger"
          id="burger-btn"
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="site-nav"
        >
          <img src="${hamburgerIcon}" width="32" height="32" alt="" />
        </button>
      </div>
    </div>
  `;

  const burgerBtn = header.querySelector<HTMLButtonElement>('#burger-btn');
  const menuCloseBtn = header.querySelector<HTMLButtonElement>('#menu-close-btn');
  const loginBtn = header.querySelector<HTMLButtonElement>('#auth-login-btn');
  const signupBtn = header.querySelector<HTMLButtonElement>('#auth-signup-btn');
  const menuLoginBtn = header.querySelector<HTMLButtonElement>('#auth-menu-login-btn');
  const menuSignupBtn = header.querySelector<HTMLButtonElement>('#auth-menu-signup-btn');

  bindPageLinks(header);

  burgerBtn?.addEventListener('click', () => {
    toggleMobileMenu();
  });

  menuCloseBtn?.addEventListener('click', () => {
    closeMobileMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }
    const nav = document.getElementById('site-nav');
    if (nav?.classList.contains('header__nav--open')) {
      closeMobileMenu();
    }
  });

  loginBtn?.addEventListener('click', () => openAuthDialog('login'));
  menuLoginBtn?.addEventListener('click', () => openAuthDialog('login'));
  signupBtn?.addEventListener('click', () => openAuthDialog('register'));
  menuSignupBtn?.addEventListener('click', () => openAuthDialog('register'));

  return header;
}

export function applyHeaderPage(page: AppPage): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((link) => {
    const active = link.dataset.nav === page;
    link.classList.toggle('header__link--active', active);
    link.classList.toggle('header__link--muted', !active);
  });
}
