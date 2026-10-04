import type { CategorySlug } from '../api/categories';
import { cardImageUrl, fetchLibraryGames, type Game, type GameSort } from '../api/games';
import {
  LIBRARY_CATEGORY_CHANGE_EVENT,
  LIBRARY_SORT_CHANGE_EVENT,
  type LibraryCategoryChangeDetail,
  type LibrarySortChangeDetail,
} from './LibraryFilterBar';
import { showSnackbar } from './Snackbar';

export const LIBRARY_PAGE_CHANGE_EVENT = 'library-page-change';
export const LIBRARY_PAGINATION_UPDATE_EVENT = 'library-pagination-update';

export interface LibraryPageChangeDetail {
  page: number;
}

export interface LibraryPaginationUpdateDetail {
  page: number;
  totalPages: number;
}

const STAR_ICON = `<svg class="game-card__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
  <path fill="currentColor" d="M8 1.2l1.8 3.7 4.1.6-3 2.9.7 4.1L8 10.6 4.4 12.5l.7-4.1-3-2.9 4.1-.6L8 1.2z"/>
</svg>`;

const HEART_ICON = `<svg class="game-card__icon game-card__icon--like" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
  <path fill="currentColor" d="M8 13.4S2.2 9.6 2.2 5.9A3.3 3.3 0 0 1 8 4.4a3.3 3.3 0 0 1 5.8 1.5C13.8 9.6 8 13.4 8 13.4z"/>
</svg>`;

function priceClass(price: string): string {
  return price === 'Free' ? ' game-card__price--free' : '';
}

function formatLikesCount(count: number): string {
  if (count < 1000) {
    return String(count);
  }

  const thousands = Math.floor(count / 100) / 10;

  return `${thousands.toFixed(1)}K`;
}

function formatCategory(category: string): string {
  if (!category) {
    return '';
  }

  return category.charAt(0).toUpperCase() + category.slice(1);
}

function cardMarkup(game: Game): string {
  return `
    <article
      class="game-card"
      data-slug="${game.slug}"
    >
      <div class="game-card__media">
        <img
          class="game-card__cover"
          src="${cardImageUrl(game.cardImage)}"
          alt=""
          width="400"
          height="220"
        />
      </div>

      <div class="game-card__body">
        <div class="game-card__top">
          <div class="game-card__heading">
            <h2 class="game-card__title">
              ${game.name}
            </h2>

            <span class="game-card__category">
              ${formatCategory(game.category)}
            </span>
          </div>

          <span
            class="game-card__price${priceClass(game.price)}"
          >
            ${game.price}
          </span>
        </div>

        <p class="game-card__description">
          ${game.shortDescription}
        </p>

        <div class="game-card__footer">
          <div class="game-card__meta">
            <div class="game-card__stats">
              <span
                class="game-card__stat game-card__stat--rating"
              >
                ${STAR_ICON}
                <span>${game.rating.toFixed(1)}</span>
              </span>

              <span
                class="game-card__stat game-card__stat--likes"
              >
                ${HEART_ICON}
                <span>
                  ${formatLikesCount(game.likesCount)}
                </span>
              </span>
            </div>

            <span
              class="game-card__price game-card__price--mobile${priceClass(game.price)}"
            >
              ${game.price}
            </span>
          </div>

          <button
            type="button"
            class="game-card__details"
            data-slug="${game.slug}"
          >
            Details
          </button>
        </div>
      </div>
    </article>
  `;
}

function createLoadingHtml(): string {
  return Array.from(
    { length: 6 },
    () => `
      <div
        class="library-body__skeleton"
        aria-label="Loading game"
      ></div>
    `
  ).join('');
}

function createEmptyHtml(): string {
  return `
    <div class="library-body__state">
      <p>Data Not Found</p>
    </div>
  `;
}

function createErrorHtml(): string {
  return `
    <div
      class="library-body__state library-body__state--error"
    >
      <p>Games could not be loaded.</p>

      <button
        type="button"
        class="library-body__retry"
      >
        Retry
      </button>
    </div>
  `;
}

function dispatchPaginationUpdate(page: number, totalPages: number): void {
  window.dispatchEvent(
    new CustomEvent<LibraryPaginationUpdateDetail>(LIBRARY_PAGINATION_UPDATE_EVENT, {
      detail: {
        page,
        totalPages,
      },
    })
  );
}

export function renderLibraryBody(): HTMLElement {
  const section = document.createElement('section');

  section.className = 'library-body';
  section.setAttribute('aria-label', 'Games');

  section.innerHTML = `
    <div class="library-body__inner">
      <div class="library-body__grid">
        ${createLoadingHtml()}
      </div>
    </div>
  `;

  const gridNode = section.querySelector<HTMLElement>('.library-body__grid');

  if (!gridNode) {
    return section;
  }

  const grid = gridNode;

  let activeCategory: CategorySlug = 'all';
  let activeSort: GameSort = 'rating-desc';
  let activePage = 1;
  let recoveringFromError = false;
  let requestVersion = 0;

  async function loadGames(): Promise<void> {
    const currentRequest = ++requestVersion;

    grid.innerHTML = createLoadingHtml();

    try {
      const result = await fetchLibraryGames({
        category: activeCategory,
        sort: activeSort,
        page: activePage,
        limit: 6,
      });

      if (currentRequest !== requestVersion || !section.isConnected) {
        return;
      }

      const totalPages = Math.max(1, result.meta.totalPages);
      const page = Math.min(Math.max(1, result.meta.page), totalPages);

      activePage = page;

      dispatchPaginationUpdate(page, totalPages);

      if (result.games.length === 0) {
        grid.innerHTML = createEmptyHtml();
        return;
      }

      grid.innerHTML = result.games.map(cardMarkup).join('');

      if (recoveringFromError) {
        showSnackbar('Games loaded successfully.', 'success');

        recoveringFromError = false;
      }
    } catch {
      if (currentRequest !== requestVersion || !section.isConnected) {
        return;
      }

      recoveringFromError = true;

      grid.innerHTML = createErrorHtml();

      showSnackbar('Could not load games.', 'error');

      const retryButton = grid.querySelector<HTMLButtonElement>('.library-body__retry');

      retryButton?.addEventListener(
        'click',
        () => {
          void loadGames();
        },
        { once: true }
      );
    }
  }

  const handleCategoryChange = (event: Event): void => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail = event.detail as LibraryCategoryChangeDetail;

    if (detail.category === activeCategory) {
      return;
    }

    activeCategory = detail.category;
    activePage = 1;

    dispatchPaginationUpdate(1, 1);

    void loadGames();
  };

  const handleSortChange = (event: Event): void => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail = event.detail as LibrarySortChangeDetail;

    if (detail.sort === activeSort) {
      return;
    }

    activeSort = detail.sort;
    activePage = 1;

    dispatchPaginationUpdate(1, 1);

    void loadGames();
  };

  const handlePageChange = (event: Event): void => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail = event.detail as LibraryPageChangeDetail;

    if (!Number.isInteger(detail.page) || detail.page < 1 || detail.page === activePage) {
      return;
    }

    activePage = detail.page;

    void loadGames();
  };

  window.addEventListener(LIBRARY_CATEGORY_CHANGE_EVENT, handleCategoryChange);

  window.addEventListener(LIBRARY_SORT_CHANGE_EVENT, handleSortChange);

  window.addEventListener(LIBRARY_PAGE_CHANGE_EVENT, handlePageChange);

  const pageContent = document.getElementById('page-content');

  if (pageContent) {
    const observer = new MutationObserver(() => {
      if (!section.isConnected) {
        window.removeEventListener(LIBRARY_CATEGORY_CHANGE_EVENT, handleCategoryChange);

        window.removeEventListener(LIBRARY_SORT_CHANGE_EVENT, handleSortChange);

        window.removeEventListener(LIBRARY_PAGE_CHANGE_EVENT, handlePageChange);

        observer.disconnect();
      }
    });

    observer.observe(pageContent, {
      childList: true,
    });
  }

  void loadGames();

  return section;
}
