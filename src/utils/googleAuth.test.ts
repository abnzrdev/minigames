import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  popup: vi.fn(),
  authenticate: vi.fn(),
  cleanup: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {
    providerId = 'google.com';
  },
  signInWithPopup: mocks.popup,
  signOut: mocks.signOut,
}));
vi.mock('../config/firebase', () => ({ auth: { project: 'existing-project' } }));
vi.mock('./session', () => ({
  appSession: { authenticate: mocks.authenticate, waitForCleanup: mocks.cleanup },
}));
import { authenticateGoogle, googleAuthenticationErrorMessage } from './googleAuth';
describe('Google Firebase boundary', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.cleanup.mockResolvedValue();
  });
  it('uses the existing Auth/provider and stores only profile fields, never credentials/tokens', async () => {
    mocks.popup.mockResolvedValue({
      user: {
        displayName: 'Google Player',
        email: 'google@example.com',
        photoURL: 'https://example.com/photo.png',
        accessToken: 'must-not-store',
      },
      credential: { accessToken: 'must-not-store' },
    });
    await authenticateGoogle();
    expect(mocks.popup).toHaveBeenCalledWith(
      { project: 'existing-project' },
      expect.objectContaining({ providerId: 'google.com' })
    );
    expect(mocks.authenticate).toHaveBeenCalledWith({
      displayName: 'Google Player',
      email: 'google@example.com',
      avatarUrl: 'https://example.com/photo.png',
    });
  });
  it('omits absent photo and preserves the shared name fallback path', async () => {
    mocks.popup.mockResolvedValue({
      user: { displayName: null, email: 'google@example.com', photoURL: null },
    });
    await authenticateGoogle();
    expect(mocks.authenticate).toHaveBeenCalledWith({
      displayName: '',
      email: 'google@example.com',
    });
  });
  it('signs out an unusable identity with no email without creating an app session', async () => {
    mocks.popup.mockResolvedValue({ user: { email: null } });
    await expect(authenticateGoogle()).rejects.toThrow('email');
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.authenticate).not.toHaveBeenCalled();
  });
  it('waits for earlier cleanup before opening the popup', async () => {
    let resolve: () => void = () => {};
    mocks.cleanup.mockReturnValue(
      new Promise<void>((r) => {
        resolve = r;
      })
    );
    mocks.popup.mockResolvedValue({ user: { email: 'google@example.com' } });
    const request = authenticateGoogle();
    expect(mocks.popup).not.toHaveBeenCalled();
    resolve();
    await request;
    expect(mocks.popup).toHaveBeenCalledOnce();
  });
  it('never creates a session after cancellation or failure', async () => {
    mocks.popup.mockRejectedValue({ code: 'auth/popup-closed-by-user' });
    await expect(authenticateGoogle()).rejects.toMatchObject({ code: 'auth/popup-closed-by-user' });
    expect(mocks.authenticate).not.toHaveBeenCalled();
  });
  it.each([
    ['auth/popup-closed-by-user', 'canceled'],
    ['auth/cancelled-popup-request', 'canceled'],
    ['auth/popup-blocked', 'popups'],
    ['auth/unauthorized-domain', 'unavailable'],
    ['auth/operation-not-allowed', 'unavailable'],
    ['auth/account-exists-with-different-credential', 'another'],
    ['auth/network-request-failed', 'connection'],
    ['unknown', 'failed'],
  ])('returns safe recoverable feedback for %s', (code, message) => {
    expect(googleAuthenticationErrorMessage({ code, message: 'private token detail' })).toContain(
      message
    );
    expect(
      googleAuthenticationErrorMessage({ code, message: 'private token detail' })
    ).not.toContain('private token');
  });
});
