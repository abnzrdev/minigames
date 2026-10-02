const PAGE_COUNT = 4;
const DESKTOP_LIMIT = 4;
const MOBILE_LIMIT = 3;
const MOBILE_QUERY = '(max-width: 767px)';

const CHEVRON_LEFT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>`;
const CHEVRON_RIGHT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m10 6-1.4 1.4L13.2 12l-4.6 4.6L10 18l6-6z"/></svg>`;

function pageLimit(): number {
  return window.matchMedia(MOBILE_QUERY).matches ? MOBILE_LIMIT : DESKTOP_LIMIT;
}

function visiblePages(current: number, total: number, limit: number): number[] {
  if (total <= limit) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  let start = Math.max(1, current - Math.floor((limit - 1) / 2));
  if (start + limit - 1 > total) {
    start = total - limit + 1;
  }

  return Array.from({ length: limit }, (_, index) => start + index);
}

export function renderLibraryPagination(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'pagination';
  section.setAttribute('aria-label', 'Pagination');

  const controls = document.createElement('div');
  controls.className = 'pagination__controls';
  section.appendChild(controls);

  let current = 1;

  function paint(): void {
    const atStart = current === 1;
    const atEnd = current === PAGE_COUNT;
    const pages = visiblePages(current, PAGE_COUNT, pageLimit());

    const pageButtons = pages
      .map((page) => {
        const active = page === current;
        return `<button type="button" class="pagination__btn${active ? ' pagination__btn--active' : ''}" data-page="${page}"${active ? ' aria-current="page"' : ''}>${page}</button>`;
      })
      .join('');

    controls.innerHTML = `
      <button type="button" class="pagination__btn pagination__btn--icon" data-dir="prev"${atStart ? ' disabled' : ''} aria-label="Previous page">
        ${CHEVRON_LEFT}
      </button>
      ${pageButtons}
      <button type="button" class="pagination__btn pagination__btn--icon" data-dir="next"${atEnd ? ' disabled' : ''} aria-label="Next page">
        ${CHEVRON_RIGHT}
      </button>
    `;
  }

  controls.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest('button');
    if (!(button instanceof HTMLButtonElement) || button.disabled) {
      return;
    }

    const page = button.dataset.page;
    if (page) {
      current = Number(page);
    } else if (button.dataset.dir === 'prev') {
      current -= 1;
    } else if (button.dataset.dir === 'next') {
      current += 1;
    }

    paint();
  });

  const media = window.matchMedia(MOBILE_QUERY);
  const onChange = (): void => {
    if (!section.isConnected) {
      media.removeEventListener('change', onChange);
      return;
    }
    paint();
  };
  media.addEventListener('change', onChange);

  paint();
  return section;
}
