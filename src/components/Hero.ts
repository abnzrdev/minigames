import heroRoomArt from '../assets/games/hero-bg.jpg';

export function renderHero(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'hero';

  section.innerHTML = `
    <div class="hero__bleed">
      <img class="hero__backdrop" src="${heroRoomArt}" alt="" />
      <div class="hero__scrim" aria-hidden="true"></div>
      <div class="layout-container hero__content">
        <div class="hero__panel">
          <h1 class="hero__title">Take a Short Break &amp; Have Fun</h1>
          <p class="hero__description">
            Discover hundreds of curated casual mini-games. Play instantly in your browser —
            puzzle, match 3, farm, and board classics.
          </p>
          <button type="button" class="hero__cta">Browse Library</button>
        </div>
      </div>
    </div>
  `;

  return section;
}
