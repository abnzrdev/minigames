export function renderHero(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'hero';
  section.innerHTML = `
        <div class="hero__content">
            <h1 class="hero__title">Discover & Play Fun Mini Games</h1>
            <p class="hero__description">
                Challenge yourself with an exciting collection of casual web games.
                Track your scores, climb the leaderborad, and compete with  players worldwide!
            </p>
            <a href="#games" class="hero__cta">Explore Games</a>
        </div>
        <div class="hero__media">
            <span role="img" aria-label="Gaming Controller" class="hero__icon">🎮</span>
        </div>
    `;
  return section;
}
