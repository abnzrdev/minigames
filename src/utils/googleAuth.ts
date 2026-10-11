import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { appSession } from './session';

export async function authenticateGoogle() {
  // Expiration/logout cleanup must finish before a new Firebase identity is created.
  await appSession.waitForCleanup();
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  if (!result.user.email) {
    await signOut(auth);
    throw new Error('Google account did not provide an email address.');
  }
  return appSession.authenticate({
    displayName: result.user.displayName ?? '',
    email: result.user.email,
    ...(result.user.photoURL ? { avatarUrl: result.user.photoURL } : {}),
  });
}

export function googleAuthenticationErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was canceled. You can try again.';
    case 'auth/popup-blocked':
      return 'Allow sign-in popups in your browser, then try again.';
    case 'auth/unauthorized-domain':
    case 'auth/operation-not-allowed':
      return 'Google sign-in is unavailable for this site. Please use email and password.';
    case 'auth/account-exists-with-different-credential':
      return 'This email uses another sign-in method. Please use that method.';
    case 'auth/network-request-failed':
      return 'Could not connect to Google. Check your connection and retry.';
    default:
      return 'Google sign-in failed. Please try again.';
  }
}
