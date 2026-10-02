export function renderLibraryHero(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'library-hero';
  section.setAttribute('aria-labelledby', 'library-hero-title');

  section.innerHTML = `
    <div class="library-hero__inner">
      <h1 class="library-hero__title" id="library-hero-title">Game Library</h1>
      <p class="library-hero__subtitle">Browse our collection of casual mini-games</p>
    </div>
  `;

  return section;
}
