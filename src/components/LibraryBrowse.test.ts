// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Game, LibraryGamesQuery, LibraryGamesResult } from '../api/games';
import type { Category } from '../api/categories';
const mocks = vi.hoisted(() => ({ games: vi.fn(), categories: vi.fn(), snackbar: vi.fn() }));
vi.mock('../api/games', async (original) => ({
  ...(await original<typeof import('../api/games')>()),
  fetchLibraryGames: mocks.games,
}));
vi.mock('../api/categories', () => ({ fetchCategories: mocks.categories }));
vi.mock('../utils/session', () => ({ appSession: { check: () => null } }));
vi.mock('./Snackbar', () => ({ showSnackbar: mocks.snackbar }));
const games: Game[] = [
  {
    slug: 'puzzle-game',
    name: 'Puzzle Game',
    category: 'puzzle',
    price: 'Free',
    shortDescription: 'A puzzle.',
    rating: 4.8,
    likesCount: 2500,
    cardImage: 'puzzle.webp',
    featured: false,
  },
  {
    slug: 'card-game',
    name: 'Card Game',
    category: '',
    price: '$5',
    shortDescription: 'Cards.',
    rating: 3,
    likesCount: 9,
    cardImage: 'card.webp',
    featured: false,
  },
];
const categories: Category[] = [
  { slug: 'all', label: 'All', isDefault: true },
  { slug: 'puzzle', label: 'Puzzle', isDefault: false },
];
describe('Library native controls and server-driven browsing', () => {
  let navigation: typeof import('../utils/navigation'), root: HTMLElement;
  let mobile = false;
  let mediaListeners: Array<() => void>;
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    mobile = false;
    mediaListeners = [];
    vi.stubGlobal('matchMedia', () => ({
      get matches() {
        return mobile;
      },
      addEventListener: (_: string, fn: () => void) => mediaListeners.push(fn),
      removeEventListener: (_: string, fn: () => void) => {
        mediaListeners = mediaListeners.filter((x) => x !== fn);
      },
    }));
    history.replaceState(null, '', '/library?category=all&sort=rating-desc&page=1');
    document.body.innerHTML = '<main id="page-content"></main>';
    root = document.getElementById('page-content')!;
    mocks.categories.mockResolvedValue(categories);
    mocks.games.mockImplementation(async (query: LibraryGamesQuery) => ({
      games,
      meta: { page: query.page, totalPages: 6 },
    }));
    navigation = await import('../utils/navigation');
    navigation.initNavigation();
  });
  afterEach(async () => {
    document.body.replaceChildren();
    await Promise.resolve();
    vi.unstubAllGlobals();
  });
  async function mount(): Promise<void> {
    const { renderLibraryFilterBar } = await import('./LibraryFilterBar');
    const { renderLibraryBody } = await import('./LibraryBody');
    const { renderLibraryPagination } = await import('./LibraryPagination');
    root.append(renderLibraryFilterBar(), renderLibraryBody(), renderLibraryPagination());
  }
  async function loaded(): Promise<void> {
    await vi.waitFor(() => expect(root.querySelectorAll('.game-card')).toHaveLength(2));
  }
  it('renders API cards and drives category, sorting and pagination through query state', async () => {
    let resolve: (result: LibraryGamesResult) => void = () => {};
    mocks.games.mockImplementationOnce(
      () =>
        new Promise<LibraryGamesResult>((r) => {
          resolve = r;
        })
    );
    await mount();
    expect(root.querySelectorAll('[aria-label="Loading game"]')).toHaveLength(6);
    resolve({ games, meta: { page: 1, totalPages: 6 } });
    await loaded();
    expect(mocks.games).toHaveBeenCalledWith({
      category: 'all',
      sort: 'rating-desc',
      page: 1,
      limit: 6,
    });
    expect(root.textContent).toContain('2.5K');
    expect(root.querySelector('.game-card__price--free')?.textContent?.trim()).toBe('Free');
    root.querySelector<HTMLButtonElement>('[data-dir="next"]')!.click();
    await vi.waitFor(() =>
      expect(mocks.games).toHaveBeenLastCalledWith({
        category: 'all',
        sort: 'rating-desc',
        page: 2,
        limit: 6,
      })
    );
    expect(navigation.currentRoute().libraryPage).toBe(2);
    root.querySelector<HTMLButtonElement>('[data-category="puzzle"]')!.click();
    await vi.waitFor(() =>
      expect(mocks.games).toHaveBeenLastCalledWith({
        category: 'puzzle',
        sort: 'rating-desc',
        page: 1,
        limit: 6,
      })
    );
    expect(root.querySelector('[data-category="puzzle"]')?.getAttribute('aria-pressed')).toBe(
      'true'
    );
    const select = root.querySelector('select')!;
    select.value = 'name-desc';
    select.dispatchEvent(new Event('change'));
    await vi.waitFor(() =>
      expect(mocks.games).toHaveBeenLastCalledWith({
        category: 'puzzle',
        sort: 'name-desc',
        page: 1,
        limit: 6,
      })
    );
    expect(new URL(location.href).searchParams.get('sort')).toBe('name-desc');
  });
  it('restores controls and requests on browser history without changing server results locally', async () => {
    await mount();
    await loaded();
    history.replaceState(null, '', '/library?category=puzzle&sort=name-asc&page=3');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await vi.waitFor(() =>
      expect(mocks.games).toHaveBeenLastCalledWith({
        category: 'puzzle',
        sort: 'name-asc',
        page: 3,
        limit: 6,
      })
    );
    expect(root.querySelector<HTMLSelectElement>('select')?.value).toBe('name-asc');
    expect(root.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('3');
    expect(
      [...root.querySelectorAll('.game-card__title')].map((e) => e.textContent?.trim())
    ).toEqual(['Puzzle Game', 'Card Game']);
  });
  it('uses the backend default only when the URL did not specify a category', async () => {
    history.replaceState(null, '', '/library');
    mocks.categories.mockResolvedValue([{ ...categories[1], isDefault: true }, categories[0]]);
    await mount();
    await vi.waitFor(() => expect(navigation.currentRoute().category).toBe('puzzle'));
    expect(root.querySelector('[data-category="puzzle"]')?.getAttribute('aria-pressed')).toBe(
      'true'
    );
  });
  it('shows empty data states and successful read-only retry after errors', async () => {
    mocks.games.mockRejectedValueOnce(Error('offline'));
    mocks.categories.mockRejectedValueOnce(Error('offline'));
    await mount();
    await vi.waitFor(() => expect(root.querySelector('.library-body__retry')).not.toBeNull());
    expect(root.textContent).toContain('Categories could not be loaded.');
    root.querySelector<HTMLButtonElement>('.library-body__retry')!.click();
    root.querySelector<HTMLButtonElement>('.library-filter-bar__retry')!.click();
    await loaded();
    await vi.waitFor(() => expect(root.querySelectorAll('[data-category]')).toHaveLength(2));
    expect(mocks.snackbar).toHaveBeenCalledWith('Games loaded successfully.', 'success');
    expect(mocks.snackbar).toHaveBeenCalledWith('Categories loaded successfully.', 'success');
    mocks.games.mockResolvedValue({ games: [], meta: { page: 1, totalPages: 0 } });
    navigation.navigateLibrary({ category: 'puzzle' });
    await vi.waitFor(() => expect(root.textContent).toContain('Data Not Found'));
    expect(root.querySelector<HTMLButtonElement>('[data-dir="next"]')?.disabled).toBe(true);
  });
  it('renders an empty category list', async () => {
    mocks.categories.mockResolvedValue([]);
    await mount();
    await vi.waitFor(() => expect(root.textContent).toContain('No categories available.'));
  });
  it('ignores an older asynchronous response after the query changes', async () => {
    let finish: (value: LibraryGamesResult) => void = () => {};
    mocks.games.mockImplementationOnce(
      () =>
        new Promise<LibraryGamesResult>((r) => {
          finish = r;
        })
    );
    await mount();
    navigation.navigateLibrary({ category: 'puzzle' });
    await loaded();
    finish({ games: [{ ...games[0], name: 'Stale result' }], meta: { page: 1, totalPages: 1 } });
    await Promise.resolve();
    expect(root.textContent).not.toContain('Stale result');
    expect(root.querySelectorAll('.game-card')).toHaveLength(2);
  });
  it('clamps invalid server page metadata by replacing the URL and rereading', async () => {
    history.replaceState(null, '', '/library?category=all&page=9');
    mocks.games.mockImplementation(async (query: LibraryGamesQuery) => ({
      games,
      meta: { page: query.page, totalPages: 2 },
    }));
    await mount();
    await loaded();
    expect(navigation.currentRoute().libraryPage).toBe(2);
    expect(mocks.games).toHaveBeenLastCalledWith({
      category: 'all',
      sort: 'rating-desc',
      page: 2,
      limit: 6,
    });
  });
  it('limits visible pages responsively, validates pagination updates and refuses redundant/invalid navigation', async () => {
    await mount();
    await loaded();
    expect(root.querySelectorAll('[data-page]')).toHaveLength(4);
    mobile = true;
    mediaListeners.forEach((fn) => fn());
    expect(root.querySelectorAll('[data-page]')).toHaveLength(3);
    const before = location.href;
    root.querySelector<HTMLButtonElement>('[data-page="1"]')!.click();
    expect(location.href).toBe(before);
    window.dispatchEvent(
      new CustomEvent('library-pagination-update', { detail: { page: NaN, totalPages: 8 } })
    );
    expect(root.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('1');
    window.dispatchEvent(
      new CustomEvent('library-pagination-update', { detail: { page: 6, totalPages: 6 } })
    );
    expect(
      [...root.querySelectorAll('[data-page]')].map((e) => e.getAttribute('data-page'))
    ).toEqual(['4', '5', '6']);
    expect(root.querySelector<HTMLButtonElement>('[data-dir="next"]')?.disabled).toBe(true);
    root.querySelector<HTMLButtonElement>('[data-dir="prev"]')!.click();
    await vi.waitFor(() => expect(navigation.currentRoute().libraryPage).toBe(5));
  });
  it('disconnects subscriptions and media listeners after unmount', async () => {
    await mount();
    await loaded();
    root.replaceChildren();
    await Promise.resolve();
    const calls = mocks.games.mock.calls.length;
    navigation.navigateLibrary({ category: 'puzzle' });
    expect(mocks.games).toHaveBeenCalledTimes(calls);
    expect(mediaListeners).toHaveLength(0);
  });
});
