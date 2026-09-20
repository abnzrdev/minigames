import brandLogo from '../assets/games/Brand Logo.svg';
import rsSchoolLink from '../assets/games/rs-school-link.svg';

const RS_SCHOOL_URL = 'https://rs.school/courses/short-track';
const STUDENT_GITHUB = 'https://github.com/abnzrdev';
const STUDENT_GITHUB_LABEL = '@abnzrdev';

const EXPLORE = [
  { label: 'Home', href: '#' },
  { label: 'Library', href: '#' },
  { label: 'Categories', href: '#' },
  { label: 'Tournaments', href: '#' },
];

const COMPANY = [
  { label: 'About Us', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

function colMarkup(title: string, links: { label: string; href: string }[]): string {
  return `
    <div class="footer__col">
      <p class="footer__col-title">${title}</p>
      <ul class="footer__col-list">
        ${links.map((link) => `<li><a href="${link.href}">${link.label}</a></li>`).join('')}
      </ul>
    </div>
  `;
}

export function renderFooter(): HTMLElement {
  const footer = document.createElement('footer');
  footer.className = 'footer';

  footer.innerHTML = `
    <div class="layout-container footer__shell">
      <div class="footer__top">
        <div class="footer__brand">
          <a href="#" class="footer__logo">
            <img src="${brandLogo}" width="172" height="32" alt="MiniGames" />
          </a>
          <p class="footer__tagline">
            Take a short break and have fun. Hundreds of curated casual mini-games right in your
            web browser. No download required.
          </p>
        </div>

        <nav class="footer__nav" aria-label="Footer">
          ${colMarkup('Explore', EXPLORE)}
          ${colMarkup('Company', COMPANY)}
          <div class="footer__col">
            <p class="footer__col-title">Community</p>
            <div class="footer__social">
              <a href="#" class="footer__social-btn" aria-label="Share">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true">
                  <use href="/icons.svg#social-icon"></use>
                </svg>
              </a>
              <a href="#" class="footer__social-btn" aria-label="Discord">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true">
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
              </a>
              <a href="#" class="footer__social-btn" aria-label="RSS">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
                  <circle cx="3.5" cy="12.5" r="1.6" />
                  <path d="M2 7.2a6.8 6.8 0 0 1 6.8 6.8h-2.1A4.7 4.7 0 0 0 2 9.3V7.2Z" />
                  <path d="M2 3.2A10.8 10.8 0 0 1 12.8 14H10.6A8.6 8.6 0 0 0 2 5.4V3.2Z" />
                </svg>
              </a>
            </div>
          </div>
        </nav>
      </div>

      <div class="footer__bar">
        <p class="footer__copy">&copy; ${new Date().getFullYear()} MiniGames. All rights reserved.</p>

        <a href="${RS_SCHOOL_URL}" class="footer__rs-link" target="_blank" rel="noopener noreferrer">
          <img src="${rsSchoolLink}" width="99" height="24" alt="RS School" />
        </a>

        <a href="${STUDENT_GITHUB}" class="footer__github" target="_blank" rel="noopener noreferrer">
          <span class="footer__github-badge" aria-hidden="true">
            <svg class="footer__github-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true">
              <use href="/icons.svg#github-icon"></use>
            </svg>
          </span>
          ${STUDENT_GITHUB_LABEL}
        </a>

        <p class="footer__note">Designed with love</p>
      </div>
    </div>
  `;

  return footer;
}
