// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameDetails } from '../api/games';
import type { AppSession } from '../utils/appSession';
const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  snackbar: vi.fn(),
  commentCleanup: vi.fn(),
  commentRefresh: vi.fn(),
  favoriteCleanup: vi.fn(),
  composerCleanup: vi.fn(),
  session: null as AppSession | null,
  listeners: [] as Array<(session: AppSession | null) => void>,
}));
vi.mock('../api/games', async (original) => ({
  ...(await original<typeof import('../api/games')>()),
  fetchGameDetails: mocks.get,
}));
vi.mock('../utils/session', () => ({
  appSession: {
    check: () => mocks.session,
    subscribe: (fn: (session: AppSession | null) => void) => {
      mocks.listeners.push(fn);
      fn(mocks.session);
      return () => {};
    },
  },
}));
vi.mock('./Snackbar', () => ({ showSnackbar: mocks.snackbar }));
vi.mock('./GameComments', () => ({
  loadGameComments: (section: HTMLElement) => {
    section.textContent = 'Mounted comments';
    return Object.assign(mocks.commentCleanup, { refresh: mocks.commentRefresh });
  },
}));
vi.mock('./FavoriteControl', () => ({ initializeFavoriteControl: () => mocks.favoriteCleanup }));
vi.mock('./CommentComposer', () => ({ initializeCommentComposer: () => mocks.composerCleanup }));
const game: GameDetails = {
  slug: 'game',
  name: 'Example Game',
  heroImage: 'cover.webp',
  rating: 4.8,
  likesCount: 2500,
  isLikedByCurrentUser: false,
  fullDescription: 'A public description.',
  specs: { genre: 'Puzzle', players: 'Solo', duration: '10 minutes', price: 'Free' },
  topRecords: [1, 2, 3, 4].map((position) => ({
    position,
    playerName: 'Player ' + position,
    score: 10000 - position,
    achievedAt: position === 4 ? 'invalid' : '2026-08-01',
  })),
};
describe('Game Details modal, data and restoration lifecycle', () => {
  let navigation: typeof import('../utils/navigation'),
    details: typeof import('./GameDetails'),
    dialog: HTMLDialogElement;
  let documentEvents: Parameters<Document['addEventListener']>[],
    windowEvents: Parameters<Window['addEventListener']>[];
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.clearAllMocks();
    mocks.session = null;
    mocks.listeners.length = 0;
    document.body.replaceChildren();
    history.replaceState(null, '', '/');
    // Remove each test's actual delegated handlers afterward so old module instances cannot react to new DOM.
    documentEvents = [];
    windowEvents = [];
    const addDocument = document.addEventListener.bind(document),
      addWindow = window.addEventListener.bind(window);
    vi.spyOn(document, 'addEventListener').mockImplementation((...args) => {
      documentEvents.push(args);
      addDocument(...args);
    });
    vi.spyOn(window, 'addEventListener').mockImplementation((...args) => {
      windowEvents.push(args);
      addWindow(...args);
    });
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
    mocks.get.mockResolvedValue(game);
    navigation = await import('../utils/navigation');
    navigation.initNavigation();
    details = await import('./GameDetails');
    dialog = details.renderGameDetails();
    document.body.append(dialog);
    details.initGameDetails();
  });
  afterEach(() => {
    documentEvents.forEach((args) => document.removeEventListener(...args));
    windowEvents.forEach((args) => window.removeEventListener(...args));
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });
  async function open(): Promise<void> {
    details.openGameDetailsDialog('game');
    await vi.waitFor(() =>
      expect(dialog.querySelector('.game-details__title')?.textContent?.trim()).toBe(game.name)
    );
  }
  it('renders public data, formatted counts/records and comments from the requested slug', async () => {
    await open();
    expect(dialog.open).toBe(true);
    expect(document.body.classList.contains('game-details-open')).toBe(true);
    expect(mocks.get).toHaveBeenCalledWith('game', undefined, expect.any(AbortSignal));
    expect(dialog.querySelector('[data-game-likes]')?.textContent).toBe('2.5K');
    expect(dialog.textContent).toContain('4.8');
    expect(dialog.textContent).toContain('Puzzle');
    expect(dialog.querySelectorAll('.game-details__record-list li')).toHaveLength(4);
    expect(dialog.textContent).toContain('#4');
    expect(dialog.textContent).not.toContain('Invalid Date');
    expect(dialog.textContent).toContain('Mounted comments');
  });
  it('escapes game and record text and handles lower counts/empty records', async () => {
    mocks.session = { displayName: 'Alice', email: 'alice@example.com', authenticatedAt: 1 };
    mocks.get.mockResolvedValue({
      ...game,
      name: '<img src=x onerror=bad()>',
      likesCount: 5,
      fullDescription: '<script>bad()</script>',
      topRecords: [],
      isLikedByCurrentUser: true,
    });
    details.openGameDetailsDialog('game');
    await vi.waitFor(() =>
      expect(dialog.querySelector('.game-details__title')?.textContent?.trim()).toBe(
        '<img src=x onerror=bad()>'
      )
    );
    expect(dialog.querySelector('.game-details__title img')).toBeNull();
    expect(dialog.querySelector('script')).toBeNull();
    expect(dialog.textContent).toContain('No records yet.');
    expect(dialog.querySelector('[data-game-likes]')?.textContent).toBe('5');
    expect(dialog.querySelector('.game-details__favorite')?.getAttribute('aria-pressed')).toBe(
      'true'
    );
  });
  it('shows missing-data state instead of broken game controls', async () => {
    mocks.get.mockResolvedValue(null);
    details.openGameDetailsDialog('missing');
    await vi.waitFor(() => expect(dialog.textContent).toContain('Game Not Found'));
    expect(dialog.querySelector('.game-details__favorite')).toBeNull();
  });
  it('shows loading, failure and successful read-only retry feedback', async () => {
    mocks.get.mockRejectedValueOnce(Error('offline'));
    details.openGameDetailsDialog('game');
    expect(dialog.querySelector('[aria-label="Loading game details"]')).not.toBeNull();
    await vi.waitFor(() => expect(dialog.querySelector('.game-details__retry')).not.toBeNull());
    expect(mocks.snackbar).toHaveBeenCalledWith('Could not load game details.', 'error');
    dialog.querySelector<HTMLButtonElement>('.game-details__retry')!.click();
    await vi.waitFor(() => expect(dialog.querySelector('.game-details__title')).not.toBeNull());
    expect(mocks.get).toHaveBeenCalledTimes(2);
    expect(mocks.snackbar).toHaveBeenCalledWith('Game details loaded successfully.', 'success');
  });
  it.each(['button', 'backdrop', 'Escape', 'cancel'])(
    'closes through %s and disposes mounted controls',
    async (action) => {
      await open();
      if (action === 'button')
        dialog.querySelector<HTMLButtonElement>('.game-details__close')!.click();
      else if (action === 'backdrop')
        dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      else if (action === 'Escape')
        dialog.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
        );
      else dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
      expect(navigation.currentRoute().game).toBeNull();
      await vi.advanceTimersByTimeAsync(200);
      expect(dialog.open).toBe(false);
      expect(document.body.classList.contains('game-details-open')).toBe(false);
      expect(mocks.favoriteCleanup).toHaveBeenCalled();
      expect(mocks.commentCleanup).toHaveBeenCalled();
      expect(mocks.composerCleanup).toHaveBeenCalled();
    }
  );
  it('preserves mounted Details/comments and scroll through temporary Auth suspension', async () => {
    await open();
    const card = dialog.querySelector('.game-details__card');
    dialog.scrollTop = 120;
    navigation.updateRoute({ auth: 'login' });
    expect(dialog.open).toBe(false);
    expect(mocks.commentCleanup).not.toHaveBeenCalled();
    expect(mocks.favoriteCleanup).not.toHaveBeenCalled();
    navigation.updateRoute({ auth: null });
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('.game-details__card')).toBe(card);
    expect(dialog.scrollTop).toBe(120);
    expect(mocks.get).toHaveBeenCalledOnce();
  });
  it('refreshes personalized Details after authentication and restores the retained game', async () => {
    await open();
    navigation.updateRoute({ auth: 'login' });
    mocks.session = { displayName: 'Alice', email: 'alice@example.com', authenticatedAt: 1 };
    mocks.listeners.forEach((fn) => fn(mocks.session));
    navigation.updateRoute({ auth: null });
    await vi.waitFor(() =>
      expect(mocks.get).toHaveBeenLastCalledWith(
        'game',
        'alice@example.com',
        expect.any(AbortSignal)
      )
    );
    expect(dialog.open).toBe(true);
    await vi.waitFor(() => expect(dialog.querySelector('.game-details__title')).not.toBeNull());
  });
  it('resets personalized flags in place when a session ends', async () => {
    mocks.session = { displayName: 'Alice', email: 'alice@example.com', authenticatedAt: 1 };
    mocks.get.mockResolvedValue({ ...game, isLikedByCurrentUser: true });
    await open();
    const like = document.createElement('button');
    like.className = 'game-details__like game-details__like--active';
    dialog.querySelector('.game-details__comments')!.append(like);
    mocks.session = null;
    mocks.listeners.forEach((fn) => fn(null));
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('.game-details__favorite')?.getAttribute('aria-pressed')).toBe(
      'false'
    );
    expect(dialog.textContent).toContain('Add to Favorites');
    expect(like.classList.contains('game-details__like--active')).toBe(false);
  });
  it('ignores stale requests on a new slug and aborts previous fetch signals', async () => {
    let finish: (value: GameDetails) => void = () => {};
    mocks.get.mockImplementationOnce(
      () =>
        new Promise<GameDetails>((r) => {
          finish = r;
        })
    );
    details.openGameDetailsDialog('first');
    const signal = mocks.get.mock.calls[0][2] as AbortSignal;
    details.openGameDetailsDialog('second');
    await vi.waitFor(() => expect(dialog.querySelector('.game-details__title')).not.toBeNull());
    finish({ ...game, name: 'Stale' });
    await Promise.resolve();
    expect(dialog.textContent).not.toContain('Stale');
    expect(signal.aborted).toBe(true);
  });
  it('does not apply a personalized response after identity changes while loading', async () => {
    mocks.session = { displayName: 'Alice', email: 'alice@example.com', authenticatedAt: 1 };
    let finish: (value: GameDetails) => void = () => {};
    mocks.get.mockImplementationOnce(
      () =>
        new Promise<GameDetails>((r) => {
          finish = r;
        })
    );
    details.openGameDetailsDialog('game');
    mocks.session = null;
    finish({ ...game, isLikedByCurrentUser: true });
    await vi.waitFor(() =>
      expect(mocks.get).toHaveBeenLastCalledWith('game', undefined, expect.any(AbortSignal))
    );
    await vi.waitFor(() => expect(dialog.querySelector('.game-details__title')).not.toBeNull());
    expect(dialog.querySelector('.game-details__favorite')?.getAttribute('aria-pressed')).toBe(
      'false'
    );
  });
  it('opens delegated card Details and ignores empty slugs', async () => {
    const button = document.createElement('button');
    button.className = 'game-card__details';
    button.dataset.slug = 'game';
    document.body.append(button);
    button.click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    expect(navigation.currentRoute().game).toBe('game');
    button.dataset.slug = '';
    button.click();
    expect(navigation.currentRoute().game).toBe('game');
  });
});
