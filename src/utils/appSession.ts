export const APP_SESSION_KEY = 'minigames:minigames-rsschool:app-session';
export const APP_SESSION_LIFETIME_MS = 5 * 60 * 1000;

export interface AppSession {
  displayName: string;
  email: string;
  authenticatedAt: number;
  avatarUrl?: string;
}

interface SessionDependencies {
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  signOut: () => Promise<void>;
  onExpiration: () => void;
  onCleanupError: () => void;
  now?: () => number;
}

export function parseAppSession(raw: string, now: number): AppSession | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    if (
      typeof record.displayName !== 'string' ||
      typeof record.email !== 'string' ||
      !record.email.trim() ||
      typeof record.authenticatedAt !== 'number' ||
      !Number.isFinite(record.authenticatedAt) ||
      record.authenticatedAt < 0 ||
      record.authenticatedAt > now ||
      (record.avatarUrl !== undefined && typeof record.avatarUrl !== 'string') ||
      Object.keys(record).some(
        (key) => !['displayName', 'email', 'authenticatedAt', 'avatarUrl'].includes(key)
      )
    ) {
      return null;
    }
    return {
      displayName: record.displayName,
      email: record.email,
      authenticatedAt: record.authenticatedAt,
      ...(record.avatarUrl ? { avatarUrl: record.avatarUrl } : {}),
    };
  } catch {
    return null;
  }
}

export function createAppSessionManager(dependencies: SessionDependencies) {
  const now = dependencies.now ?? Date.now;
  const listeners = new Set<(session: AppSession | null) => void>();
  let active: AppSession | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cleanup = Promise.resolve();
  let rejectedRaw: string | null = null;

  function publish(session: AppSession | null): void {
    clearTimeout(timer);
    active = session;
    listeners.forEach((listener) => listener(session ? { ...session } : null));
    if (session) {
      timer = setTimeout(
        check,
        Math.max(0, session.authenticatedAt + APP_SESSION_LIFETIME_MS - now())
      );
    }
  }

  function rejectSession(expired: boolean): null {
    try {
      dependencies.storage.removeItem(APP_SESSION_KEY);
    } catch {
      // Storage can be blocked by the browser; memory still immediately enters Guest Mode.
    }
    publish(null);
    cleanup = cleanup.then(() => dependencies.signOut()).catch(() => dependencies.onCleanupError());
    if (expired) dependencies.onExpiration();
    return null;
  }

  function check(): AppSession | null {
    let raw: string | null;
    try {
      raw = dependencies.storage.getItem(APP_SESSION_KEY);
    } catch {
      return active ? rejectSession(false) : null;
    }
    if (raw === null) {
      rejectedRaw = null;
      return active ? rejectSession(false) : null;
    }
    if (raw === rejectedRaw) return null;
    const parsed = parseAppSession(raw, now());
    if (!parsed || now() - parsed.authenticatedAt >= APP_SESSION_LIFETIME_MS) {
      rejectedRaw = raw;
      return rejectSession(parsed !== null);
    }
    if (JSON.stringify(active) !== JSON.stringify(parsed)) publish(parsed);
    return { ...parsed };
  }

  function authenticate(
    profile: Pick<AppSession, 'displayName' | 'email' | 'avatarUrl'>
  ): AppSession {
    // Deliberate whitelist: Firebase User objects contain tokens and must never be serialized here.
    const session: AppSession = {
      displayName: profile.displayName,
      email: profile.email,
      authenticatedAt: now(),
      ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
    };
    if (!parseAppSession(JSON.stringify(session), now()))
      throw new Error('Invalid session profile.');
    try {
      dependencies.storage.setItem(APP_SESSION_KEY, JSON.stringify(session));
    } catch {
      rejectSession(false);
      throw new Error('Session could not be saved. Allow browser storage and retry.');
    }
    publish(session);
    rejectedRaw = null;
    return { ...session };
  }

  return {
    check,
    authenticate,
    waitForCleanup: () => cleanup,
    subscribe(listener: (session: AppSession | null) => void): () => void {
      listeners.add(listener);
      listener(active ? { ...active } : null);
      return () => listeners.delete(listener);
    },
    dispose(): void {
      clearTimeout(timer);
      listeners.clear();
    },
  };
}
