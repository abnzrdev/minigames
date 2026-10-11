import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toggleFavorite } from './favorites';
import { fetchGameDetails } from './games';
const state = vi.hoisted(() => ({
  session: { displayName: 'Alice', email: 'a+b@example.com', authenticatedAt: 123 } as {
    displayName: string;
    email: string;
    authenticatedAt: number;
  } | null,
}));
vi.mock('../utils/session', () => ({ appSession: { check: () => state.session } }));
describe('favorite API contract', () => {
  const session = { displayName: 'Alice', email: 'a+b@example.com', authenticatedAt: 123 };
  const fetchMock = vi.fn();
  beforeEach(() => {
    state.session = session;
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('encodes personalized GET identity and sends the exact toggle body', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { slug: 'game' } })))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { isFavorited: true, likesCount: 42 } }))
      );
    await fetchGameDetails('a/b', session.email);
    expect(fetchMock.mock.calls[0][0]).toContain('a%2Fb?userEmail=a%2Bb%40example.com');
    await expect(toggleFavorite('a/b', session)).resolves.toEqual({ active: true, likesCount: 42 });
    expect(fetchMock.mock.calls[1][0]).toContain('/api/games/a%2Fb/favorite');
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ userEmail: session.email }),
    });
  });

  it('never sends a mutation for a missing or changed app session', async () => {
    state.session = null;
    await expect(toggleFavorite('game', session)).rejects.toMatchObject({ kind: 'unauthorized' });
    state.session = { ...session, authenticatedAt: 124 };
    await expect(toggleFavorite('game', session)).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([400, 403, 408, 500])('classifies HTTP %i without retrying POST', async (status) => {
    fetchMock.mockResolvedValue(new Response('{}', { status }));
    await expect(toggleFavorite('game', session)).rejects.toMatchObject({
      kind: status === 408 || status >= 500 ? 'unknown' : 'rejected',
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('treats lost or malformed responses as unknown and never automatically retries', async () => {
    fetchMock.mockRejectedValueOnce(Error('lost response'));
    await expect(toggleFavorite('game', session)).rejects.toMatchObject({ kind: 'unknown' });
    expect(fetchMock).toHaveBeenCalledOnce();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { isFavorited: 'yes', likesCount: -1 } }))
    );
    await expect(toggleFavorite('game', session)).rejects.toMatchObject({ kind: 'unknown' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
