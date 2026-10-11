import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { appSession } from './session';
import type { AuthMode } from './navigation';

export interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}

export async function authenticateEmailPassword(mode: AuthMode, credentials: AuthCredentials) {
  // Finish prior expiration cleanup before creating a new Firebase identity.
  await appSession.waitForCleanup();
  const result =
    mode === 'register'
      ? await createUserWithEmailAndPassword(auth, credentials.email.trim(), credentials.password)
      : await signInWithEmailAndPassword(auth, credentials.email.trim(), credentials.password);
  if (mode === 'register') {
    try {
      await updateProfile(result.user, { displayName: credentials.username ?? '' });
    } catch (error) {
      await signOut(auth);
      throw error;
    }
  }
  return appSession.authenticate({
    displayName: result.user.displayName ?? '',
    email: result.user.email ?? credentials.email.trim(),
    ...(result.user.photoURL ? { avatarUrl: result.user.photoURL } : {}),
  });
}

export function authenticationErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try logging in.';
    case 'auth/network-request-failed':
      return 'Could not connect. Check your connection and retry.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/user-disabled':
      return 'This account is disabled.';
    default:
      return 'Authentication failed. Please try again.';
  }
}
