// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ get: vi.fn(), snackbar: vi.fn() }));
vi.mock('../api/comments', () => ({ fetchGameComments: mocks.get }));
vi.mock('../utils/session', () => ({
  appSession: { check: () => null, subscribe: () => () => {} },
}));
vi.mock('./Snackbar', () => ({ showSnackbar: mocks.snackbar }));
import { loadGameComments } from './GameComments';
describe('latest comments view', () => {
  let section: HTMLElement, cleanup: ReturnType<typeof loadGameComments>;
  beforeEach(() => {
    vi.clearAllMocks();
    section = document.createElement('section');
    document.body.replaceChildren(section);
  });
  afterEach(() => cleanup?.());
  it('renders server total and comment text safely, and preserves author color on refresh', async () => {
    const result = {
      data: [
        {
          commentId: 'id',
          authorName: 'Alice',
          text: '<img src=x onerror=bad()>\nText',
          likesCount: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      meta: { totalComments: 40 },
    };
    mocks.get.mockResolvedValue(result);
    cleanup = loadGameComments(section, 'game');
    await vi.waitFor(() =>
      expect(section.querySelector('.game-details__comment-text')?.textContent).toBe(
        result.data[0].text
      )
    );
    expect(section.querySelector('.game-details__comment-text img')).toBeNull();
    expect(section.textContent).toContain('Comments (40)');
    const color = section.querySelector('.game-details__avatar')?.className;
    await cleanup.refresh();
    expect(section.querySelector('.game-details__avatar')?.className).toBe(color);
  });
  it('shows empty, loading and error/retry states using GET only', async () => {
    mocks.get.mockResolvedValueOnce({ data: [], meta: { totalComments: 0 } });
    cleanup = loadGameComments(section, 'game');
    expect(section.querySelector('[aria-label="Loading comments"]')).not.toBeNull();
    await vi.waitFor(() => expect(section.textContent).toContain('No comments yet.'));
    mocks.get.mockRejectedValueOnce(Error('offline'));
    await cleanup.refresh();
    expect(section.textContent).toContain('could not be loaded');
    mocks.get.mockResolvedValueOnce({ data: [], meta: { totalComments: 0 } });
    section.querySelector<HTMLButtonElement>('.game-comments__retry')!.click();
    await vi.waitFor(() => expect(section.textContent).toContain('No comments yet.'));
    expect(mocks.get).toHaveBeenCalledTimes(3);
  });
  it('ignores a late response after disposal', async () => {
    let resolve: (result: { data: never[]; meta: { totalComments: number } }) => void = () => {};
    mocks.get.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    cleanup = loadGameComments(section, 'game');
    cleanup();
    resolve({ data: [], meta: { totalComments: 999 } });
    await Promise.resolve();
    expect(section.textContent).not.toContain('999');
  });
});
