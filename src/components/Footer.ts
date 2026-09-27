import brandLogo from '../assets/games/Brand Logo.svg';
import { bindPageLinks, type AppPage } from '../utils/navigation';

const RS_SCHOOL_URL = 'https://rs.school/courses/short-track';
const STUDENT_GITHUB = 'https://github.com/abnzrdev';
const STUDENT_GITHUB_LABEL = '@abnzrdev';

const EXPLORE: { label: string; target: AppPage }[] = [
  { label: 'Home', target: 'home' },
  { label: 'Library', target: 'library' },
  { label: 'Categories', target: 'home' },
  { label: 'Tournaments', target: 'home' },
];

const COMPANY: { label: string; target: AppPage }[] = [
  { label: 'About Us', target: 'home' },
  { label: 'Contact', target: 'home' },
  { label: 'Privacy Policy', target: 'home' },
  { label: 'Terms of Service', target: 'home' },
];

function colMarkup(title: string, links: { label: string; target: AppPage }[]): string {
  const items = links
    .map(
      (link) => `<li><a href="#${link.target}" data-target="${link.target}">${link.label}</a></li>`
    )
    .join('');

  return `
    <div class="footer__col">
      <p class="footer__col-title">${title}</p>
      <ul class="footer__col-list">
        ${items}
      </ul>
    </div>
  `;
}

function socialButton(label: string, icon: string): string {
  return `
    <a href="#home" class="footer__social-btn" data-target="home" aria-label="${label}">
      ${icon}
    </a>
  `;
}

const SHARE_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="18" cy="5" r="2.2" stroke="currentColor" stroke-width="1.8" />
    <circle cx="6" cy="12" r="2.2" stroke="currentColor" stroke-width="1.8" />
    <circle cx="18" cy="19" r="2.2" stroke="currentColor" stroke-width="1.8" />
    <path d="M8.2 10.8 15.6 6.4M8.2 13.2l7.4 4.4" stroke="currentColor" stroke-width="1.8" />
  </svg>
`;

const CHAT_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 3.2V6a2 2 0 0 1 2-2z" />
  </svg>
`;

const RSS_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="6.2" cy="17.8" r="2.2" fill="currentColor" />
    <path fill="currentColor" d="M4 10.2a9.6 9.6 0 0 1 9.6 9.6h-2.8A6.8 6.8 0 0 0 4 13V10.2z" />
    <path fill="currentColor" d="M4 4.8A15.2 15.2 0 0 1 19.2 20h-2.8A12.4 12.4 0 0 0 4 7.6V4.8z" />
  </svg>
`;

const CODE_ICON = `
  <svg class="footer__code-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6z" />
  </svg>
`;

export function renderFooter(): HTMLElement {
  const footer = document.createElement('footer');
  footer.className = 'footer';

  footer.innerHTML = `
    <div class="footer__inner">
      <div class="footer__top">
        <div class="footer__brand">
          <a href="#home" class="footer__logo" data-target="home">
            <span class="footer__logo-mark" aria-hidden="true">
              <img src="${brandLogo}" width="32" height="32" alt="" />
            </span>
            <span class="footer__logo-text">MiniGames</span>
          </a>
          <p class="footer__tagline">
            Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.
          </p>
        </div>

        <div class="footer__links">
          <nav class="footer__nav" aria-label="Footer">
            ${colMarkup('Explore', EXPLORE)}
            ${colMarkup('Company', COMPANY)}
          </nav>
          <div class="footer__col footer__col--community">
            <p class="footer__col-title">Community</p>
            <div class="footer__social">
              ${socialButton('Share', SHARE_ICON)}
              ${socialButton('Chat', CHAT_ICON)}
              ${socialButton('RSS', RSS_ICON)}
            </div>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <p class="footer__copy">&copy; ${new Date().getFullYear()} MiniGames. All rights reserved.</p>
        <div class="footer__credits">
          <a href="${RS_SCHOOL_URL}" class="footer__credit" target="_blank" rel="noopener noreferrer">
            <span class="footer__badge footer__badge--rs" aria-hidden="true">RS</span>
            RS School
          </a>
          <a href="${STUDENT_GITHUB}" class="footer__credit" target="_blank" rel="noopener noreferrer">
            <span class="footer__badge footer__badge--github" aria-hidden="true">
              ${CODE_ICON}
            </span>
            ${STUDENT_GITHUB_LABEL}
          </a>
        </div>
        <p class="footer__note">Designed with love</p>
      </div>
    </div>
  `;

  bindPageLinks(footer);
  return footer;
}
