import { postSessionMutation, readToggleResult } from './mutations';
import type { AppSession } from '../utils/appSession';

export async function toggleFavorite(slug: string, session: AppSession) {
  return readToggleResult(
    await postSessionMutation(`/api/games/${encodeURIComponent(slug)}/favorite`, {}, session),
    'isFavorited'
  );
}
