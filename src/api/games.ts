const API_BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com';

const ASSETS_BASE_URL =
  'https://raw.githubusercontent.com/rolling-scopes-school/qualifying-stage/main/tasks/minigames/tasks/assets/';

export interface FeaturedGame {
  name: string;
  slug: string;
  cardImage: string;
  rating: number;
  likesCount: number;
}

interface FeaturedGamesResponse {
  data: FeaturedGame[];
}

export function cardImageUrl(imagePath: string): string {
  const fileName = imagePath.split('/').pop();

  if (!fileName) {
    return '';
  }

  return `${ASSETS_BASE_URL}${fileName}`;
}

export async function fetchFeaturedGames(): Promise<FeaturedGame[]> {
  const response = await fetch(`${API_BASE_URL}/api/games?featured=true`);

  if (!response.ok) {
    throw new Error(`Failed to load featured games: ${response.status}`);
  }

  const result: FeaturedGamesResponse = await response.json();

  return result.data;
}
