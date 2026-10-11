import type { AppSession } from './appSession';

export const GENERIC_PROFILE_NAME = 'Player';

export function profileName(profile: Pick<AppSession, 'displayName' | 'email'>): string {
  return profile.displayName.trim() || profile.email.split('@')[0].trim() || GENERIC_PROFILE_NAME;
}

export function profileInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (word) =>
        Array.from(word)
          .find((character) => /[\p{L}\p{N}]/u.test(character))
          ?.toUpperCase() ?? ''
    )
    .join('');
}
