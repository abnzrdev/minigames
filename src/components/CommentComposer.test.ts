// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSession } from '../utils/appSession';
const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  auth: vi.fn(),
  snackbar: vi.fn(),
  session: null as AppSession | null,
  listeners: [] as Array<(session: AppSession | null) => void>,
}));
vi.mock('../api/comments', () => ({ submitComment: mocks.post }));
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
import { initializeCommentComposer } from './CommentComposer';

describe('comment composer', () => {
  let root: HTMLElement,
    form: HTMLFormElement,
    input: HTMLTextAreaElement,
    button: HTMLButtonElement,
    cleanup: () => void;
  const refresh = vi.fn<() => Promise<void>>();
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listeners.length = 0;
    mocks.session = { displayName: 'Alice', email: 'alice@example.com', authenticatedAt: 1 };
    refresh.mockResolvedValue();
    root = document.createElement('section');
    root.innerHTML = '<section class="game-details__comments"></section>';
    document.body.replaceChildren(root);
    cleanup = initializeCommentComposer(root, 'game', refresh);
    form = root.querySelector('form')!;
    input = root.querySelector('textarea')!;
    button = root.querySelector('button')!;
  });
  afterEach(() => cleanup());
  function type(value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }
  function send(): void {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
  it('starts empty with an initial and validates trimmed 1–500 characters', () => {
    expect(input.value).toBe('');
    expect(button.disabled).toBe(true);
    expect(root.querySelector('.game-details__avatar')?.textContent).toBe('A');
    type('   ');
    expect(button.disabled).toBe(true);
    type(' ' + 'x'.repeat(500) + ' ');
    expect(button.disabled).toBe(false);
    type('x'.repeat(501));
    expect(button.disabled).toBe(true);
    send();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it('locks input and duplicate submission, then clears and refreshes once after creation', async () => {
    let resolve: () => void = () => {};
    mocks.post.mockReturnValue(
      new Promise<void>((r) => {
        resolve = r;
      })
    );
    type('Hello');
    send();
    send();
    expect(mocks.post).toHaveBeenCalledOnce();
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    expect(input.value).toBe('Hello');
    expect(refresh).not.toHaveBeenCalled();
    resolve();
    await vi.waitFor(() => expect(input.disabled).toBe(false));
    expect(input.value).toBe('');
    expect(refresh).toHaveBeenCalledOnce();
    expect(button.disabled).toBe(true);
  });
  it.each(['rejected', 'unknown'] as const)(
    'retains a draft after %s without replaying',
    async (kind) => {
      mocks.post.mockRejectedValue(new MutationFailure(kind, 'failed'));
      type('Draft');
      send();
      await vi.waitFor(() => expect(input.disabled).toBe(false));
      expect(input.value).toBe('Draft');
      expect(button.disabled).toBe(false);
      expect(mocks.post).toHaveBeenCalledOnce();
      expect(refresh).not.toHaveBeenCalled();
    }
  );
  it('does not submit Shift+Enter or IME Enter, but submits ordinary Enter', () => {
    mocks.post.mockReturnValue(new Promise(() => {}));
    type('Hello');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true }));
    expect(mocks.post).not.toHaveBeenCalled();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(mocks.post).toHaveBeenCalledOnce();
  });
  it('hides Guest controls and prevents a synthetic unauthorized submission', () => {
    mocks.session = null;
    mocks.listeners.forEach((fn) => fn(null));
    type('Draft');
    send();
    expect(form.hidden).toBe(true);
    expect(input.disabled).toBe(true);
    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.auth).toHaveBeenCalled();
  });
  it('does not restore authenticated controls or success feedback after expiration during a request', async () => {
    let resolve: () => void = () => {};
    mocks.post.mockReturnValue(
      new Promise<void>((r) => {
        resolve = r;
      })
    );
    type('Draft');
    send();
    mocks.session = null;
    mocks.listeners.forEach((fn) => fn(null));
    resolve();
    await vi.waitFor(() => expect(form.hasAttribute('aria-busy')).toBe(false));
    expect(form.hidden).toBe(true);
    expect(input.disabled).toBe(true);
    expect(refresh).not.toHaveBeenCalled();
    expect(mocks.snackbar).not.toHaveBeenCalled();
  });
  it('disposes a pending composer without refreshing another view', async () => {
    let resolve: () => void = () => {};
    mocks.post.mockReturnValue(
      new Promise<void>((r) => {
        resolve = r;
      })
    );
    type('Draft');
    send();
    cleanup();
    resolve();
    await Promise.resolve();
    expect(root.querySelector('form')).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
  });
});
