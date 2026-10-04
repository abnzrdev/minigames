import favoriteIcon from '../assets/games/favorite.svg';
import starIcon from '../assets/games/star.svg';
import { fetchGameDetails, gameAssetUrl, type GameDetails, type GameRecord } from '../api/games';
import { showSnackbar } from './Snackbar';
import { escapeHtml } from '../utils/escapeHtml';

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

function formatLikesCount(count: number): string {
  if (count < 1000) {
    return String(count);
  }

  const thousands = Math.floor(count / 100) / 10;

  return `${thousands.toFixed(1)}K`;
}

function formatScore(score: number): string {
  return `${score.toLocaleString()} pts`;
}

function formatRecordDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function medalForPosition(position: number): string {
  if (position === 1) {
    return '🥇';
  }

  if (position === 2) {
    return '🥈';
  }

  if (position === 3) {
    return '🥉';
  }

  return `#${position}`;
}

function commentMarkup(comment: (typeof COMMENTS)[number]): string {
  return `
    <div class="game-details__comment">
      <div class="game-details__comment-head">
        <div class="game-details__person">
          <span
            class="game-details__avatar game-details__avatar--${comment.tone}"
          >
            ${comment.initial}
          </span>

          <span class="game-details__name">
            ${comment.name}
          </span>
        </div>

        <span class="game-details__time">
          ${comment.time}
        </span>
      </div>

      <p class="game-details__comment-text">
        ${comment.text}
      </p>

      <button
        type="button"
        class="game-details__like"
        data-base-likes="${comment.likes}"
      >
        <img
          src="${favoriteIcon}"
          width="16"
          height="16"
          alt=""
        />

        <span>${comment.likes}</span>
      </button>
    </div>
  `;
}

function recordMarkup(record: GameRecord): string {
  return `
    <li>
      <span>
        ${medalForPosition(record.position)}
        ${escapeHtml(record.playerName)}
      </span>

      <span>
        <strong>${formatScore(record.score)}</strong>

        <span class="game-details__time">
          ${formatRecordDate(record.achievedAt)}
        </span>
      </span>
    </li>
  `;
}

function createLoadingHtml(): string {
  return `
    <div class="game-details__hero">
      <div
        class="game-details__hero-skeleton"
        aria-label="Loading game details"
      ></div>

      <button
        type="button"
        class="game-details__close"
        aria-label="Close dialog"
      >
        &times;
      </button>
    </div>

    <div class="game-details__body">
      <div class="game-details__loading">
        <div
          class="game-details__loading-line game-details__loading-line--title"
        ></div>

        <div class="game-details__loading-line"></div>
        <div class="game-details__loading-line"></div>
        <div class="game-details__loading-line"></div>

        <div class="game-details__loading-facts">
          <div class="game-details__loading-fact"></div>
          <div class="game-details__loading-fact"></div>
          <div class="game-details__loading-fact"></div>
          <div class="game-details__loading-fact"></div>
        </div>
      </div>
    </div>
  `;
}

function createEmptyHtml(): string {
  return `
    <div class="game-details__hero">
      <button
        type="button"
        class="game-details__close"
        aria-label="Close dialog"
      >
        &times;
      </button>
    </div>

    <div class="game-details__body">
      <div class="game-details__state">
        <p>Game details are not available.</p>
      </div>
    </div>
  `;
}

function createErrorHtml(): string {
  return `
    <div class="game-details__hero">
      <button
        type="button"
        class="game-details__close"
        aria-label="Close dialog"
      >
        &times;
      </button>
    </div>

    <div class="game-details__body">
      <div
        class="game-details__state game-details__state--error"
      >
        <p>Game details could not be loaded.</p>

        <button
          type="button"
          class="game-details__retry"
        >
          Retry
        </button>
      </div>
    </div>
  `;
}

function createGameDetailsHtml(game: GameDetails): string {
  const favoriteClass = game.isLikedByCurrentUser ? ' game-details__favorite--active' : '';

  const favoriteText = game.isLikedByCurrentUser ? 'Remove from Favorites' : 'Add to Favorites';

  const records =
    game.topRecords?.length > 0
      ? game.topRecords.map(recordMarkup).join('')
      : `
          <li>
            <span>No records yet.</span>
          </li>
        `;

  return `
    <div class="game-details__hero">
      <img
        class="game-details__cover"
        src="${gameAssetUrl(game.heroImage)}"
        alt="${escapeHtml(game.name)}"
      />

      <button
        type="button"
        class="game-details__close"
        aria-label="Close dialog"
      >
        &times;
      </button>
    </div>

    <div class="game-details__body">
      <div class="game-details__title-row">
        <h2
          class="game-details__title"
          id="game-details-title"
        >
          ${escapeHtml(game.name)}
        </h2>

        <div class="game-details__ratings">
          <span class="game-details__stat">
            <img
              src="${starIcon}"
              width="16"
              height="16"
              alt=""
            />

            ${game.rating.toFixed(1)}
          </span>

          <span class="game-details__stat">
            <img
              src="${favoriteIcon}"
              width="16"
              height="16"
              alt=""
            />

            ${formatLikesCount(game.likesCount)}
          </span>
        </div>
      </div>

      <p class="game-details__description">
        ${escapeHtml(game.fullDescription)}
      </p>

      <div class="game-details__facts">
        <div class="game-details__fact">
          <span>Genre</span>
          <strong>${escapeHtml(game.specs.genre)}</strong>
        </div>

        <div class="game-details__fact">
          <span>Players</span>
          <strong>${escapeHtml(game.specs.players)}</strong>
        </div>

        <div class="game-details__fact">
          <span>Duration</span>
          <strong>${escapeHtml(game.specs.duration)}</strong>
        </div>

        <div class="game-details__fact">
          <span>Price</span>
          <strong>${escapeHtml(game.specs.price)}</strong>
        </div>
      </div>

      <div class="game-details__actions">
        <button
          type="button"
          class="game-details__play"
        >
          Play Now
        </button>

        <button
          type="button"
          class="game-details__favorite${favoriteClass}"
          aria-pressed="${game.isLikedByCurrentUser}"
        >
          <img
            src="${favoriteIcon}"
            width="20"
            height="20"
            alt=""
          />

          <span>${favoriteText}</span>
        </button>
      </div>

      <section
        class="game-details__records"
        aria-label="Top Records"
      >
        <h3 class="game-details__section-title">
          🏆 Top Records
        </h3>

        <ul class="game-details__record-list">
          ${records}
        </ul>
      </section>

      <section
        class="game-details__comments"
        aria-label="Comments"
      >
        <h3 class="game-details__section-title">
          Comments (${COMMENTS.length})
        </h3>

        <form class="game-details__composer">
          <span
            class="game-details__avatar game-details__avatar--you"
            aria-hidden="true"
          >
            U
          </span>

          <label class="game-details__composer-field">
            <span class="visually-hidden">
              Write a comment
            </span>

            <textarea
              rows="1"
              placeholder="Write a comment..."
            ></textarea>
          </label>

          <button
            type="submit"
            class="game-details__send"
            aria-label="Send comment"
          >
            ➤
          </button>
        </form>

        <div class="game-details__comment-list">
          ${COMMENTS.map(commentMarkup).join('')}
        </div>
      </section>
    </div>
  `;
}

export function renderGameDetails(): HTMLDialogElement {
  const dialog = document.createElement('dialog');

  dialog.className = 'game-details';
  dialog.id = 'game-details';
  dialog.setAttribute('aria-labelledby', 'game-details-title');

  dialog.innerHTML = `
    <div class="game-details__card">
      ${createLoadingHtml()}
    </div>
  `;

  return dialog;
}

let requestVersion = 0;
let activeSlug = '';
let recoveringFromError = false;
let requestController: AbortController | null = null;
let closeTimer = 0;

async function loadGameDetails(dialog: HTMLDialogElement, slug: string): Promise<void> {
  const card = dialog.querySelector<HTMLElement>('.game-details__card');

  if (!card) {
    return;
  }

  const currentRequest = ++requestVersion;
  requestController?.abort();
  requestController = new AbortController();

  card.innerHTML = createLoadingHtml();

  try {
    const game = await fetchGameDetails(slug, undefined, requestController.signal);

    if (currentRequest !== requestVersion || !dialog.open) {
      return;
    }

    if (!game?.slug || !game.name || !game.specs || !game.fullDescription) {
      card.innerHTML = createEmptyHtml();
      return;
    }

    card.innerHTML = createGameDetailsHtml(game);

    if (recoveringFromError) {
      showSnackbar('Game details loaded successfully.', 'success');

      recoveringFromError = false;
    }
  } catch {
    if (currentRequest !== requestVersion || !dialog.open) {
      return;
    }

    recoveringFromError = true;

    card.innerHTML = createErrorHtml();

    showSnackbar('Could not load game details.', 'error');
  }
}

export function openGameDetailsDialog(slug: string): void {
  const dialog = document.getElementById('game-details');

  if (!(dialog instanceof HTMLDialogElement) || !slug) {
    return;
  }

  activeSlug = slug;
  recoveringFromError = false;
  window.clearTimeout(closeTimer);
  dialog.classList.remove('game-details--closing');

  if (!dialog.open) {
    dialog.showModal();

    document.body.classList.add('game-details-open');
  }

  void loadGameDetails(dialog, slug);
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

    requestVersion += 1;
    requestController?.abort();

    dialog.classList.add('game-details--closing');

    closeTimer = window.setTimeout(() => {
      dialog.classList.remove('game-details--closing');

      dialog.close();

      document.body.classList.remove('game-details-open');

      activeSlug = '';
      recoveringFromError = false;
    }, 200);
  };

  document.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest<HTMLButtonElement>('.game-card__details');

    if (!button) {
      return;
    }

    const slug = button.dataset.slug;

    if (!slug) {
      return;
    }

    openGameDetailsDialog(slug);
  });

  dialog.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest('.game-details__close')) {
      close();
      return;
    }

    if (target.closest('.game-details__retry')) {
      if (activeSlug) {
        void loadGameDetails(dialog, activeSlug);
      }

      return;
    }

    const favoriteButton = target.closest<HTMLButtonElement>('.game-details__favorite');

    if (favoriteButton) {
      const active = favoriteButton.classList.toggle('game-details__favorite--active');

      favoriteButton.setAttribute('aria-pressed', String(active));

      const label = favoriteButton.querySelector('span');

      if (label) {
        label.textContent = active ? 'Remove from Favorites' : 'Add to Favorites';
      }

      return;
    }

    const likeButton = target.closest<HTMLButtonElement>('.game-details__like');

    if (likeButton) {
      const count = likeButton.querySelector('span');

      const base = Number(likeButton.dataset.baseLikes ?? '0');

      const active = likeButton.classList.toggle('game-details__like--active');

      if (count) {
        count.textContent = String(active ? base + 1 : base);
      }

      return;
    }

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

  dialog.addEventListener('input', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }

    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  });

  dialog.addEventListener('submit', (event) => {
    if (
      event.target instanceof HTMLFormElement &&
      event.target.matches('.game-details__composer')
    ) {
      event.preventDefault();
    }
  });

  dialog.addEventListener('close', () => {
    requestVersion += 1;
    requestController?.abort();
    window.clearTimeout(closeTimer);
    dialog.classList.remove('game-details--closing');
    activeSlug = '';
    recoveringFromError = false;
    document.body.classList.remove('game-details-open');
  });
}
