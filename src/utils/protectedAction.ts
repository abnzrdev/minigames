import { appSession } from './session';
import { openAuthDialog } from './authDialog';

/** Call immediately before dispatching a protected request. Never replay blocked actions. */
export function ensureActiveSession(): boolean {
  if (appSession.check()) return true;
  openAuthDialog('login', true);
  return false;
}
