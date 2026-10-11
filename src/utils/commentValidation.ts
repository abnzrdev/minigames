import type { AppSession } from './appSession';

export const COMMENT_MAX_LENGTH = 500;

export function validateCommentText(value: string): string | null {
  const text = value.trim();
  if (!text) return 'Write a comment before sending.';
  return text.length > COMMENT_MAX_LENGTH ? 'Comments must contain at most 500 characters.' : null;
}

export function commentAuthorName(profile: AppSession): string {
  const name = profile.displayName.trim();
  if (name.length >= 2 && name.length <= 30) return name;
  const localPart = profile.email.split('@')[0].trim();
  return localPart.length >= 2 && localPart.length <= 30 ? localPart : 'Player';
}
