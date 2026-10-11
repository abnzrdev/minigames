import { toggleCommentLike, type GameComment } from '../api/comments';
import { MutationFailure } from '../api/mutations';
import { appSession } from '../utils/session';
import { ensureActiveSession } from '../utils/protectedAction';
import { showSnackbar } from './Snackbar';

export function initializeCommentLike(
  row: HTMLElement,
  comment: GameComment,
  refresh: () => Promise<void>
): () => void {
  const button = row.querySelector<HTMLButtonElement>('.game-details__like')!;
  const count = button.querySelector<HTMLElement>('[data-comment-likes]')!;
  const status = document.createElement('p');
  status.className = 'game-details__like-status';
  status.setAttribute('role', 'status');
  status.hidden = true;
  row.append(status);
  let live = true;
  let pending = false;
  let unknown = false;
  let active = Boolean(appSession.check() && comment.isLikedByCurrentUser);
  function apply(next: boolean, likesCount?: number): void {
    active = next;
    button.classList.toggle('game-details__like--active', next);
    button.setAttribute('aria-pressed', String(next));
    if (likesCount !== undefined) count.textContent = String(likesCount);
    button.setAttribute(
      'aria-label',
      `${next ? 'Unlike' : 'Like'} comment, ${count.textContent} likes`
    );
  }
  apply(active, comment.likesCount);
  const unsubscribe = appSession.subscribe((session) => {
    if (!session) {
      apply(false);
      unknown = false;
      button.disabled = pending;
      status.hidden = true;
    }
  });
  async function click(): Promise<void> {
    if (pending || unknown || !ensureActiveSession()) return;
    const session = appSession.check()!;
    pending = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    status.hidden = false;
    status.textContent = 'Updating like…';
    try {
      const result = await toggleCommentLike(comment.commentId, session);
      const current = appSession.check();
      if (
        !live ||
        current?.email !== session.email ||
        current.authenticatedAt !== session.authenticatedAt
      )
        return;
      apply(result.active, result.likesCount);
      status.hidden = true;
      showSnackbar(result.active ? 'Comment liked.' : 'Comment like removed.', 'success');
    } catch (error) {
      if (!live || appSession.check()?.authenticatedAt !== session.authenticatedAt) return;
      unknown = !(error instanceof MutationFailure) || error.kind === 'unknown';
      const message = unknown
        ? 'Like result is unknown. Refresh comments before trying again.'
        : 'Comment like was rejected. Please try again.';
      status.textContent = message;
      status.hidden = false;
      if (unknown) {
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'game-details__retry';
        retry.textContent = 'Refresh comments';
        // Reconciliation reads personalized state; it never repeats the ambiguous toggle.
        retry.addEventListener('click', () => void refresh());
        status.append(retry);
      }
      showSnackbar(message, 'error');
    } finally {
      pending = false;
      if (live) {
        button.disabled = unknown;
        button.removeAttribute('aria-busy');
        apply(appSession.check() ? active : false);
      }
    }
  }
  button.addEventListener('click', click);
  return () => {
    live = false;
    unsubscribe();
    button.removeEventListener('click', click);
    status.remove();
  };
}
