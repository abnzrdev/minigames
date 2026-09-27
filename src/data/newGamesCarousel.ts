/**
 * Static carousel data aligned with course mock games
 * (@see https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/minigames/tasks/mock-data)
 */
export type CarouselCardVariant = 'peek' | 'standard' | 'featured';

export interface NewGamesCarouselSlide {
  title: string;
  likes: string;
  rating: string;
  image: string;
  variant: CarouselCardVariant;
}
