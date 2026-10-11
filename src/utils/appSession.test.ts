import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  APP_SESSION_KEY,
  APP_SESSION_LIFETIME_MS,
  createAppSessionManager,
  parseAppSession,
} from './appSession';

describe('five-minute app session', () => {
  const now = 1_800_000_000_000;
  const profile = { displayName: 'Alice', email: 'alice@example.com' };
  let values: Map<string, string>;
  let signOut: ReturnType<typeof vi.fn<() => Promise<void>>>;
  let expired: ReturnType<typeof vi.fn<() => void>>;
  let cleanupError: ReturnType<typeof vi.fn<() => void>>;
  let manager: ReturnType<typeof createAppSessionManager>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    values = new Map([['unrelated', 'preserve me']]);
    signOut = vi.fn().mockResolvedValue(undefined);
    expired = vi.fn();
    cleanupError = vi.fn();
    manager = createAppSessionManager({
      storage: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => {
          values.set(key, value);
        },
        removeItem: (key) => {
          values.delete(key);
        },
      },
      signOut,
      onExpiration: expired,
      onCleanupError: cleanupError,
    });
  });

  afterEach(() => {
    manager.dispose();
    vi.useRealTimers();
  });

  it('persists only profile fields and numeric authentication timestamp', () => {
    const firebaseLikeUser = {
      ...profile,
      avatarUrl: 'https://example.com/a.png',
      password: 'secret',
      token: 'secret',
    };
    expect(manager.authenticate(firebaseLikeUser)).toEqual({
      ...profile,
      avatarUrl: firebaseLikeUser.avatarUrl,
      authenticatedAt: now,
    });
    expect(JSON.parse(values.get(APP_SESSION_KEY)!)).toEqual({
      ...profile,
      avatarUrl: firebaseLikeUser.avatarUrl,
      authenticatedAt: now,
    });
  });

  it('omits unavailable avatar and never renews a restored session', () => {
    const original = { ...profile, authenticatedAt: now - 100_000 };
    values.set(APP_SESSION_KEY, JSON.stringify(original));
    expect(manager.check()).toEqual(original);
    vi.advanceTimersByTime(100_000);
    expect(manager.check()).toEqual(original);
    expect(JSON.parse(values.get(APP_SESSION_KEY)!)).toEqual(original);
  });

  it('expires at exactly five minutes and notifies/signs out once', async () => {
    const listener = vi.fn();
    manager.subscribe(listener);
    manager.authenticate(profile);
    vi.advanceTimersByTime(APP_SESSION_LIFETIME_MS - 1);
    expect(manager.check()).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(manager.check()).toBeNull();
    expect(listener).toHaveBeenLastCalledWith(null);
    expect(values.has(APP_SESSION_KEY)).toBe(false);
    expect(values.get('unrelated')).toBe('preserve me');
    await manager.waitForCleanup();
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it('rejects an expired stored session on startup', async () => {
    values.set(
      APP_SESSION_KEY,
      JSON.stringify({ ...profile, authenticatedAt: now - APP_SESSION_LIFETIME_MS })
    );
    expect(manager.check()).toBeNull();
    await manager.waitForCleanup();
    expect(signOut).toHaveBeenCalledOnce();
    expect(expired).toHaveBeenCalledOnce();
  });

  it.each([
    'invalid',
    '',
    'null',
    '[]',
    '{}',
    JSON.stringify({ email: profile.email, authenticatedAt: now }),
    JSON.stringify({ ...profile, authenticatedAt: 'now' }),
    JSON.stringify({ ...profile, email: 1, authenticatedAt: now }),
    JSON.stringify({ ...profile, email: ' ', authenticatedAt: now }),
    JSON.stringify({ ...profile, authenticatedAt: now + 1 }),
    JSON.stringify({ ...profile, authenticatedAt: -1 }),
    JSON.stringify({ ...profile, authenticatedAt: now, avatarUrl: 12 }),
    JSON.stringify({ ...profile, authenticatedAt: now, token: 'private' }),
  ])('rejects corrupt or invalid storage: %s', async (raw) => {
    values.set(APP_SESSION_KEY, raw);
    expect(manager.check()).toBeNull();
    await manager.waitForCleanup();
    expect(values.has(APP_SESSION_KEY)).toBe(false);
    expect(signOut).toHaveBeenCalledOnce();
    expect(expired).not.toHaveBeenCalled();
    expect(values.get('unrelated')).toBe('preserve me');
  });

  it('does not infer authentication from an absent app record', () => {
    expect(manager.check()).toBeNull();
    expect(signOut).not.toHaveBeenCalled();
  });

  it('handles cross-tab removal by immediately clearing active UI state', async () => {
    manager.authenticate(profile);
    values.delete(APP_SESSION_KEY);
    expect(manager.check()).toBeNull();
    await manager.waitForCleanup();
    expect(signOut).toHaveBeenCalledOnce();
  });

  it('recovers from failed Firebase cleanup while keeping Guest Mode', async () => {
    signOut.mockRejectedValue(new Error('offline'));
    values.set(APP_SESSION_KEY, '{}');
    expect(manager.check()).toBeNull();
    await manager.waitForCleanup();
    expect(cleanupError).toHaveBeenCalledOnce();
    expect(manager.check()).toBeNull();
    expect(manager.authenticate(profile).authenticatedAt).toBe(now);
  });

  it('does not leak mutable session references', () => {
    const session = manager.authenticate(profile);
    session.email = 'changed@example.com';
    manager.subscribe((value) => {
      if (value) value.email = 'changed@example.com';
    });
    expect(manager.check()?.email).toBe(profile.email);
  });

  it('fails safely when storage rejects writes', async () => {
    const blocked = createAppSessionManager({
      storage: {
        getItem: () => null,
        setItem: () => {
          throw Error('blocked');
        },
        removeItem: vi.fn(),
      },
      signOut,
      onExpiration: expired,
      onCleanupError: cleanupError,
    });
    expect(() => blocked.authenticate(profile)).toThrow('Session could not be saved');
    await blocked.waitForCleanup();
    expect(signOut).toHaveBeenCalledOnce();
    blocked.dispose();
  });

  it('notifies once even when storage cannot remove the expired record', async () => {
    const raw = JSON.stringify({ ...profile, authenticatedAt: now - APP_SESSION_LIFETIME_MS });
    const blocked = createAppSessionManager({
      storage: {
        getItem: () => raw,
        setItem: vi.fn(),
        removeItem: () => {
          throw Error('blocked');
        },
      },
      signOut,
      onExpiration: expired,
      onCleanupError: cleanupError,
    });
    expect(blocked.check()).toBeNull();
    expect(blocked.check()).toBeNull();
    await blocked.waitForCleanup();
    expect(expired).toHaveBeenCalledOnce();
    expect(signOut).toHaveBeenCalledOnce();
    blocked.dispose();
  });

  it('validates the numeric timestamp and accepts missing display names as empty text', () => {
    expect(
      parseAppSession(JSON.stringify({ ...profile, displayName: '', authenticatedAt: now }), now)
        ?.displayName
    ).toBe('');
    expect(
      parseAppSession(
        JSON.stringify({ ...profile, authenticatedAt: Number.POSITIVE_INFINITY }),
        now
      )
    ).toBeNull();
  });
});
