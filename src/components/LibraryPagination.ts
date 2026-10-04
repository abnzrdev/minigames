import {
  LIBRARY_PAGE_CHANGE_EVENT,
  LIBRARY_PAGINATION_UPDATE_EVENT,
  type LibraryPageChangeDetail,
  type LibraryPaginationUpdateDetail,
} from './LibraryBody';

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

function dispatchPageChange(page: number): void {
  window.dispatchEvent(
    new CustomEvent<LibraryPageChangeDetail>(LIBRARY_PAGE_CHANGE_EVENT, {
      detail: {
        page,
      },
    })
  );
}

export function renderLibraryPagination(): HTMLElement {
  const section = document.createElement('section');

  section.className = 'pagination';
  section.setAttribute('aria-label', 'Pagination');

  const controls = document.createElement('div');

  controls.className = 'pagination__controls';

  section.appendChild(controls);

  let currentPage = 1;
  let totalPages = 1;

  function paint(): void {
    const safeTotalPages = Math.max(1, totalPages);

    const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

    currentPage = safeCurrentPage;

    const atStart = safeCurrentPage === 1;
    const atEnd = safeCurrentPage === safeTotalPages;

    const pages = visiblePages(safeCurrentPage, safeTotalPages, pageLimit());

    const pageButtons = pages
      .map((page) => {
        const active = page === safeCurrentPage;

        return `
          <button
            type="button"
            class="pagination__btn${active ? ' pagination__btn--active' : ''}"
            data-page="${page}"
            ${active ? 'aria-current="page"' : ''}
            aria-label="Page ${page}"
          >
            ${page}
          </button>
        `;
      })
      .join('');

    controls.innerHTML = `
      <button
        type="button"
        class="pagination__btn pagination__btn--icon"
        data-dir="prev"
        ${atStart ? 'disabled' : ''}
        aria-label="Previous page"
      >
        ${CHEVRON_LEFT}
      </button>

      ${pageButtons}

      <button
        type="button"
        class="pagination__btn pagination__btn--icon"
        data-dir="next"
        ${atEnd ? 'disabled' : ''}
        aria-label="Next page"
      >
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

    let nextPage = currentPage;

    const page = button.dataset.page;

    if (page) {
      nextPage = Number(page);
    } else if (button.dataset.dir === 'prev') {
      nextPage = currentPage - 1;
    } else if (button.dataset.dir === 'next') {
      nextPage = currentPage + 1;
    }

    if (
      !Number.isInteger(nextPage) ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === currentPage
    ) {
      return;
    }

    dispatchPageChange(nextPage);
  });

  const handlePaginationUpdate = (event: Event): void => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail = event.detail as LibraryPaginationUpdateDetail;

    if (!Number.isInteger(detail.page) || !Number.isInteger(detail.totalPages)) {
      return;
    }

    totalPages = Math.max(1, detail.totalPages);

    currentPage = Math.min(Math.max(1, detail.page), totalPages);

    paint();
  };

  window.addEventListener(LIBRARY_PAGINATION_UPDATE_EVENT, handlePaginationUpdate);

  const media = window.matchMedia(MOBILE_QUERY);

  const onMediaChange = (): void => {
    paint();
  };

  media.addEventListener('change', onMediaChange);

  const pageContent = document.getElementById('page-content');

  if (pageContent) {
    const observer = new MutationObserver(() => {
      if (!section.isConnected) {
        window.removeEventListener(LIBRARY_PAGINATION_UPDATE_EVENT, handlePaginationUpdate);

        media.removeEventListener('change', onMediaChange);

        observer.disconnect();
      }
    });

    observer.observe(pageContent, {
      childList: true,
    });
  }

  paint();

  return section;
}
