import { LIBRARY_GAMES, type LibraryGame } from '../data/games';

const STAR_ICON = `<svg class="game-card__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
  <path fill="currentColor" d="M8 1.2l1.8 3.7 4.1.6-3 2.9.7 4.1L8 10.6 4.4 12.5l.7-4.1-3-2.9 4.1-.6L8 1.2z"/>
</svg>`;

const HEART_ICON = `<svg class="game-card__icon game-card__icon--like" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
  <path fill="currentColor" d="M8 13.4S2.2 9.6 2.2 5.9A3.3 3.3 0 0 1 8 4.4a3.3 3.3 0 0 1 5.8 1.5C13.8 9.6 8 13.4 8 13.4z"/>
</svg>`;

function priceClass(price: string): string {
  return price === 'Free' ? ' game-card__price--free' : '';
}

function cardMarkup(game: LibraryGame): string {
  return `
    <article class="game-card">
      <div class="game-card__media">
        <img class="game-card__cover" src="${game.cover}" alt="" width="400" height="220" />
      </div>
      <div class="game-card__body">
        <div class="game-card__top">
          <div class="game-card__heading">
            <h2 class="game-card__title">${game.title}</h2>
            <span class="game-card__category">${game.category}</span>
          </div>
          <span class="game-card__price${priceClass(game.price)}">${game.price}</span>
        </div>
        <p class="game-card__description">${game.description}</p>
        <div class="game-card__footer">
          <div class="game-card__meta">
            <div class="game-card__stats">
              <span class="game-card__stat game-card__stat--rating">
                ${STAR_ICON}
                <span>${game.rating}</span>
              </span>
              <span class="game-card__stat game-card__stat--likes">
                ${HEART_ICON}
                <span>${game.likes}</span>
              </span>
            </div>
            <span class="game-card__price game-card__price--mobile${priceClass(game.price)}">${game.price}</span>
          </div>
          <button type="button" class="game-card__details">Details</button>
        </div>
      </div>
    </article>
  `;
}

export function renderLibraryBody(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'library-body';
  section.setAttribute('aria-label', 'Games');

  section.innerHTML = `
    <div class="library-body__inner">
      <div class="library-body__grid">
        ${LIBRARY_GAMES.map(cardMarkup).join('')}
      </div>
    </div>
  `;

  return section;
}
