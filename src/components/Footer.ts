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
            <span class="footer__logo-mark" aria-hidden="true">
              <img src="${brandLogo}" width="32" height="32" alt="" />
            </span>
            <span class="footer__logo-text">MiniGames</span>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="1.8" />
                  <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
                  <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="1.8" />
                  <path d="M8.7 10.7 15.3 6.3M8.7 13.3l6.6 4.4" stroke="currentColor" stroke-width="1.8" />
                </svg>
              </a>
              <a href="#" class="footer__social-btn" aria-label="Discord">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" aria-hidden="true">
                  <path fill="currentColor" d="M16.224 3.768a14.5 14.5 0 0 0-3.67-1.153c-.158.286-.343.67-.47.976a13.5 13.5 0 0 0-4.067 0c-.128-.306-.317-.69-.476-.976A14.4 14.4 0 0 0 3.868 3.77C1.546 7.28.916 10.703 1.231 14.077a14.7 14.7 0 0 0 4.5 2.306q.545-.748.965-1.587a9.5 9.5 0 0 1-1.518-.74q.191-.14.372-.293c2.927 1.369 6.107 1.369 8.999 0q.183.152.372.294-.723.437-1.52.74.418.838.963 1.588a14.6 14.6 0 0 0 4.504-2.308c.37-3.911-.63-7.302-2.644-10.309m-9.13 8.234c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.894 0 1.614.82 1.599 1.82.001 1-.705 1.82-1.6 1.82m5.91 0c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.893 0 1.614.82 1.599 1.82 0 1-.706 1.82-1.6 1.82"/>
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

        <div class="footer__credits">
          <a href="${RS_SCHOOL_URL}" class="footer__rs-link" target="_blank" rel="noopener noreferrer">
            <img src="${rsSchoolLink}" width="99" height="24" alt="RS School" />
          </a>

          <a href="${STUDENT_GITHUB}" class="footer__github" target="_blank" rel="noopener noreferrer">
            <span class="footer__github-badge" aria-hidden="true">
              <svg class="footer__github-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 19 19" aria-hidden="true">
                <path fill="#242145" fill-rule="evenodd" d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844" clip-rule="evenodd"/>
              </svg>
            </span>
            ${STUDENT_GITHUB_LABEL}
          </a>
        </div>

        <p class="footer__note">Designed with love</p>
      </div>
    </div>
  `;

  return footer;
}
