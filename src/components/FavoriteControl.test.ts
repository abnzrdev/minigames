// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSession } from '../utils/appSession';
import type { GameDetails } from '../api/games';
const mocks = vi.hoisted(() => ({
  toggle: vi.fn(),
  get: vi.fn(),
  auth: vi.fn(),
  snackbar: vi.fn(),
  session: null as AppSession | null,
  listeners: [] as Array<(session: AppSession | null) => void>,
}));
vi.mock('../api/favorites', () => ({ toggleFavorite: mocks.toggle }));
vi.mock('../api/games', () => ({ fetchGameDetails: mocks.get }));
vi.mock('../utils/session', () => ({
  appSession: {
    recoveryVersion: 0,
    check: () => mocks.session,
    subscribe: (fn: (session: AppSession | null) => void) => {
      mocks.listeners.push(fn);
      fn(mocks.session);
      return () => {};
    },
  },
}));
vi.mock('../utils/authDialog', () => ({ openAuthDialog: mocks.auth }));
vi.mock('./Snackbar', () => ({ showSnackbar: mocks.snackbar }));
import { MutationFailure } from '../api/mutations';
import { initializeFavoriteControl } from './FavoriteControl';

describe('server-driven favorite control', () => {
  let root: HTMLElement, button: HTMLButtonElement, cleanup: () => void;
  const session = { displayName: 'Alice', email: 'alice@example.com', authenticatedAt: 1 };
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listeners.length = 0;
    mocks.session = session;
    root = document.createElement('section');
    root.innerHTML =
      '<span data-game-likes>10</span><div class="game-details__actions"><button class="game-details__favorite" aria-pressed="false"><span>Add to Favorites</span></button></div>';
    document.body.replaceChildren(root);
    button = root.querySelector('button')!;
    cleanup = initializeFavoriteControl(root, 'game', {
      isLikedByCurrentUser: false,
      likesCount: 10,
    } as GameDetails);
  });
  afterEach(() => cleanup());

  it('locks duplicates and updates state/count only after the confirmed response', async () => {
    let resolve: (value: { active: boolean; likesCount: number }) => void = () => {};
    mocks.toggle.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    button.click();
    button.click();
    expect(mocks.toggle).toHaveBeenCalledOnce();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(root.querySelector('[data-game-likes]')?.textContent).toBe('10');
    resolve({ active: true, likesCount: 42 });
    await vi.waitFor(() => expect(button.disabled).toBe(false));
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-game-likes]')?.textContent).toBe('42');
  });

  it('retains confirmed state after rejection and allows explicit retry', async () => {
    mocks.toggle.mockRejectedValue(new MutationFailure('rejected', '400'));
    button.click();
    await vi.waitFor(() => expect(mocks.snackbar).toHaveBeenCalled());
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('locks an unknown outcome until an explicit read-only status refresh', async () => {
    mocks.toggle.mockRejectedValue(new MutationFailure('unknown', 'lost'));
    button.click();
    await vi.waitFor(() => expect(root.querySelector('.game-details__retry')).not.toBeNull());
    button.click();
    expect(mocks.toggle).toHaveBeenCalledOnce();
    mocks.get.mockResolvedValue({ isLikedByCurrentUser: true, likesCount: 11 });
    root.querySelector<HTMLButtonElement>('.game-details__retry')!.click();
    await vi.waitFor(() => expect(button.disabled).toBe(false));
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(mocks.toggle).toHaveBeenCalledOnce();
  });

  it('opens Auth for a guest and sends no request', () => {
    mocks.session = null;
    button.click();
    expect(mocks.toggle).not.toHaveBeenCalled();
    expect(mocks.auth).toHaveBeenCalledWith('login', true);
    expect(mocks.snackbar).toHaveBeenCalled();
  });

  it('ignores late success after the session is lost', async () => {
    let resolve: (value: { active: boolean; likesCount: number }) => void = () => {};
    mocks.toggle.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    button.click();
    mocks.session = null;
    mocks.listeners.forEach((fn) => fn(null));
    resolve({ active: true, likesCount: 11 });
    await vi.waitFor(() => expect(button.disabled).toBe(false));
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });
});
