import accentBar from '../assets/games/Yellow Accent Bar.svg';
import { fetchLeaderboard, type LeaderboardEntry } from '../api/leaderboard';
import {
  LEADERBOARD_TITLE,
  formatCompactScore,
  formatScore,
  getAvatarClass,
} from '../data/leaderboard';
import { showSnackbar } from './Snackbar';

function getInitials(name: string): string {
  const parts = name.replace(/_/g, ' ').split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function createRowsHtml(rows: LeaderboardEntry[]): string {
  return rows
    .map((row) => {
      const rankClass = row.rank === 1 ? ' leaderboard__rank--top' : '';

      return `
        <tr>
          <td
            class="leaderboard__cell leaderboard__cell--rank"
            data-label="Rank"
          >
            <span class="leaderboard__rank${rankClass}">
              #${row.rank}
            </span>
          </td>

          <td
            class="leaderboard__cell leaderboard__cell--player"
            data-label="Player"
          >
            <span class="leaderboard__player">
              <span
                class="leaderboard__avatar ${getAvatarClass(row.rank)}"
                aria-hidden="true"
              >
                ${getInitials(row.playerName)}
              </span>

              <span class="leaderboard__name">
                ${row.playerName}
              </span>
            </span>
          </td>

          <td
            class="leaderboard__cell leaderboard__cell--numeric leaderboard__cell--desktop"
            data-label="Games Played"
          >
            ${row.gamesPlayed}
          </td>

          <td
            class="leaderboard__cell leaderboard__cell--numeric leaderboard__cell--score"
            data-label="Score"
          >
            <span class="leaderboard__score leaderboard__score--full">
              ${formatScore(row.totalScore)}
            </span>

            <span class="leaderboard__score leaderboard__score--compact">
              ${formatCompactScore(row.totalScore)}
            </span>
          </td>

          <td
            class="leaderboard__cell leaderboard__cell--numeric"
            data-label="Streak"
          >
            <span class="leaderboard__streak">
              <span
                class="leaderboard__streak-icon"
                aria-hidden="true"
              >
                🔥
              </span>

              ${row.streakDays}

              <span
                class="leaderboard__streak-unit leaderboard__streak-unit--full"
              >
                days
              </span>

              <span
                class="leaderboard__streak-unit leaderboard__streak-unit--short"
              >
                d
              </span>
            </span>
          </td>

          <td
            class="leaderboard__cell leaderboard__cell--desktop"
            data-label="Favorite Game"
          >
            <span class="leaderboard__game-pill">
              ${row.favoriteGameName}
            </span>
          </td>
        </tr>
      `;
    })
    .join('');
}

function createLoadingHtml(): string {
  return Array.from(
    { length: 3 },
    () => `
      <tr class="leaderboard__skeleton-row">
        <td colspan="6">
          <div
            class="leaderboard__skeleton"
            aria-label="Loading leaderboard"
          ></div>
        </td>
      </tr>
    `
  ).join('');
}

function createEmptyHtml(): string {
  return `
    <tr>
      <td colspan="6">
        <div class="leaderboard__state">
          No leaderboard players are available right now.
        </div>
      </td>
    </tr>
  `;
}

function createErrorHtml(): string {
  return `
    <tr>
      <td colspan="6">
        <div class="leaderboard__state leaderboard__state--error">
          <p>Leaderboard could not be loaded.</p>

          <button
            type="button"
            class="leaderboard__retry"
          >
            Retry
          </button>
        </div>
      </td>
    </tr>
  `;
}

export function renderLeaderboard(): HTMLElement {
  const section = document.createElement('section');

  section.className = 'leaderboard';
  section.id = 'leaderboard';
  section.setAttribute('aria-labelledby', 'leaderboard-heading');

  section.innerHTML = `
    <div class="layout-container">
      <header class="leaderboard__header">
        <div class="leaderboard__title">
          <img
            src="${accentBar}"
            width="8"
            height="32"
            alt=""
            class="leaderboard__accent"
          />

          <h2
            class="leaderboard__heading"
            id="leaderboard-heading"
          >
            Top Players
            <span class="leaderboard__heading-rest">
              This Week
            </span>
          </h2>
        </div>
      </header>

      <div class="leaderboard__table-wrap">
        <table class="leaderboard__table">
          <caption class="leaderboard__caption">
            ${LEADERBOARD_TITLE}
          </caption>

          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Player</th>

              <th
                class="leaderboard__cell--desktop"
                scope="col"
              >
                Games Played
              </th>

              <th
                class="leaderboard__cell--score"
                scope="col"
              >
                <span
                  class="leaderboard__score leaderboard__score--full"
                >
                  Total Score
                </span>

                <span
                  class="leaderboard__score leaderboard__score--compact"
                >
                  Score
                </span>
              </th>

              <th scope="col">Streak</th>

              <th
                class="leaderboard__cell--desktop"
                scope="col"
              >
                Favorite Game
              </th>
            </tr>
          </thead>

          <tbody class="leaderboard__body">
            ${createLoadingHtml()}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const bodyNode = section.querySelector<HTMLTableSectionElement>('.leaderboard__body');

  if (!bodyNode) {
    return section;
  }

  const body = bodyNode;

  let recoveringFromError = false;

  async function loadLeaderboard(): Promise<void> {
    body.innerHTML = createLoadingHtml();

    try {
      const rows = await fetchLeaderboard();

      if (!section.isConnected) {
        return;
      }

      if (rows.length === 0) {
        body.innerHTML = createEmptyHtml();
        return;
      }

      body.innerHTML = createRowsHtml(rows);

      if (recoveringFromError) {
        showSnackbar('Leaderboard loaded successfully.', 'success');

        recoveringFromError = false;
      }
    } catch {
      if (!section.isConnected) {
        return;
      }

      recoveringFromError = true;

      body.innerHTML = createErrorHtml();

      showSnackbar('Could not load leaderboard.', 'error');

      const retryButton = body.querySelector<HTMLButtonElement>('.leaderboard__retry');

      retryButton?.addEventListener(
        'click',
        () => {
          void loadLeaderboard();
        },
        { once: true }
      );
    }
  }

  void loadLeaderboard();

  return section;
}
