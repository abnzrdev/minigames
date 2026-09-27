import seed from './all-games-seed.json';
import islandersCard from '../assets/games/cards/islanders-new-shores-card.jpg';
import vacationCard from '../assets/games/cards/vacation-cafe-simulator-card.jpg';
import winterCard from '../assets/games/cards/winter-burrow-card.jpg';
import potionsCard from '../assets/games/cards/shelve-the-potions-card.jpg';
import type { CarouselCardVariant, NewGamesCarouselSlide } from './newGamesCarousel';

interface GameSeed {
  slug: string;
  name: string;
  rating: number;
  likesCount: number;
}

const CARD_IMAGES: Record<string, string> = {
  'islanders-new-shores': islandersCard,
  'vacation-cafe-simulator': vacationCard,
  'winter-burrow': winterCard,
  'shelve-the-potions': potionsCard,
};

/** Static strip layout: peek | standard | featured | standard | peek */
const SLIDE_LAYOUT: { slug: string; variant: CarouselCardVariant }[] = [
  { slug: 'shelve-the-potions', variant: 'peek' },
  { slug: 'islanders-new-shores', variant: 'standard' },
  { slug: 'vacation-cafe-simulator', variant: 'featured' },
  { slug: 'winter-burrow', variant: 'standard' },
  { slug: 'shelve-the-potions', variant: 'peek' },
];

function formatLikesCount(count: number): string {
  if (count >= 1000) {
    const thousands = count / 1000;
    const rounded = Math.round(thousands * 10) / 10;
    const text = rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
    return `${text}K`;
  }
  return String(count);
}

function gameBySlug(slug: string): GameSeed {
  const game = (seed.data as GameSeed[]).find((entry) => entry.slug === slug);
  if (!game) {
    throw new Error(`Missing game in all-games-seed.json: ${slug}`);
  }
  return game;
}

export function getNewGamesCarouselSlides(): NewGamesCarouselSlide[] {
  return SLIDE_LAYOUT.map(({ slug, variant }) => {
    const game = gameBySlug(slug);
    const image = CARD_IMAGES[slug];
    if (!image) {
      throw new Error(`Missing local card image for slug: ${slug}`);
    }
    return {
      title: game.name,
      likes: formatLikesCount(game.likesCount),
      rating: game.rating.toFixed(1),
      image,
      variant,
    };
  });
}
