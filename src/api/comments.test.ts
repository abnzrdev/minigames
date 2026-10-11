import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchGameComments, submitComment, toggleCommentLike } from './comments';
import { commentAuthorName, validateCommentText } from '../utils/commentValidation';
const state = vi.hoisted(() => ({
  session: { displayName: 'Alice', email: 'a+b@example.com', authenticatedAt: 1 } as {
    displayName: string;
    email: string;
    authenticatedAt: number;
  } | null,
}));
vi.mock('../utils/session', () => ({ appSession: { check: () => state.session } }));
describe('comment API and validation', () => {
  const profile = { displayName: 'Alice', email: 'a+b@example.com', authenticatedAt: 1 };
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    state.session = profile;
    vi.stubGlobal('fetch', fetchMock);
  });
  it('uses latest-three personalized GET and exact trimmed 201 POST contract', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [], meta: { totalComments: 9 } }))
    );
    await fetchGameComments('a/b', undefined, profile.email);
    expect(fetchMock.mock.calls[0][0]).toContain(
      '/a%2Fb/comments?limit=3&sort=newest&userEmail=a%2Bb%40example.com'
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { commentId: 'created' } }), { status: 201 })
    );
    await submitComment('a/b', ' Hello ', profile);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ authorName: 'Alice', text: 'Hello', userEmail: profile.email }),
    });
  });
  it('omits identity in Guest reads', async () => {
    fetchMock.mockResolvedValue(new Response('{}'));
    await fetchGameComments('game');
    expect(fetchMock.mock.calls[0][0]).not.toContain('userEmail');
  });
  it('rejects empty/oversized text without sending a request', async () => {
    for (const value of ['  ', 'x'.repeat(501)])
      await expect(submitComment('game', value, profile)).rejects.toMatchObject({
        kind: 'rejected',
      });
    expect(validateCommentText(' ' + 'x'.repeat(500) + ' ')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('requires an active matching session', async () => {
    state.session = null;
    await expect(submitComment('game', 'Hello', profile)).rejects.toMatchObject({
      kind: 'unauthorized',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([200, 400, 500])(
    'does not accept HTTP %i as a confirmed creation or replay it',
    async (status) => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ data: { commentId: 'id' } }), { status })
      );
      await expect(submitComment('game', 'Hello', profile)).rejects.toMatchObject({
        kind: status === 400 ? 'rejected' : 'unknown',
      });
      expect(fetchMock).toHaveBeenCalledOnce();
    }
  );
  it('uses a backend-compatible safe author fallback', () => {
    expect(commentAuthorName({ ...profile, displayName: ' A ' })).toBe('a+b');
    expect(commentAuthorName({ ...profile, displayName: '', email: 'x@example.com' })).toBe(
      'Player'
    );
  });
  it('encodes the comment UUID and accepts only confirmed toggle state/count', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { isLikedByCurrentUser: true, likesCount: 31 } }))
    );
    await expect(toggleCommentLike('a/b', profile)).resolves.toEqual({
      active: true,
      likesCount: 31,
    });
    expect(fetchMock.mock.calls[0][0]).toContain('/api/comments/a%2Fb/like');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ userEmail: profile.email }),
    });
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { isLikedByCurrentUser: 'true', likesCount: -1 } }))
    );
    await expect(toggleCommentLike('id', profile)).rejects.toMatchObject({ kind: 'unknown' });
  });
  it('does not dispatch a comment like after the session expires', async () => {
    state.session = null;
    await expect(toggleCommentLike('id', profile)).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('does not replay an ambiguous comment toggle', async () => {
    fetchMock.mockRejectedValue(Error('lost response'));
    await expect(toggleCommentLike('id', profile)).rejects.toMatchObject({ kind: 'unknown' });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
