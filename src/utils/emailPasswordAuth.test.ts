import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  signOut: vi.fn(),
  authenticate: vi.fn(),
  cleanup: vi.fn(),
}));
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: mocks.signIn,
  createUserWithEmailAndPassword: mocks.create,
  updateProfile: mocks.update,
  signOut: mocks.signOut,
}));
vi.mock('../config/firebase', () => ({ auth: { project: 'test' } }));
vi.mock('./session', () => ({
  appSession: { authenticate: mocks.authenticate, waitForCleanup: mocks.cleanup },
}));
import { authenticateEmailPassword, authenticationErrorMessage } from './emailPasswordAuth';

describe('Firebase email/password boundary', () => {
  const user = {
    displayName: 'Alice',
    email: 'alice@example.com',
    photoURL: 'https://example.com/a.png',
  };
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.cleanup.mockResolvedValue(undefined);
    mocks.signIn.mockResolvedValue({ user: { ...user } });
    mocks.create.mockResolvedValue({ user: { ...user, displayName: null } });
    mocks.update.mockImplementation(async (target, profile) => {
      target.displayName = profile.displayName;
    });
    mocks.signOut.mockResolvedValue(undefined);
  });

  it('signs in using trimmed email and the unchanged password, then creates a whitelisted session', async () => {
    await authenticateEmailPassword('login', {
      email: ' alice@example.com ',
      password: ' Abcd1! ',
    });
    expect(mocks.signIn).toHaveBeenCalledWith({ project: 'test' }, 'alice@example.com', ' Abcd1! ');
    expect(mocks.authenticate).toHaveBeenCalledWith({
      displayName: 'Alice',
      email: user.email,
      avatarUrl: user.photoURL,
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('updates registration displayName before creating the app session', async () => {
    await authenticateEmailPassword('register', {
      email: user.email,
      password: 'Abcd1!',
      username: 'NewPlayer',
    });
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'NewPlayer' }),
      { displayName: 'NewPlayer' }
    );
    expect(mocks.authenticate).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'NewPlayer' })
    );
  });

  it('does not authenticate when Firebase rejects the credentials', async () => {
    mocks.signIn.mockRejectedValue({ code: 'auth/invalid-credential' });
    await expect(
      authenticateEmailPassword('login', { email: user.email, password: 'invalid' })
    ).rejects.toMatchObject({ code: 'auth/invalid-credential' });
    expect(mocks.authenticate).not.toHaveBeenCalled();
  });

  it('signs out a partially created identity if the profile update fails', async () => {
    mocks.update.mockRejectedValue(Error('offline'));
    await expect(
      authenticateEmailPassword('register', {
        email: user.email,
        password: 'Abcd1!',
        username: 'Alice',
      })
    ).rejects.toThrow('offline');
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.authenticate).not.toHaveBeenCalled();
  });

  it('waits for previous session sign-out before dispatching a new operation', async () => {
    let finish: () => void = () => {};
    mocks.cleanup.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      })
    );
    const request = authenticateEmailPassword('login', { email: user.email, password: 'Abcd1!' });
    expect(mocks.signIn).not.toHaveBeenCalled();
    finish();
    await request;
    expect(mocks.signIn).toHaveBeenCalledOnce();
  });

  it.each([
    ['auth/invalid-credential', 'Email or password'],
    ['auth/email-already-in-use', 'already registered'],
    ['auth/network-request-failed', 'connection'],
    ['auth/too-many-requests', 'Too many'],
    ['auth/user-disabled', 'disabled'],
    ['unknown', 'Authentication failed'],
  ])('provides safe recoverable feedback for %s', (code, message) => {
    expect(authenticationErrorMessage({ code, message: 'private details' })).toContain(message);
    expect(authenticationErrorMessage({ code, message: 'private details' })).not.toContain(
      'private details'
    );
  });
});
