import { toggleFavorite } from '../api/favorites';
import { fetchGameDetails, type GameDetails } from '../api/games';
import { MutationFailure } from '../api/mutations';
import { appSession } from '../utils/session';
import { ensureActiveSession } from '../utils/protectedAction';
import { showSnackbar } from './Snackbar';

export function initializeFavoriteControl(
  root: HTMLElement,
  slug: string,
  initial: GameDetails
): () => void {
  const button = root.querySelector<HTMLButtonElement>('.game-details__favorite');
  if (!button) return () => {};
  const label = button.querySelector('span');
  const count = root.querySelector<HTMLElement>('[data-game-likes]');
  const status = document.createElement('div');
  status.className = 'game-details__state';
  status.setAttribute('role', 'status');
  status.hidden = true;
  button.closest('.game-details__actions')?.after(status);
  let live = true;
  let pending = false;
  let unknown = false;
  let active = initial.isLikedByCurrentUser;
  function apply(next: boolean, likesCount?: number): void {
    active = next;
    button!.classList.toggle('game-details__favorite--active', next);
    button!.setAttribute('aria-pressed', String(next));
    if (label) label.textContent = next ? 'Remove from Favorites' : 'Add to Favorites';
    if (count && likesCount !== undefined)
      count.textContent =
        likesCount >= 1000 ? `${Math.floor(likesCount / 100) / 10}K` : String(likesCount);
  }
  const unsubscribe = appSession.subscribe((session) => {
    if (!session) {
      unknown = false;
      button.disabled = pending;
      status.hidden = true;
      apply(false);
    }
  });

  async function refresh(): Promise<void> {
    if (pending || !ensureActiveSession()) return;
    const session = appSession.check()!;
    pending = true;
    button!.disabled = true;
    status.textContent = 'Refreshing favorite status…';
    try {
      const game = await fetchGameDetails(slug, session.email);
      if (!live || appSession.check()?.authenticatedAt !== session.authenticatedAt) return;
      if (!game) throw Error('Game unavailable');
      unknown = false;
      apply(game.isLikedByCurrentUser, game.likesCount);
      status.hidden = true;
    } catch {
      if (live) showRecovery('Favorite status could not be refreshed.');
    } finally {
      pending = false;
      if (live) button!.disabled = unknown;
    }
  }

  function showRecovery(message: string): void {
    status.hidden = false;
    status.textContent = message;
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'game-details__retry';
    retry.textContent = 'Refresh status';
    retry.addEventListener('click', () => void refresh());
    status.append(retry);
  }

  const click = async (): Promise<void> => {
    if (pending || unknown || !ensureActiveSession()) return;
    const session = appSession.check()!;
    pending = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    if (label) label.textContent = 'Updating…';
    status.hidden = true;
    try {
      const result = await toggleFavorite(slug, session);
      const current = appSession.check();
      if (
        !live ||
        current?.email !== session.email ||
        current.authenticatedAt !== session.authenticatedAt
      )
        return;
      apply(result.active, result.likesCount);
      showSnackbar(result.active ? 'Added to favorites.' : 'Removed from favorites.', 'success');
    } catch (error) {
      if (!live || appSession.check()?.authenticatedAt !== session.authenticatedAt) return;
      unknown = !(error instanceof MutationFailure) || error.kind === 'unknown';
      const message = unknown
        ? 'Favorite result is unknown. Refresh status before trying again.'
        : 'Favorite update was rejected. Please try again.';
      if (unknown) showRecovery(message);
      else {
        status.hidden = false;
        status.textContent = message;
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
  };
  button.addEventListener('click', click);
  return () => {
    live = false;
    unsubscribe();
    button.removeEventListener('click', click);
    status.remove();
  };
}
