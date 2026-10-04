const API_BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com';

export interface GameComment {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  createdAt: string;
}

export interface GameCommentsResult {
  data: GameComment[];
  meta: { totalComments: number };
}

export async function fetchGameComments(
  slug: string,
  signal?: AbortSignal
): Promise<GameCommentsResult> {
  const response = await fetch(
    `${API_BASE_URL}/api/games/${encodeURIComponent(slug)}/comments?limit=3&sort=newest`,
    { signal }
  );
  if (!response.ok) {
    throw new Error(`Failed to load game comments: ${response.status}`);
  }
  return response.json();
}
