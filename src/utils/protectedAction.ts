import { appSession } from './session';
import { openAuthDialog } from './authDialog';
import { showSnackbar } from '../components/Snackbar';

/** Call immediately before dispatching a protected request. Never replay blocked actions. */
export function ensureActiveSession(): boolean {
  const recovery = appSession.recoveryVersion;
  if (appSession.check()) return true;
  openAuthDialog('login', true);
  if (recovery === appSession.recoveryVersion)
    showSnackbar('Please sign in to use this action.', 'error');
  return false;
}
