const FILTER_CHIPS = [
  'All Games',
  'Puzzle',
  'Card',
  'Match',
  'Farm',
  'Strategy',
  'Arcade',
] as const;

function chipMarkup(label: string, isActive: boolean): string {
  const activeClass = isActive ? ' library-filter-bar__chip--active' : '';
  return `<button type="button" class="library-filter-bar__chip${activeClass}" aria-pressed="${isActive}">${label}</button>`;
}

export function renderLibraryFilterBar(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'library-filter-bar';
  section.setAttribute('aria-label', 'Filter and sort games');

  const chips = FILTER_CHIPS.map((label, index) => chipMarkup(label, index === 0)).join('');

  section.innerHTML = `
    <div class="library-filter-bar__inner">
      <div class="library-filter-bar__chips-scroll">
        <div class="library-filter-bar__chips" role="group" aria-label="Game categories">
          ${chips}
        </div>
      </div>
      <button type="button" class="library-filter-bar__sort" aria-haspopup="listbox">
        <span class="library-filter-bar__sort-text">Sort by: Rating ↓</span>
        <svg class="library-filter-bar__sort-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
        </svg>
      </button>
    </div>
  `;

  const chipButtons = section.querySelectorAll<HTMLButtonElement>('.library-filter-bar__chip');
  chipButtons.forEach((chip) => {
    chip.addEventListener('click', () => {
      chipButtons.forEach((other) => {
        const isSelected = other === chip;
        other.classList.toggle('library-filter-bar__chip--active', isSelected);
        other.setAttribute('aria-pressed', String(isSelected));
      });
    });
  });

  return section;
}
