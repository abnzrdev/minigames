// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_SESSION_KEY } from './utils/appSession';
const mocks = vi.hoisted(() => ({
  initialize: vi.fn(),
  auth: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  update: vi.fn(),
  signOut: vi.fn(),
  fetch: vi.fn<typeof fetch>(),
}));
vi.mock('firebase/app', () => ({ initializeApp: mocks.initialize }));
vi.mock('firebase/auth', () => ({
  getAuth: mocks.auth,
  signInWithEmailAndPassword: mocks.login,
  createUserWithEmailAndPassword: mocks.register,
  updateProfile: mocks.update,
  signOut: mocks.signOut,
}));
const profile = {
  displayName: 'Alice Player',
  email: 'alice@example.com',
  photoURL: 'https://example.com/photo.png',
};
const game = {
  slug: 'test-game',
  name: 'Test Game',
  category: 'puzzle',
  price: 'Free',
  shortDescription: 'A puzzle.',
  rating: 4.8,
  likesCount: 10,
  cardImage: 'cover.webp',
  featured: false,
};
const details = {
  ...game,
  heroImage: 'cover.webp',
  isLikedByCurrentUser: false,
  fullDescription: 'Public details.',
  specs: { genre: 'Puzzle', players: 'Solo', duration: '10 minutes', price: 'Free' },
  topRecords: [],
};
describe('application bootstrap and native SPA integration', () => {
  let session: typeof import('./utils/session');
  let documentEvents: Parameters<Document['addEventListener']>[],
    windowEvents: Parameters<Window['addEventListener']>[];
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-11T00:00:00Z'));
    vi.resetModules();
    vi.resetAllMocks();
    localStorage.clear();
    document.body.innerHTML = '<div id="app"></div>';
    history.replaceState(null, '', '/');
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
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    mocks.initialize.mockReturnValue({ name: 'existing-app' });
    mocks.auth.mockReturnValue({ name: 'existing-auth' });
    mocks.login.mockResolvedValue({ user: { ...profile } });
    mocks.register.mockResolvedValue({ user: { ...profile, displayName: null } });
    mocks.signOut.mockResolvedValue(undefined);
    mocks.update.mockImplementation(
      async (user: { displayName: string | null }, change: { displayName: string }) => {
        user.displayName = change.displayName;
      }
    );
    mocks.fetch.mockImplementation(async (input) => {
      const url = new URL(String(input));
      let result: unknown;
      if (url.pathname === '/api/categories')
        result = {
          data: [
            { slug: 'all', label: 'All', isDefault: true },
            { slug: 'puzzle', label: 'Puzzle', isDefault: false },
          ],
        };
      else if (url.pathname === '/api/leaderboard')
        result = {
          data: [
            {
              rank: 1,
              playerName: 'Alice_Pro',
              gamesPlayed: 10,
              totalScore: 94250,
              streakDays: 3,
              favoriteGameName: 'Test Game',
            },
          ],
        };
      else if (url.pathname === '/api/games')
        result = url.searchParams.has('featured')
          ? { data: [] }
          : { data: [game], meta: { page: Number(url.searchParams.get('page')), totalPages: 4 } };
      else if (url.pathname === '/api/games/test-game') result = { data: details };
      else if (url.pathname === '/api/games/test-game/comments')
        result = { data: [], meta: { totalComments: 0 } };
      else throw Error('Unexpected unit-test network request: ' + url.pathname);
      return new Response(JSON.stringify(result));
    });
    vi.stubGlobal('fetch', mocks.fetch);
  });
  afterEach(async () => {
    session?.appSession.dispose();
    document.body.replaceChildren();
    await Promise.resolve();
    documentEvents.forEach((args) => document.removeEventListener(...args));
    windowEvents.forEach((args) => window.removeEventListener(...args));
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  async function boot(): Promise<void> {
    await import('./main');
    session = await import('./utils/session');
  }
  function fill(name: string, value: string): void {
    const input = document.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  it('assembles Home, persistent chrome/dialogs and Firebase once; native links switch pages', async () => {
    await boot();
    await vi.waitFor(() =>
      expect(document.querySelector('.leaderboard__name')?.textContent?.trim()).toBe('Alice_Pro')
    );
    expect(mocks.initialize).toHaveBeenCalledOnce();
    expect(mocks.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'minigames-rsschool',
        authDomain: 'minigames-rsschool.firebaseapp.com',
      })
    );
    expect(mocks.auth).toHaveBeenCalledWith({ name: 'existing-app' });
    expect(document.querySelector('main')?.getAttribute('aria-label')).toBe('Home');
    expect(document.querySelector('.game-dev__email')?.getAttribute('href')).toBe(
      'mailto:developers@minigames.com'
    );
    expect(document.querySelector('.footer__copy')?.textContent).toContain('2026');
    const header = document.querySelector('header'),
      auth = document.getElementById('auth-dialog');
    document.querySelector<HTMLButtonElement>('.hero__cta')!.click();
    await vi.waitFor(() =>
      expect(document.querySelector('.game-card__title')?.textContent?.trim()).toBe('Test Game')
    );
    expect(location.pathname).toBe('/library');
    expect(document.querySelector('header')).toBe(header);
    expect(document.getElementById('auth-dialog')).toBe(auth);
    expect(document.querySelector('#library-hero-title')?.textContent).toBe('Game Library');
    expect(
      document.querySelector('[data-nav="library"]')?.classList.contains('header__link--active')
    ).toBe(true);
    document.querySelector<HTMLAnchorElement>('.footer [data-target="home"]')!.click();
    expect(document.querySelector('main')?.getAttribute('aria-label')).toBe('Home');
  });
  it('boots a Library deep link, keeps the page mounted for query changes and restores browser history', async () => {
    history.replaceState(null, '', '/library?category=puzzle&sort=name-desc&page=2');
    await boot();
    await vi.waitFor(() => expect(document.querySelector('.game-card')).not.toBeNull());
    const page = document.querySelector('.library-page');
    expect(document.querySelector<HTMLSelectElement>('select')?.value).toBe('name-desc');
    expect(document.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('2');
    const query = mocks.fetch.mock.calls
      .map((c) => new URL(String(c[0])))
      .find((u) => u.pathname === '/api/games');
    expect(Object.fromEntries(query!.searchParams)).toEqual({
      category: 'puzzle',
      sort: 'name-desc',
      page: '2',
      limit: '6',
    });
    document.querySelector<HTMLButtonElement>('[data-category="all"]')!.click();
    await vi.waitFor(() =>
      expect(document.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('1')
    );
    expect(new URL(location.href).searchParams.has('page')).toBe(false);
    expect(document.querySelector('.library-page')).toBe(page);
    history.replaceState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(document.querySelector('.home-page')).not.toBeNull();
  });
  it('renders unknown routes and returns home through the accessible action', async () => {
    history.replaceState(null, '', '/does-not-exist');
    await boot();
    expect(document.querySelector('#not-found-title')?.textContent).toContain('Page Not Found');
    expect(document.querySelector('.library-page')).toBeNull();
    document.querySelector<HTMLButtonElement>('.not-found__home')!.click();
    expect(location.pathname).toBe('/');
    expect(document.querySelector('.home-page')).not.toBeNull();
  });
  it('restores a stored session without renewal and expires header/profile on the exact five-minute boundary', async () => {
    const authenticatedAt = Date.now() - 1000;
    localStorage.setItem(
      APP_SESSION_KEY,
      JSON.stringify({
        displayName: profile.displayName,
        email: profile.email,
        authenticatedAt,
        avatarUrl: profile.photoURL,
      })
    );
    await boot();
    expect(document.querySelector('.header__profile-name')?.textContent).toBe(profile.displayName);
    window.dispatchEvent(new Event('pageshow'));
    window.dispatchEvent(new Event('focus'));
    window.dispatchEvent(new StorageEvent('storage'));
    document.dispatchEvent(new Event('visibilitychange'));
    expect(JSON.parse(localStorage.getItem(APP_SESSION_KEY)!).authenticatedAt).toBe(
      authenticatedAt
    );
    await vi.advanceTimersByTimeAsync(298999);
    expect(document.querySelector('.header__profile-name')).not.toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    expect(document.querySelector('.header__profile-name')).toBeNull();
    expect(document.querySelector<HTMLButtonElement>('#auth-login-btn')?.hidden).toBe(false);
    expect(localStorage.getItem(APP_SESSION_KEY)).toBeNull();
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(document.querySelector('.snackbar__message')?.textContent).toContain('session expired');
  });
  it('preserves Details through Auth login and updates desktop/mobile profile immediately', async () => {
    history.replaceState(null, '', '/?game=test-game&auth=login');
    await boot();
    fill('login-email', profile.email);
    fill('login-password', 'Valid1!');
    document.querySelector<HTMLFormElement>('#auth-panel-login form')!.requestSubmit();
    await vi.waitFor(() => expect(session.appSession.check()?.email).toBe(profile.email));
    await vi.advanceTimersByTimeAsync(200);
    await vi.waitFor(() =>
      expect(document.querySelector('.game-details__title')?.textContent?.trim()).toBe('Test Game')
    );
    expect(document.querySelectorAll('.header__profile-name')).toHaveLength(2);
    expect(document.querySelector<HTMLImageElement>('.header__avatar-photo')?.src).toBe(
      profile.photoURL
    );
    expect(new URL(location.href).searchParams.get('game')).toBe('test-game');
    expect(new URL(location.href).searchParams.has('auth')).toBe(false);
    expect(document.querySelector<HTMLDialogElement>('#game-details')?.open).toBe(true);
  });
  it('registers, restores Guest on logout and opens Auth from mobile controls', async () => {
    history.replaceState(null, '', '/?auth=register');
    await boot();
    fill('register-username', 'NewPlayer');
    fill('register-email', profile.email);
    fill('register-password', 'Valid1!');
    fill('register-password-confirm', 'Valid1!');
    document.querySelector<HTMLFormElement>('#auth-panel-register form')!.requestSubmit();
    await vi.waitFor(() => expect(session.appSession.check()?.displayName).toBe('NewPlayer'));
    await vi.advanceTimersByTimeAsync(200);
    document.querySelector<HTMLButtonElement>('.header__profile--bar .header__logout')!.click();
    await vi.waitFor(() => expect(session.appSession.check()).toBeNull());
    expect(mocks.signOut).toHaveBeenCalledOnce();
    document.querySelector<HTMLButtonElement>('#burger-btn')!.click();
    expect(document.getElementById('site-nav')?.classList.contains('header__nav--open')).toBe(true);
    document.querySelector<HTMLButtonElement>('#auth-menu-login-btn')!.click();
    expect(document.querySelector<HTMLDialogElement>('#auth-dialog')?.open).toBe(true);
    expect(document.getElementById('site-nav')?.classList.contains('header__nav--open')).toBe(
      false
    );
  });
  it('does not issue API requests or assemble UI without the application root', async () => {
    document.body.replaceChildren();
    await boot();
    expect(document.querySelector('header')).toBeNull();
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(document.querySelector('dialog')).toBeNull();
  });
});
