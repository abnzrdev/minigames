// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_SESSION_KEY, APP_SESSION_LIFETIME_MS } from './appSession';
const mocks = vi.hoisted(() => ({
  signOut: vi.fn().mockResolvedValue(undefined),
  snackbar: vi.fn(),
}));
vi.mock('firebase/auth', () => ({ signOut: mocks.signOut }));
vi.mock('../config/firebase', () => ({ auth: {} }));
vi.mock('../components/Snackbar', () => ({ showSnackbar: mocks.snackbar }));

describe('authenticated Auth route guard', () => {
  let session: typeof import('./session');
  let navigation: typeof import('./navigation');
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    history.replaceState(
      null,
      '',
      '/library?category=puzzle&sort=name-desc&page=2&game=cozy-sudoku&extra=keep#records'
    );
    session = await import('./session');
    navigation = await import('./navigation');
  });
  afterEach(() => {
    session.appSession.dispose();
    vi.restoreAllMocks();
  });

  it.each(['login', 'register'])(
    'removes only auth=%s with no new history entry and one notification',
    (mode) => {
      session.appSession.authenticate({ displayName: 'Alice', email: 'alice@example.com' });
      history.replaceState(
        { marker: 'keep' },
        '',
        location.href.replace('#records', `&auth=${mode}#records`)
      );
      const length = history.length;
      const push = vi.spyOn(history, 'pushState');
      expect(navigation.guardAuthenticatedAuth()).toBe(true);
      expect(location.pathname + location.search + location.hash).toBe(
        '/library?category=puzzle&sort=name-desc&page=2&game=cozy-sudoku&extra=keep#records'
      );
      expect(history.length).toBe(length);
      expect(history.state).toEqual({ marker: 'keep' });
      expect(push).not.toHaveBeenCalled();
      expect(navigation.guardAuthenticatedAuth()).toBe(false);
      expect(mocks.snackbar).toHaveBeenCalledOnce();
    }
  );

  it('blocks a UI entry without clearing Game Details or modifying other URL data', async () => {
    session.appSession.authenticate({ displayName: 'Alice', email: 'alice@example.com' });
    const before = location.href;
    const { openAuthDialog } = await import('./authDialog');
    openAuthDialog('register');
    expect(location.href).toBe(before);
    expect(mocks.snackbar).toHaveBeenCalledWith('You are already authenticated.', 'success');
  });

  it.each(['expired', 'invalid'])(
    'recovers %s sessions and allows Auth for a guest',
    async (kind) => {
      localStorage.setItem(
        APP_SESSION_KEY,
        kind === 'invalid'
          ? '{}'
          : JSON.stringify({
              displayName: 'Alice',
              email: 'alice@example.com',
              authenticatedAt: Date.now() - APP_SESSION_LIFETIME_MS,
            })
      );
      navigation.updateRoute({ auth: 'login' });
      expect(navigation.currentRoute().auth).toBe('login');
      expect(location.hash).toBe('#records');
      expect(session.appSession.check()).toBeNull();
      await session.appSession.waitForCleanup();
      expect(mocks.signOut).toHaveBeenCalledOnce();
      expect(mocks.snackbar).not.toHaveBeenCalledWith('You are already authenticated.', 'success');
    }
  );

  it('guards initial and history URLs without normalizing unrelated parameters away', () => {
    session.appSession.authenticate({ displayName: 'Alice', email: 'alice@example.com' });
    history.replaceState(null, '', '/library?auth=login&extra=value&page=invalid#section');
    navigation.initNavigation();
    expect(location.search + location.hash).toBe('?extra=value&page=invalid#section');
    history.pushState(null, '', '/?auth=register&extra=other#game');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(location.search + location.hash).toBe('?extra=other#game');
    expect(mocks.snackbar).toHaveBeenCalledTimes(2);
  });
});
