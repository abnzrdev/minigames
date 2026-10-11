import { MutationFailure, postSessionMutation, readToggleResult } from './mutations';
import type { AppSession } from '../utils/appSession';
import { commentAuthorName, validateCommentText } from '../utils/commentValidation';

const API_BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com';

export interface GameComment {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  isLikedByCurrentUser?: boolean;
  createdAt: string;
}

export interface GameCommentsResult {
  data: GameComment[];
  meta: { totalComments: number };
}

export async function fetchGameComments(
  slug: string,
  signal?: AbortSignal,
  userEmail?: string
): Promise<GameCommentsResult> {
  const params = new URLSearchParams({ limit: '3', sort: 'newest' });
  if (userEmail) params.set('userEmail', userEmail);
  const response = await fetch(
    `${API_BASE_URL}/api/games/${encodeURIComponent(slug)}/comments?${params}`,
    { signal }
  );
  if (!response.ok) {
    throw new Error(`Failed to load game comments: ${response.status}`);
  }
  return response.json();
}

export async function submitComment(
  slug: string,
  value: string,
  session: AppSession
): Promise<GameComment> {
  const error = validateCommentText(value);
  if (error) throw new MutationFailure('rejected', error);
  const data = await postSessionMutation(
    `/api/games/${encodeURIComponent(slug)}/comments`,
    {
      authorName: commentAuthorName(session),
      text: value.trim(),
    },
    session,
    201
  );
  if (
    !data ||
    typeof data !== 'object' ||
    !('commentId' in data) ||
    typeof data.commentId !== 'string'
  ) {
    throw new MutationFailure('unknown', 'Comment result could not be confirmed.');
  }
  return data as GameComment;
}

export async function toggleCommentLike(
  commentId: string,
  session: AppSession
): Promise<{ active: boolean; likesCount: number }> {
  const data = await postSessionMutation(
    `/api/comments/${encodeURIComponent(commentId)}/like`,
    {},
    session
  );
  return readToggleResult(data, 'isLikedByCurrentUser');
}
