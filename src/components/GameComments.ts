import { fetchGameComments, type GameComment } from '../api/comments';
import { escapeHtml } from '../utils/escapeHtml';
import { relativeTime } from '../utils/relativeTime';
import favoriteIcon from '../assets/games/favorite.svg';
import { showSnackbar } from './Snackbar';
import { commenterInitial, createCommentAvatarColors } from '../utils/commentAvatar';
import { appSession } from '../utils/session';

function commentMarkup(comment: GameComment, color: string): string {
  return `
    <div class="game-details__comment">
      <div class="game-details__comment-head">
        <div class="game-details__person">
          <span class="game-details__avatar ${color}" aria-hidden="true">
            ${escapeHtml(commenterInitial(comment.authorName))}
          </span>
          <span class="game-details__name">${escapeHtml(comment.authorName)}</span>
        </div>
        <time class="game-details__time" datetime="${escapeHtml(comment.createdAt)}">
          ${relativeTime(comment.createdAt)}
        </time>
      </div>
      <p class="game-details__comment-text"></p>
      <span class="game-details__like" aria-label="${comment.likesCount} likes">
        <img src="${favoriteIcon}" width="16" height="16" alt="" />
        <span>${comment.likesCount}</span>
      </span>
    </div>
  `;
}

export function loadGameComments(
  section: HTMLElement,
  slug: string
): (() => void) & { refresh: () => Promise<void> } {
  const colorFor = createCommentAvatarColors();
  let controller: AbortController | null = null;
  let version = 0;
  let recovering = false;
  let email = appSession.check()?.email;

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
      const requestEmail = appSession.check()?.email;
      const result = await fetchGameComments(slug, controller.signal, requestEmail);
      if (current !== version || !section.isConnected) return;
      if (requestEmail !== appSession.check()?.email) {
        void load();
        return;
      }
      section.innerHTML = `
        <h3 class="game-details__section-title">Comments (${result.meta.totalComments})</h3>
        <div class="game-details__comment-list">
          ${result.data.length ? result.data.map((comment) => commentMarkup(comment, colorFor(comment.authorName))).join('') : '<div class="game-details__state"><p>No comments yet.</p></div>'}
        </div>
      `;
      section
        .querySelectorAll<HTMLElement>('.game-details__comment-text')
        .forEach((element, index) => {
          element.textContent = result.data[index].text;
        });
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
  const unsubscribe = appSession.subscribe((session) => {
    if (email !== session?.email) {
      email = session?.email;
      void load();
    }
  });
  void load();
  return Object.assign(
    () => {
      unsubscribe();
      version += 1;
      controller?.abort();
    },
    { refresh: load }
  );
}
