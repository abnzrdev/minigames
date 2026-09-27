import seed from './all-games-seed.json';
import catMailCard from '../assets/games/covers/cat-mail-co-card.jpg';
import heartopiaCard from '../assets/games/covers/heartopia-card.jpg';
import islandersCard from '../assets/games/cards/islanders-new-shores-card.jpg';
import paliaCard from '../assets/games/covers/palia-card.jpg';
import potionsCard from '../assets/games/covers/shelve-the-potions-card.jpg';
import vacationCard from '../assets/games/covers/vacation-cafe-simulator-card.jpg';
import winterCard from '../assets/games/covers/winter-burrow-card.jpg';
import type { NewGamesCarouselSlide } from './newGamesCarousel';

interface GameSeed {
  slug: string;
  name: string;
  rating: number;
  likesCount: number;
  featured: boolean;
}

const CARD_IMAGES: Record<string, string> = {
  'vacation-cafe-simulator': vacationCard,
  'winter-burrow': winterCard,
  'shelve-the-potions': potionsCard,
  heartopia: heartopiaCard,
  palia: paliaCard,
  'cat-mail-co': catMailCard,
  'tiny-glade': islandersCard,
  'tailside-cozy-cafe-sim': vacationCard,
  'islanders-new-shores': islandersCard,
};

function formatLikesCount(count: number): string {
  if (count < 1000) {
    return String(count);
  }
  const tenths = Math.floor(count / 100) / 10;
  return `${tenths.toFixed(1)}K`;
}

export function getNewGamesCarouselSlides(): NewGamesCarouselSlide[] {
  return (seed.data as GameSeed[])
    .filter((game) => game.featured)
    .map((game) => {
      const image = CARD_IMAGES[game.slug];
      if (!image) {
        throw new Error(`Missing local card image for slug: ${game.slug}`);
      }
      return {
        title: game.name,
        likes: formatLikesCount(game.likesCount),
        rating: game.rating.toFixed(1),
        image,
      };
    });
}
