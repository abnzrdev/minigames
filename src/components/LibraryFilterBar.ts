import sortCheck from '../assets/games/sort-check.svg';

const FILTER_CHIPS = [
  'All Games',
  'Puzzle',
  'Card',
  'Match',
  'Farm',
  'Strategy',
  'Arcade',
] as const;

const SORT_OPTIONS = ['Rating ↑', 'Rating ↓', 'Name A→Z', 'Name Z→A'] as const;

type SortOption = (typeof SORT_OPTIONS)[number];

const DEFAULT_SORT: SortOption = 'Rating ↓';

let documentListenersBound = false;

function bindDocumentListeners(): void {
  if (documentListenersBound) {
    return;
  }
  documentListenersBound = true;

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    document.querySelectorAll<HTMLElement>('.library-filter-bar').forEach((bar) => {
      if (bar.contains(target)) {
        return;
      }
      const button = bar.querySelector<HTMLButtonElement>('.library-filter-bar__sort');
      const menu = bar.querySelector<HTMLUListElement>('.library-filter-bar__sort-menu');
      button?.setAttribute('aria-expanded', 'false');
      button?.classList.remove('library-filter-bar__sort--open');
      if (menu) {
        menu.hidden = true;
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }
    document.querySelectorAll<HTMLElement>('.library-filter-bar').forEach((bar) => {
      const button = bar.querySelector<HTMLButtonElement>('.library-filter-bar__sort');
      const menu = bar.querySelector<HTMLUListElement>('.library-filter-bar__sort-menu');
      button?.setAttribute('aria-expanded', 'false');
      button?.classList.remove('library-filter-bar__sort--open');
      if (menu) {
        menu.hidden = true;
      }
    });
  });
}

function chipMarkup(label: string, isActive: boolean): string {
  const activeClass = isActive ? ' library-filter-bar__chip--active' : '';
  return `<button type="button" class="library-filter-bar__chip${activeClass}" role="tab" aria-selected="${isActive}">${label}</button>`;
}

function sortOptionMarkup(label: SortOption, isSelected: boolean): string {
  const selectedClass = isSelected ? ' library-filter-bar__sort-option--selected' : '';
  const check = isSelected
    ? `<img class="library-filter-bar__sort-check" src="${sortCheck}" width="14" height="14" alt="" />`
    : `<span class="library-filter-bar__sort-check" aria-hidden="true"></span>`;

  return `<li><button type="button" class="library-filter-bar__sort-option${selectedClass}" role="option" aria-selected="${isSelected}">${check}<span class="library-filter-bar__sort-label">${label}</span></button></li>`;
}

export function renderLibraryFilterBar(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'library-filter-bar';
  section.setAttribute('aria-label', 'Filter and sort games');

  const chips = FILTER_CHIPS.map((label, index) => chipMarkup(label, index === 0)).join('');
  const options = SORT_OPTIONS.map((label) => sortOptionMarkup(label, label === DEFAULT_SORT)).join(
    ''
  );

  section.innerHTML = `
    <div class="library-filter-bar__inner">
      <div class="library-filter-bar__chips-scroll">
        <div class="library-filter-bar__chips" role="tablist" aria-label="Game categories">
          ${chips}
        </div>
      </div>
      <div class="library-filter-bar__sort-wrap">
        <button
          type="button"
          class="library-filter-bar__sort"
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-controls="library-sort-list"
        >
          <span class="library-filter-bar__sort-text">Sort by: ${DEFAULT_SORT}</span>
          <svg class="library-filter-bar__sort-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
          </svg>
        </button>
        <ul id="library-sort-list" class="library-filter-bar__sort-menu" role="listbox" hidden>
          ${options}
        </ul>
      </div>
    </div>
  `;

  const chipButtons = section.querySelectorAll<HTMLButtonElement>('.library-filter-bar__chip');
  chipButtons.forEach((chip) => {
    chip.addEventListener('click', () => {
      chipButtons.forEach((other) => {
        const isSelected = other === chip;
        other.classList.toggle('library-filter-bar__chip--active', isSelected);
        other.setAttribute('aria-selected', String(isSelected));
      });
    });
  });

  const sortButton = section.querySelector<HTMLButtonElement>('.library-filter-bar__sort');
  const sortText = section.querySelector<HTMLElement>('.library-filter-bar__sort-text');
  const sortMenu = section.querySelector<HTMLUListElement>('.library-filter-bar__sort-menu');
  const sortOptions = section.querySelectorAll<HTMLButtonElement>(
    '.library-filter-bar__sort-option'
  );

  function setMenuOpen(isOpen: boolean): void {
    if (!sortButton || !sortMenu) {
      return;
    }
    sortButton.setAttribute('aria-expanded', String(isOpen));
    sortMenu.hidden = !isOpen;
    sortButton.classList.toggle('library-filter-bar__sort--open', isOpen);
  }

  function selectSort(option: HTMLButtonElement): void {
    const label =
      option.querySelector('.library-filter-bar__sort-label')?.textContent ?? DEFAULT_SORT;
    sortOptions.forEach((other) => {
      const isSelected = other === option;
      other.classList.toggle('library-filter-bar__sort-option--selected', isSelected);
      other.setAttribute('aria-selected', String(isSelected));
      const mark = other.querySelector('.library-filter-bar__sort-check');
      if (isSelected && mark instanceof HTMLSpanElement) {
        const image = document.createElement('img');
        image.className = 'library-filter-bar__sort-check';
        image.src = sortCheck;
        image.width = 14;
        image.height = 14;
        image.alt = '';
        mark.replaceWith(image);
      }
      if (!isSelected && mark instanceof HTMLImageElement) {
        const placeholder = document.createElement('span');
        placeholder.className = 'library-filter-bar__sort-check';
        placeholder.setAttribute('aria-hidden', 'true');
        mark.replaceWith(placeholder);
      }
    });
    if (sortText) {
      sortText.textContent = `Sort by: ${label}`;
    }
    setMenuOpen(false);
  }

  sortButton?.addEventListener('click', () => {
    const isOpen = sortButton.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  sortOptions.forEach((option) => {
    option.addEventListener('click', () => {
      selectSort(option);
    });
  });

  bindDocumentListeners();

  return section;
}
