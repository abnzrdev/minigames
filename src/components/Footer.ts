import rsSchoolLink from '../assets/games/rs-school-link.svg';

const RS_SCHOOL_URL = 'https://rs.school/courses/short-track';
const STUDENT_GITHUB = 'https://github.com/abnzrdev';
const STUDENT_GITHUB_LABEL = '@abnzrdev';

export function renderFooter(): HTMLElement {
  const footer = document.createElement('footer');
  footer.className = 'footer';

  footer.innerHTML = `
    <div class="layout-container footer__inner">
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
  `;

  return footer;
}
