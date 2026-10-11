// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_SESSION_KEY } from './appSession';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  popup: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  signOut: vi.fn(),
  snackbar: vi.fn(),
}));
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {
    providerId = 'google.com';
  },
  signInWithPopup: mocks.popup,
  signInWithEmailAndPassword: mocks.signIn,
  createUserWithEmailAndPassword: mocks.create,
  updateProfile: mocks.update,
  signOut: mocks.signOut,
}));
vi.mock('../config/firebase', () => ({ auth: {} }));
vi.mock('../components/Snackbar', () => ({ showSnackbar: mocks.snackbar }));

describe('validated authentication UI', () => {
  let dialog: HTMLDialogElement;
  let session: typeof import('./session');
  let navigation: typeof import('./navigation');
  const user = { displayName: 'Alice', email: 'alice@example.com', photoURL: null };

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.resetAllMocks();
    localStorage.clear();
    document.body.replaceChildren();
    history.replaceState(null, '', '/?auth=login');
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
    mocks.signIn.mockResolvedValue({ user: { ...user } });
    mocks.create.mockResolvedValue({ user: { ...user, displayName: null } });
    mocks.update.mockImplementation(async (target, profile) => {
      target.displayName = profile.displayName;
    });
    mocks.signOut.mockResolvedValue(undefined);
    session = await import('./session');
    navigation = await import('./navigation');
    const { renderAuthDialog } = await import('../components/AuthDialog');
    dialog = renderAuthDialog();
    document.body.append(dialog);
    (await import('./authDialog')).initAuthDialog();
  });
  afterEach(() => {
    session.appSession.dispose();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function fill(name: string, value: string): void {
    const input = dialog.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function loginForm(): HTMLFormElement {
    return dialog.querySelector('#auth-panel-login form')!;
  }
  function submit(form = loginForm()): void {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
  function validLogin(): void {
    fill('login-email', user.email);
    fill('login-password', 'Abcd1!');
  }

  it('does not dispatch Firebase for invalid fields', () => {
    fill('login-email', 'invalid');
    submit();
    expect(mocks.signIn).not.toHaveBeenCalled();
    expect(dialog.querySelector('#login-email-error')?.textContent).toContain('valid email');
  });

  it('creates the session and closes Auth after a successful login', async () => {
    validLogin();
    submit();
    await vi.waitFor(() => expect(session.appSession.check()?.email).toBe(user.email));
    expect(navigation.currentRoute().auth).toBeNull();
    expect(dialog.dataset.pending).toBeUndefined();
    expect(mocks.snackbar).toHaveBeenCalledWith('Logged in successfully.', 'success');
  });

  it('locks every control, duplicate dispatch, close, backdrop, Escape and navigation while pending', async () => {
    let finish: (value: { user: typeof user }) => void = () => {};
    mocks.signIn.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    validLogin();
    submit();
    await vi.waitFor(() => expect(mocks.signIn).toHaveBeenCalledOnce());
    expect(
      Array.from(
        dialog.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input,button')
      ).every((control) => control.disabled)
    ).toBe(true);
    expect(dialog.getAttribute('aria-busy')).toBe('true');
    submit();
    dialog
      .querySelector('#auth-dialog-close')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const escape = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(escape);
    navigation.navigateTo('library');
    expect(escape.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(true);
    expect(navigation.currentRoute()).toMatchObject({ page: 'home', auth: 'login' });
    expect(mocks.signIn).toHaveBeenCalledOnce();
    finish({ user });
    await vi.waitFor(() => expect(dialog.dataset.pending).toBeUndefined());
  });

  it('shows an error, unlocks controls and allows a successful retry', async () => {
    mocks.signIn
      .mockRejectedValueOnce({ code: 'auth/invalid-credential' })
      .mockResolvedValueOnce({ user });
    validLogin();
    submit();
    await vi.waitFor(() =>
      expect(dialog.querySelector('.auth-dialog__request-status')?.textContent).toContain(
        'incorrect'
      )
    );
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector<HTMLInputElement>('[name="login-email"]')?.disabled).toBe(false);
    expect(loginForm().querySelector<HTMLButtonElement>('[type="submit"]')?.disabled).toBe(false);
    expect(localStorage.getItem(APP_SESSION_KEY)).toBeNull();
    submit();
    await vi.waitFor(() => expect(session.appSession.check()).not.toBeNull());
    expect(mocks.signIn).toHaveBeenCalledTimes(2);
  });

  it('registers the username and restores the retained game route on success', async () => {
    navigation.updateRoute({ game: 'cozy-sudoku', auth: 'register' });
    fill('register-username', 'NewPlayer');
    fill('register-email', user.email);
    fill('register-password', 'Abcd1!');
    fill('register-password-confirm', 'Abcd1!');
    submit(dialog.querySelector('#auth-panel-register form')!);
    await vi.waitFor(() => expect(session.appSession.check()?.displayName).toBe('NewPlayer'));
    expect(navigation.currentRoute()).toMatchObject({ game: 'cozy-sudoku', auth: null });
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.update).toHaveBeenCalledOnce();
  });
  it.each(['login', 'register'])(
    'Google success from %s creates the shared profile session and restores Details',
    async (mode) => {
      navigation.updateRoute({ game: 'cozy-sudoku', auth: mode as 'login' | 'register' });
      const googleUser = {
        displayName: 'Google Player',
        email: 'google@example.com',
        photoURL: 'https://example.com/photo.png',
      };
      mocks.popup.mockResolvedValue({ user: googleUser });
      const { renderHeader } = await import('../components/Header');
      document.body.prepend(renderHeader());
      dialog.querySelector<HTMLButtonElement>(`#auth-panel-${mode} .auth-dialog__google`)!.click();
      await vi.waitFor(() => expect(session.appSession.check()?.email).toBe(googleUser.email));
      expect(navigation.currentRoute()).toMatchObject({ game: 'cozy-sudoku', auth: null });
      expect(session.appSession.check()).toMatchObject({
        displayName: googleUser.displayName,
        avatarUrl: googleUser.photoURL,
      });
      expect(document.querySelector('.header__profile-name')?.textContent).toBe(
        googleUser.displayName
      );
      expect(document.querySelector<HTMLImageElement>('.header__avatar-photo')?.src).toBe(
        googleUser.photoURL
      );
      expect(mocks.signIn).not.toHaveBeenCalled();
      expect(mocks.create).not.toHaveBeenCalled();
      expect(mocks.snackbar).toHaveBeenCalledWith('Signed in with Google.', 'success');
    }
  );
  it('locks all auth controls and URL/history/dismissal while Google is pending', async () => {
    let finish: (result: { user: typeof user }) => void = () => {};
    mocks.popup.mockReturnValue(
      new Promise((r) => {
        finish = r;
      })
    );
    navigation.initNavigation();
    const button = dialog.querySelector<HTMLButtonElement>('.auth-dialog__google')!;
    button.click();
    await vi.waitFor(() => expect(mocks.popup).toHaveBeenCalledOnce());
    expect(
      Array.from(
        dialog.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input,button')
      ).every((c) => c.disabled)
    ).toBe(true);
    button.dispatchEvent(new MouseEvent('click'));
    submit();
    dialog
      .querySelector('#auth-dialog-close')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    dialog.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    );
    navigation.navigateTo('library');
    history.replaceState(null, '', '/library');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(true);
    expect(navigation.currentRoute()).toMatchObject({ page: 'home', auth: 'login' });
    expect(mocks.popup).toHaveBeenCalledOnce();
    expect(mocks.signIn).not.toHaveBeenCalled();
    finish({ user });
    await vi.waitFor(() => expect(dialog.dataset.pending).toBeUndefined());
  });
  it.each([
    'auth/popup-closed-by-user',
    'auth/popup-blocked',
    'auth/network-request-failed',
    'auth/unauthorized-domain',
  ])('Google %s retains fields, unlocks and allows retry', async (code) => {
    fill('login-email', 'draft@example.com');
    mocks.popup.mockRejectedValueOnce({ code }).mockResolvedValueOnce({ user });
    const button = dialog.querySelector<HTMLButtonElement>('.auth-dialog__google')!;
    button.click();
    await vi.waitFor(() =>
      expect(dialog.querySelector('.auth-dialog__request-status--error')).not.toBeNull()
    );
    expect(dialog.open).toBe(true);
    expect(button.disabled).toBe(false);
    expect(dialog.querySelector<HTMLInputElement>('[name="login-email"]')?.value).toBe(
      'draft@example.com'
    );
    expect(dialog.querySelector<HTMLInputElement>('[name="login-email"]')?.disabled).toBe(false);
    expect(localStorage.getItem(APP_SESSION_KEY)).toBeNull();
    button.click();
    await vi.waitFor(() => expect(session.appSession.check()).not.toBeNull());
    expect(mocks.popup).toHaveBeenCalledTimes(2);
  });
  it('Google sessions expire at the same fixed boundary and sign out through logout', async () => {
    mocks.popup.mockResolvedValue({ user });
    dialog.querySelector<HTMLButtonElement>('.auth-dialog__google')!.click();
    await vi.waitFor(() => expect(session.appSession.check()).not.toBeNull());
    const authenticatedAt = session.appSession.check()!.authenticatedAt;
    vi.setSystemTime(authenticatedAt + 300000);
    expect(session.appSession.check()).toBeNull();
    await session.appSession.waitForCleanup();
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(localStorage.getItem(APP_SESSION_KEY)).toBeNull();
    vi.restoreAllMocks();
    await (await import('./googleAuth')).authenticateGoogle();
    await session.logout();
    expect(session.appSession.check()).toBeNull();
    expect(mocks.signOut).toHaveBeenCalledTimes(2);
  });
});
