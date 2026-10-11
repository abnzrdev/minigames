// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSession } from '../utils/appSession';
const mocks = vi.hoisted(() => ({
  toggle: vi.fn(),
  auth: vi.fn(),
  snackbar: vi.fn(),
  session: null as AppSession | null,
  listeners: [] as Array<(session: AppSession | null) => void>,
}));
vi.mock('../api/comments', () => ({ toggleCommentLike: mocks.toggle }));
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
import { initializeCommentLike } from './CommentLikeControl';
describe('comment like control', () => {
  let row: HTMLElement, button: HTMLButtonElement, cleanup: () => void;
  const refresh = vi.fn<() => Promise<void>>();
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listeners.length = 0;
    mocks.session = { displayName: 'Alice', email: 'alice@example.com', authenticatedAt: 1 };
    row = document.createElement('div');
    row.innerHTML =
      '<button class="game-details__like"><span data-comment-likes>10</span></button>';
    document.body.replaceChildren(row);
    button = row.querySelector('button')!;
    cleanup = initializeCommentLike(
      row,
      {
        commentId: 'id',
        authorName: 'Alice',
        text: 'Text',
        createdAt: new Date().toISOString(),
        likesCount: 10,
        isLikedByCurrentUser: true,
      },
      refresh
    );
  });
  afterEach(() => cleanup());
  it('initializes personalized state and updates only the confirmed server count/state', async () => {
    expect(button.getAttribute('aria-pressed')).toBe('true');
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
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(row.querySelector('[data-comment-likes]')?.textContent).toBe('10');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    resolve({ active: false, likesCount: 77 });
    await vi.waitFor(() => expect(button.disabled).toBe(false));
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(row.querySelector('[data-comment-likes]')?.textContent).toBe('77');
  });
  it('retains confirmed state and unlocks after definitive rejection', async () => {
    mocks.toggle.mockRejectedValue(new MutationFailure('rejected', '400'));
    button.click();
    await vi.waitFor(() => expect(mocks.snackbar).toHaveBeenCalled());
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(row.querySelector('[data-comment-likes]')?.textContent).toBe('10');
  });
  it('locks an unknown result until read-only refresh without another toggle', async () => {
    mocks.toggle.mockRejectedValue(new MutationFailure('unknown', 'lost'));
    button.click();
    await vi.waitFor(() => expect(row.querySelector('.game-details__retry')).not.toBeNull());
    button.click();
    expect(mocks.toggle).toHaveBeenCalledOnce();
    expect(button.disabled).toBe(true);
    row.querySelector<HTMLButtonElement>('.game-details__retry')!.click();
    expect(refresh).toHaveBeenCalledOnce();
    expect(mocks.toggle).toHaveBeenCalledOnce();
  });
  it('warns and opens Auth for Guests without a POST', () => {
    mocks.session = null;
    mocks.listeners.forEach((fn) => fn(null));
    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(mocks.toggle).not.toHaveBeenCalled();
    expect(mocks.auth).toHaveBeenCalledWith('login', true);
    expect(mocks.snackbar).toHaveBeenCalled();
  });
  it('ignores a late response after expiry or cleanup', async () => {
    let resolve: (value: { active: boolean; likesCount: number }) => void = () => {};
    mocks.toggle.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    button.click();
    mocks.session = null;
    mocks.listeners.forEach((fn) => fn(null));
    resolve({ active: true, likesCount: 12 });
    await vi.waitFor(() => expect(button.disabled).toBe(false));
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(row.querySelector('[data-comment-likes]')?.textContent).toBe('10');
    expect(mocks.snackbar).not.toHaveBeenCalled();
    cleanup();
    expect(row.querySelector('[role="status"]')).toBeNull();
  });
  it('ignores another authenticated identity after the request starts', async () => {
    let resolve: (value: { active: boolean; likesCount: number }) => void = () => {};
    mocks.toggle.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    button.click();
    mocks.session = { ...mocks.session!, email: 'different@example.com', authenticatedAt: 2 };
    resolve({ active: false, likesCount: 2 });
    await vi.waitFor(() => expect(button.disabled).toBe(false));
    expect(row.querySelector('[data-comment-likes]')?.textContent).toBe('10');
    expect(mocks.snackbar).not.toHaveBeenCalled();
  });
});
