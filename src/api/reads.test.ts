import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchFeaturedGames,
  fetchLibraryGames,
  fetchGameDetails,
  gameAssetUrl,
  cardImageUrl,
} from './games';
import { fetchCategories } from './categories';
import { fetchLeaderboard } from './leaderboard';
describe('read API contracts', () => {
  const fetchMock = vi.fn<typeof fetch>();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());
  it('requests server-filtered featured games without client-side selection', async () => {
    const data = [{ slug: 'featured', featured: true }];
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ data })));
    await expect(fetchFeaturedGames()).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/games?featured=true'));
  });
  it('preserves server categories, sorting, page/limit and metadata', async () => {
    const data = [{ slug: 'second-page' }],
      meta = { page: 2, totalPages: 4 };
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ data, meta })));
    await expect(
      fetchLibraryGames({ category: 'puzzle', sort: 'name-desc', page: 2, limit: 6 })
    ).resolves.toEqual({ games: data, meta });
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(Object.fromEntries(url.searchParams)).toEqual({
      category: 'puzzle',
      sort: 'name-desc',
      page: '2',
      limit: '6',
    });
  });
  it.each([
    ['featured', fetchFeaturedGames, '/api/games?featured=true'],
    ['categories', fetchCategories, '/api/categories'],
    ['leaderboard', fetchLeaderboard, '/api/leaderboard'],
  ] as const)('unwraps %s data and rejects HTTP failures', async (_name, request, path) => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data: [] })));
    await expect(request()).resolves.toEqual([]);
    expect(String(fetchMock.mock.calls[0][0])).toContain(path);
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 503 }));
    await expect(request()).rejects.toThrow('503');
  });
  it('rejects library transport/HTTP failures instead of manufacturing results', async () => {
    const query = { category: 'all', sort: 'rating-desc', page: 1, limit: 6 } as const;
    fetchMock.mockRejectedValueOnce(Error('offline'));
    await expect(fetchLibraryGames(query)).rejects.toThrow('offline');
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 500 }));
    await expect(fetchLibraryGames(query)).rejects.toThrow('500');
  });
  it('uses escaped slug and active email for Details, forwarding its abort signal', async () => {
    const controller = new AbortController(),
      data = { slug: 'a/b' };
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data })));
    await expect(fetchGameDetails('a/b', 'a+b@example.com', controller.signal)).resolves.toEqual(
      data
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/a%2Fb?userEmail=a%2Bb%40example.com'),
      { signal: controller.signal }
    );
  });
  it.each([404, 204])(
    'handles Details HTTP %i as missing rather than parsing an empty body',
    async (status) => {
      fetchMock.mockResolvedValue(new Response(null, { status }));
      await expect(fetchGameDetails('missing')).resolves.toBeNull();
      expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/api\/games\/missing$/);
    }
  );
  it('handles omitted Details data and rejects failed reads', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}'));
    await expect(fetchGameDetails('missing')).resolves.toBeNull();
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 500 }));
    await expect(fetchGameDetails('game')).rejects.toThrow('500');
  });
  it('uses the official asset basename and handles missing filenames', () => {
    expect(gameAssetUrl('/games/cover.webp')).toBe(
      'https://raw.githubusercontent.com/rolling-scopes-school/qualifying-stage/main/tasks/minigames/tasks/assets/cover.webp'
    );
    expect(cardImageUrl('cover.webp')).toBe(gameAssetUrl('cover.webp'));
    expect(gameAssetUrl('')).toBe('');
    expect(gameAssetUrl('/games/')).toBe('');
  });
});
