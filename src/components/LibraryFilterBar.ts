import { fetchCategories, type Category, type CategorySlug } from '../api/categories';
import type { GameSort } from '../api/games';
import { showSnackbar } from './Snackbar';

export const LIBRARY_CATEGORY_CHANGE_EVENT = 'library-category-change';
export const LIBRARY_SORT_CHANGE_EVENT = 'library-sort-change';

export interface LibraryCategoryChangeDetail {
  category: CategorySlug;
}

export interface LibrarySortChangeDetail {
  sort: GameSort;
}

const SORT_OPTIONS: Array<{
  value: GameSort;
  label: string;
}> = [
  {
    value: 'rating-desc',
    label: 'Rating ↓',
  },
  {
    value: 'rating-asc',
    label: 'Rating ↑',
  },
  {
    value: 'name-asc',
    label: 'Name A–Z',
  },
  {
    value: 'name-desc',
    label: 'Name Z–A',
  },
];

function chipMarkup(category: Category, activeCategory: CategorySlug): string {
  const isActive = category.slug === activeCategory;
  const activeClass = isActive ? ' library-filter-bar__chip--active' : '';

  return `
    <button
      type="button"
      class="library-filter-bar__chip${activeClass}"
      data-category="${category.slug}"
      aria-pressed="${isActive}"
    >
      ${category.label}
    </button>
  `;
}

function sortOptionsMarkup(): string {
  return SORT_OPTIONS.map(
    (option) => `
      <option value="${option.value}">
        ${option.label}
      </option>
    `
  ).join('');
}

function createLoadingHtml(): string {
  return `
    <div
      class="library-filter-bar__loading"
      aria-label="Loading categories"
    >
      <span class="library-filter-bar__skeleton"></span>
      <span class="library-filter-bar__skeleton"></span>
      <span class="library-filter-bar__skeleton"></span>
      <span class="library-filter-bar__skeleton"></span>
    </div>
  `;
}

function createEmptyHtml(): string {
  return `
    <div class="library-filter-bar__state">
      No categories available.
    </div>
  `;
}

function createErrorHtml(): string {
  return `
    <div
      class="library-filter-bar__state library-filter-bar__state--error"
    >
      <span>Categories could not be loaded.</span>

      <button
        type="button"
        class="library-filter-bar__retry"
      >
        Retry
      </button>
    </div>
  `;
}

function dispatchCategoryChange(category: CategorySlug): void {
  window.dispatchEvent(
    new CustomEvent<LibraryCategoryChangeDetail>(LIBRARY_CATEGORY_CHANGE_EVENT, {
      detail: {
        category,
      },
    })
  );
}

function dispatchSortChange(sort: GameSort): void {
  window.dispatchEvent(
    new CustomEvent<LibrarySortChangeDetail>(LIBRARY_SORT_CHANGE_EVENT, {
      detail: {
        sort,
      },
    })
  );
}

export function renderLibraryFilterBar(): HTMLElement {
  const section = document.createElement('section');

  section.className = 'library-filter-bar';
  section.setAttribute('aria-label', 'Filter and sort games');

  section.innerHTML = `
    <div class="library-filter-bar__inner">
      <div class="library-filter-bar__chips-scroll">
        <div
          class="library-filter-bar__chips"
          role="group"
          aria-label="Game categories"
        >
          ${createLoadingHtml()}
        </div>
      </div>

      <label class="library-filter-bar__sort">
        <span class="library-filter-bar__sort-label">
          Sort by:
        </span>

        <select
          class="library-filter-bar__sort-select"
          aria-label="Sort games"
        >
          ${sortOptionsMarkup()}
        </select>

        <svg
          class="library-filter-bar__sort-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M7 10l5 5 5-5H7z"
            fill="currentColor"
          />
        </svg>
      </label>
    </div>
  `;

  const chipsNode = section.querySelector<HTMLElement>('.library-filter-bar__chips');
  const sortSelect = section.querySelector<HTMLSelectElement>('.library-filter-bar__sort-select');

  if (!chipsNode || !sortSelect) {
    return section;
  }

  const chips = chipsNode;

  sortSelect.value = 'rating-desc';

  sortSelect.addEventListener('change', () => {
    const sort = sortSelect.value as GameSort;

    dispatchSortChange(sort);
  });

  let recoveringFromError = false;

  function activateCategory(selectedCategory: CategorySlug): void {
    const buttons = chips.querySelectorAll<HTMLButtonElement>('.library-filter-bar__chip');

    buttons.forEach((button) => {
      const isSelected = button.dataset.category === selectedCategory;

      button.classList.toggle('library-filter-bar__chip--active', isSelected);

      button.setAttribute('aria-pressed', String(isSelected));
    });
  }

  function bindCategoryButtons(): void {
    const buttons = chips.querySelectorAll<HTMLButtonElement>('.library-filter-bar__chip');

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.dataset.category as CategorySlug | undefined;

        if (!category) {
          return;
        }

        activateCategory(category);
        dispatchCategoryChange(category);
      });
    });
  }

  async function loadCategories(): Promise<void> {
    chips.innerHTML = createLoadingHtml();

    try {
      const categories = await fetchCategories();

      if (!section.isConnected) {
        return;
      }

      if (categories.length === 0) {
        chips.innerHTML = createEmptyHtml();
        return;
      }

      const defaultCategory = categories.find((category) => category.isDefault) ?? categories[0];

      chips.innerHTML = categories
        .map((category) => chipMarkup(category, defaultCategory.slug))
        .join('');

      bindCategoryButtons();

      dispatchCategoryChange(defaultCategory.slug);

      if (recoveringFromError) {
        showSnackbar('Categories loaded successfully.', 'success');

        recoveringFromError = false;
      }
    } catch {
      if (!section.isConnected) {
        return;
      }

      recoveringFromError = true;

      chips.innerHTML = createErrorHtml();

      showSnackbar('Could not load categories.', 'error');

      const retryButton = chips.querySelector<HTMLButtonElement>('.library-filter-bar__retry');

      retryButton?.addEventListener(
        'click',
        () => {
          void loadCategories();
        },
        { once: true }
      );
    }
  }

  void loadCategories();

  return section;
}
