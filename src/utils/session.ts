import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { showSnackbar } from '../components/Snackbar';
import { createAppSessionManager } from './appSession';

// Access storage lazily so browsers which block localStorage do not crash during module loading.
export const appSession = createAppSessionManager({
  storage: {
    getItem: (key) => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
    removeItem: (key) => window.localStorage.removeItem(key),
  },
  signOut: () => signOut(auth),
  onExpiration: () => showSnackbar('Your session expired. Please sign in again.', 'error'),
  onCleanupError: () => showSnackbar('Firebase sign-out failed. You are in Guest Mode.', 'error'),
});

export async function logout(): Promise<void> {
  const success = await appSession.end();
  if (success) showSnackbar('Logged out successfully.', 'success');
}

export function initAppSession(): void {
  appSession.subscribe((session) => {
    document.body.dataset.authenticated = String(session !== null);
    document.dispatchEvent(new CustomEvent('app-session-change', { detail: session }));
  });
  appSession.check();
  window.addEventListener('focus', () => appSession.check());
  window.addEventListener('pageshow', () => appSession.check());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') appSession.check();
  });
  window.addEventListener('storage', () => appSession.check());
}
