// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_SESSION_KEY, APP_SESSION_LIFETIME_MS } from './appSession';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn().mockResolvedValue(undefined),
  snackbar: vi.fn(),
  openAuth: vi.fn(),
}));
vi.mock('firebase/auth', () => ({ signOut: mocks.signOut }));
vi.mock('../config/firebase', () => ({
  auth: { currentUser: { email: 'firebase-only@example.com' } },
}));
vi.mock('../components/Snackbar', () => ({ showSnackbar: mocks.snackbar }));
vi.mock('./authDialog', () => ({
  openAuthDialog: mocks.openAuth,
  closeMobileMenu: vi.fn(),
  isAuthPending: () => false,
}));

describe('session browser integration', () => {
  let session: typeof import('./session');
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(1_800_000_000_000);
    session = await import('./session');
  });
  afterEach(() => {
    session.appSession.dispose();
    vi.useRealTimers();
  });

  it('restores only the custom record and wires Firebase signOut on invalid storage', async () => {
    expect(session.appSession.check()).toBeNull();
    localStorage.setItem('unrelated', 'keep');
    localStorage.setItem(APP_SESSION_KEY, '{}');
    expect(session.appSession.check()).toBeNull();
    await session.appSession.waitForCleanup();
    const { auth } = await import('../config/firebase');
    expect(mocks.signOut).toHaveBeenCalledWith(auth);
    expect(localStorage.getItem('unrelated')).toBe('keep');
  });

  it('blocks an expired action and opens Auth without replaying it', async () => {
    session.appSession.authenticate({ displayName: 'Alice', email: 'alice@example.com' });
    vi.setSystemTime(Date.now() + APP_SESSION_LIFETIME_MS);
    const { ensureActiveSession } = await import('./protectedAction');
    const request = vi.fn();
    if (ensureActiveSession()) request();
    expect(request).not.toHaveBeenCalled();
    expect(mocks.openAuth).toHaveBeenCalledWith('login', true);
    await session.appSession.waitForCleanup();
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.snackbar).toHaveBeenCalledOnce();
  });

  it('allows a valid protected action without opening Auth', async () => {
    session.appSession.authenticate({ displayName: 'Alice', email: 'alice@example.com' });
    const { ensureActiveSession } = await import('./protectedAction');
    expect(ensureActiveSession()).toBe(true);
    expect(mocks.openAuth).not.toHaveBeenCalled();
  });

  it('continues public navigation in Guest Mode after expiration', async () => {
    history.replaceState(null, '', '/?game=cozy-sudoku');
    session.appSession.authenticate({ displayName: 'Alice', email: 'alice@example.com' });
    vi.setSystemTime(Date.now() + APP_SESSION_LIFETIME_MS);
    const { navigateTo, currentRoute } = await import('./navigation');
    navigateTo('library');
    expect(currentRoute()).toMatchObject({ page: 'library', auth: null, game: null });
    expect(session.appSession.check()).toBeNull();
    await session.appSession.waitForCleanup();
  });
});
