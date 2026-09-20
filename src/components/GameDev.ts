import developerCtaArt from '../assets/games/developer-cta-art.png';
import uploadIcon from '../assets/games/upload-game-icon.svg';

export function renderGameDev(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'game-dev';
  section.id = 'game-dev';
  section.setAttribute('aria-labelledby', 'game-dev-heading');

  section.innerHTML = `
    <div class="layout-container">
      <div class="game-dev__layout">
        <div class="game-dev__art" aria-hidden="true">
          <img
            class="game-dev__art-image"
            src="${developerCtaArt}"
            width="720"
            height="520"
            alt=""
          />
        </div>

        <div class="game-dev__panel">
          <h2 class="game-dev__heading" id="game-dev-heading">Are You a Game Developer?</h2>
          <p class="game-dev__text">
            Want to see your game on MiniGames? We&apos;re always looking for fun, engaging mini
            games to add to our platform. Submit your game and reach thousands of players!
          </p>
          <button type="button" class="game-dev__cta">
            <img src="${uploadIcon}" width="20" height="20" alt="" class="game-dev__cta-icon" />
            Submit Form
          </button>
          <p class="game-dev__note">
            or contact us at
            <a href="mailto:developers@minigames.com" class="game-dev__email">developers@minigames.com</a>
          </p>
        </div>
      </div>
    </div>
  `;

  return section;
}
