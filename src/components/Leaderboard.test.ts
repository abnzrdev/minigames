// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LeaderboardEntry } from '../api/leaderboard';
const mocks = vi.hoisted(() => ({ get: vi.fn(), snackbar: vi.fn() }));
vi.mock('../api/leaderboard', () => ({ fetchLeaderboard: mocks.get }));
vi.mock('./Snackbar', () => ({ showSnackbar: mocks.snackbar }));
import { renderLeaderboard } from './Leaderboard';
const rows: LeaderboardEntry[] = [
  {
    rank: 1,
    playerName: 'Alice_Pro',
    gamesPlayed: 20,
    totalScore: 94250,
    streakDays: 3,
    favoriteGameName: 'Sudoku',
  },
  {
    rank: 2,
    playerName: 'Solo',
    gamesPlayed: 5,
    totalScore: 2000,
    streakDays: 1,
    favoriteGameName: 'Cards',
  },
  {
    rank: 8,
    playerName: ' ',
    gamesPlayed: 1,
    totalScore: 90,
    streakDays: 0,
    favoriteGameName: 'Puzzle',
  },
];
describe('Leaderboard async rendering', () => {
  let section: HTMLElement;
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.replaceChildren();
    mocks.get.mockResolvedValue(rows);
  });
  afterEach(() => document.body.replaceChildren());
  function mount(): void {
    section = renderLeaderboard();
    document.body.append(section);
  }
  it('renders rank, initials, score formats and API records', async () => {
    mount();
    await vi.waitFor(() => expect(section.querySelectorAll('tbody tr')).toHaveLength(3));
    expect(section.querySelector('.leaderboard__body')?.textContent).toContain('94,250');
    expect(section.textContent).toContain('94.2K');
    expect(section.textContent).toContain('2K');
    expect(section.textContent).toContain('90');
    expect(
      [...section.querySelectorAll('.leaderboard__avatar')].map((e) => e.textContent?.trim())
    ).toEqual(['AP', 'SO', '?']);
    expect(section.querySelector('.leaderboard__rank--top')?.textContent?.trim()).toBe('#1');
    expect(section.textContent).toContain('Sudoku');
    expect(section.querySelector('caption')?.textContent).toContain('Top Players This Week');
  });
  it('shows loading and failure, then allows a successful read-only retry', async () => {
    mocks.get.mockRejectedValueOnce(Error('offline'));
    mount();
    expect(section.querySelectorAll('[aria-label="Loading leaderboard"]')).toHaveLength(3);
    await vi.waitFor(() => expect(section.querySelector('.leaderboard__retry')).not.toBeNull());
    expect(mocks.snackbar).toHaveBeenCalledWith('Could not load leaderboard.', 'error');
    section.querySelector<HTMLButtonElement>('.leaderboard__retry')!.click();
    await vi.waitFor(() =>
      expect(section.querySelector('.leaderboard__name')?.textContent?.trim()).toBe('Alice_Pro')
    );
    expect(mocks.get).toHaveBeenCalledTimes(2);
    expect(mocks.snackbar).toHaveBeenCalledWith('Leaderboard loaded successfully.', 'success');
  });
  it('shows an empty state', async () => {
    mocks.get.mockResolvedValue([]);
    mount();
    await vi.waitFor(() => expect(section.textContent).toContain('No leaderboard players'));
    expect(section.querySelector('.leaderboard__name')).toBeNull();
  });
  it('does not apply a late response after unmount', async () => {
    let resolve: (data: LeaderboardEntry[]) => void = () => {};
    mocks.get.mockReturnValue(
      new Promise<LeaderboardEntry[]>((r) => {
        resolve = r;
      })
    );
    mount();
    section.remove();
    resolve(rows);
    await Promise.resolve();
    expect(section.querySelector('.leaderboard__name')).toBeNull();
  });
});
