import favoriteIcon from '../assets/games/favorite.svg';
import starIcon from '../assets/games/star.svg';
import tukoniHero from '../assets/games/tukoni-hero.png';

const COMMENTS = [
  {
    initial: 'F',
    name: 'ForestDweller',
    time: '3 hours ago',
    tone: 'blue',
    likes: 12,
    text: "The hand-drawn art is absolutely magical 🍄 Every location feels like a page from a children's storybook. The mushroom village made me cry happy tears!",
  },
  {
    initial: 'H',
    name: 'HerbalTeaLover',
    time: '1 day ago',
    tone: 'gold',
    likes: 5,
    text: 'Perfect cozy evening game — brew a cup of chamomile, wrap in a blanket and help the little Tukoni prepare for winter. The puzzles are gentle but satisfying.',
  },
  {
    initial: 'C',
    name: 'CottageCoreMia',
    time: '3 days ago',
    tone: 'sand',
    likes: 8,
    text: 'I want to live inside this game forever 🌿 The NPCs are so charming, the tea recipes are real, and the atmosphere is pure warmth and calm.',
  },
] as const;

const RECORDS = [
  { medal: '🥇', name: 'ForestSpirit', score: '356,700 pts', when: '2 days ago' },
  { medal: '🥈', name: 'TeaBrewer', score: '332,400pts', when: '5 days ago' },
  { medal: '🥉', name: 'HerbalistPath', score: '308,900 pts', when: '1 week ago' },
] as const;

function commentMarkup(comment: (typeof COMMENTS)[number]): string {
  return `
    <article class="game-details__comment">
      <div class="game-details__comment-head">
        <div class="game-details__person">
          <span class="game-details__avatar game-details__avatar--${comment.tone}">${comment.initial}</span>
          <span class="game-details__name">${comment.name}</span>
        </div>
        <span class="game-details__time">${comment.time}</span>
      </div>
      <p class="game-details__comment-text">${comment.text}</p>
      <button type="button" class="game-details__like" data-base-likes="${comment.likes}">
        <img src="${favoriteIcon}" width="16" height="16" alt="" />
        <span>${comment.likes}</span>
      </button>
    </article>
  `;
}

export function renderGameDetails(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-details';
  dialog.id = 'game-details';
  dialog.setAttribute('aria-labelledby', 'game-details-title');

  dialog.innerHTML = `
    <div class="game-details__card">
      <div class="game-details__hero">
        <img class="game-details__cover" src="${tukoniHero}" alt="" />
        <button type="button" class="game-details__close" aria-label="Close dialog">&times;</button>
      </div>
      <div class="game-details__body">
        <div class="game-details__title-row">
          <h2 class="game-details__title" id="game-details-title">Tukoni: Forest Keepers</h2>
          <div class="game-details__ratings">
            <span class="game-details__stat"><img src="${starIcon}" width="16" height="16" alt="" /> 4.9</span>
            <span class="game-details__stat"><img src="${favoriteIcon}" width="16" height="16" alt="" /> 31.2K</span>
          </div>
        </div>
        <p class="game-details__description">
          Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.
        </p>
        <div class="game-details__facts">
          <div class="game-details__fact"><span>Genre</span><strong>Puzzle</strong></div>
          <div class="game-details__fact"><span>Players</span><strong>Solo</strong></div>
          <div class="game-details__fact"><span>Duration</span><strong>40-90 min</strong></div>
          <div class="game-details__fact"><span>Price</span><strong>Free</strong></div>
        </div>
        <div class="game-details__actions">
          <button type="button" class="game-details__play">Play Now</button>
          <button type="button" class="game-details__favorite" aria-pressed="false">
            <img src="${favoriteIcon}" width="20" height="20" alt="" />
            <span>Add to Favorites</span>
          </button>
        </div>
        <section class="game-details__records" aria-label="Top Records">
          <h3 class="game-details__section-title">🏆 Top Records</h3>
          <ul class="game-details__record-list">
            ${RECORDS.map(
              (record) => `
                <li>
                  <span>${record.medal} ${record.name}</span>
                  <span><strong>${record.score}</strong> <span class="game-details__time">${record.when}</span></span>
                </li>
              `
            ).join('')}
          </ul>
        </section>
        <section class="game-details__comments" aria-label="Comments">
          <h3 class="game-details__section-title">Comments (3)</h3>
          <form class="game-details__composer">
            <span class="game-details__avatar game-details__avatar--you" aria-hidden="true">U</span>
            <label class="game-details__composer-field">
              <span class="visually-hidden">Write a comment</span>
              <textarea rows="1" placeholder="Write a comment..."></textarea>
            </label>
            <button type="submit" class="game-details__send" aria-label="Send comment">➤</button>
          </form>
          <div class="game-details__comment-list">
            ${COMMENTS.map(commentMarkup).join('')}
          </div>
        </section>
      </div>
    </div>
  `;

  return dialog;
}

function resetDialog(dialog: HTMLDialogElement): void {
  dialog
    .querySelector('.game-details__favorite')
    ?.classList.remove('game-details__favorite--active');
  dialog.querySelector('.game-details__favorite')?.setAttribute('aria-pressed', 'false');
  const textarea = dialog.querySelector('textarea');
  if (textarea) {
    textarea.value = '';
  }
  dialog.querySelectorAll<HTMLButtonElement>('.game-details__like').forEach((button) => {
    button.classList.remove('game-details__like--active');
    const count = button.querySelector('span');
    const base = button.dataset.baseLikes;
    if (count && base) {
      count.textContent = base;
    }
  });
}

export function initGameDetails(): void {
  const dialog = document.getElementById('game-details');
  if (!(dialog instanceof HTMLDialogElement)) {
    return;
  }

  const close = (): void => {
    if (!dialog.open || dialog.classList.contains('game-details--closing')) {
      return;
    }
    dialog.classList.add('game-details--closing');
    window.setTimeout(() => {
      dialog.classList.remove('game-details--closing');
      dialog.close();
      document.body.classList.remove('game-details-open');
      resetDialog(dialog);
    }, 200);
  };

  const open = (): void => {
    if (dialog.open) {
      return;
    }
    resetDialog(dialog);
    dialog.showModal();
    document.body.classList.add('game-details-open');
  };

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.closest('.game-card__details')) {
      open();
    }
  });

  dialog.querySelector('.game-details__close')?.addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      close();
    }
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  });

  dialog.querySelector('.game-details__favorite')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    const active = button.classList.toggle('game-details__favorite--active');
    button.setAttribute('aria-pressed', String(active));
  });

  dialog.querySelectorAll<HTMLButtonElement>('.game-details__like').forEach((button) => {
    button.addEventListener('click', () => {
      const count = button.querySelector('span');
      const base = Number(button.dataset.baseLikes ?? '0');
      const active = button.classList.toggle('game-details__like--active');
      if (count) {
        count.textContent = String(active ? base + 1 : base);
      }
    });
  });

  dialog.querySelector('.game-details__composer')?.addEventListener('submit', (event) => {
    event.preventDefault();
  });
}
