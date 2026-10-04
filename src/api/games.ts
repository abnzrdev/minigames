import type { CategorySlug } from './categories';

const API_BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com';

const ASSETS_BASE_URL =
  'https://raw.githubusercontent.com/rolling-scopes-school/qualifying-stage/main/tasks/minigames/tasks/assets/';

export interface Game {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
  featured: boolean;
}

export interface FeaturedGame {
  name: string;
  slug: string;
  cardImage: string;
  rating: number;
  likesCount: number;
}

export type GameSort = 'rating-desc' | 'rating-asc' | 'name-asc' | 'name-desc';

export interface LibraryGamesQuery {
  category: CategorySlug;
  sort: GameSort;
  page: number;
  limit: number;
}

export interface LibraryGamesMeta {
  page: number;
  totalPages: number;
}

export interface LibraryGamesResult {
  games: Game[];
  meta: LibraryGamesMeta;
}

interface FeaturedGamesResponse {
  data: FeaturedGame[];
}

interface GamesResponse {
  data: Game[];
  meta: LibraryGamesMeta;
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

export async function fetchLibraryGames(query: LibraryGamesQuery): Promise<LibraryGamesResult> {
  const params = new URLSearchParams({
    category: query.category,
    sort: query.sort,
    page: String(query.page),
    limit: String(query.limit),
  });

  const response = await fetch(`${API_BASE_URL}/api/games?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to load library games: ${response.status}`);
  }

  const result: GamesResponse = await response.json();

  return {
    games: result.data,
    meta: result.meta,
  };
}
