import { fetchGameComments, type GameComment } from '../api/comments';
import { escapeHtml } from '../utils/escapeHtml';
import { relativeTime } from '../utils/relativeTime';
import favoriteIcon from '../assets/games/favorite.svg';
import { showSnackbar } from './Snackbar';

function commentMarkup(comment: GameComment): string {
  return `
    <div class="game-details__comment">
      <div class="game-details__comment-head">
        <div class="game-details__person">
          <span class="game-details__avatar game-details__avatar--blue" aria-hidden="true">
            ${escapeHtml(comment.authorName.charAt(0))}
          </span>
          <span class="game-details__name">${escapeHtml(comment.authorName)}</span>
        </div>
        <time class="game-details__time" datetime="${escapeHtml(comment.createdAt)}">
          ${relativeTime(comment.createdAt)}
        </time>
      </div>
      <p class="game-details__comment-text">${escapeHtml(comment.text)}</p>
      <span class="game-details__like" aria-label="${comment.likesCount} likes">
        <img src="${favoriteIcon}" width="16" height="16" alt="" />
        <span>${comment.likesCount}</span>
      </span>
    </div>
  `;
}

export function loadGameComments(section: HTMLElement, slug: string): () => void {
  let controller: AbortController | null = null;
  let version = 0;
  let recovering = false;

  async function load(): Promise<void> {
    const current = ++version;
    controller?.abort();
    controller = new AbortController();
    section.innerHTML = `
      <h3 class="game-details__section-title">Comments</h3>
      <div class="game-details__loading" aria-label="Loading comments">
        <div class="game-details__loading-fact"></div>
        <div class="game-details__loading-fact"></div>
        <div class="game-details__loading-fact"></div>
      </div>
    `;
    try {
      const result = await fetchGameComments(slug, controller.signal);
      if (current !== version || !section.isConnected) return;
      section.innerHTML = `
        <h3 class="game-details__section-title">Comments (${result.meta.totalComments})</h3>
        <div class="game-details__comment-list">
          ${result.data.length ? result.data.map(commentMarkup).join('') : '<div class="game-details__state"><p>No comments yet.</p></div>'}
        </div>
      `;
      if (recovering) {
        showSnackbar('Comments loaded successfully.', 'success');
        recovering = false;
      }
    } catch {
      if (current !== version || !section.isConnected) return;
      recovering = true;
      section.innerHTML = `
        <h3 class="game-details__section-title">Comments</h3>
        <div class="game-details__state game-details__state--error">
          <p>Comments could not be loaded.</p>
          <button type="button" class="game-details__retry game-comments__retry">Retry</button>
        </div>
      `;
      showSnackbar('Could not load comments.', 'error');
      section
        .querySelector('.game-comments__retry')
        ?.addEventListener('click', () => void load(), { once: true });
    }
  }
  void load();
  return () => {
    version += 1;
    controller?.abort();
  };
}
