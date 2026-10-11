export const AVATAR_RANDOM_CLASSES = [
  'game-details__avatar--random-1',
  'game-details__avatar--random-2',
  'game-details__avatar--random-3',
  'game-details__avatar--random-4',
  'game-details__avatar--random-5',
] as const;

export function commenterInitial(username: string): string {
  return Array.from(username.trim())[0]?.toUpperCase() ?? '';
}

// Each mounted comments view owns its map, so retries and re-renders keep colors stable.
export function createCommentAvatarColors(random: () => number = Math.random) {
  const colors = new Map<string, string>();
  return (username: string): string => {
    const key = username.trim();
    const existing = colors.get(key);
    if (existing) return existing;
    const color = AVATAR_RANDOM_CLASSES[Math.floor(random() * AVATAR_RANDOM_CLASSES.length)];
    colors.set(key, color);
    return color;
  };
}
