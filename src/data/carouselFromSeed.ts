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
  if (count >= 1000) {
    const thousands = count / 1000;
    const rounded = Math.round(thousands * 10) / 10;
    const text = rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
    return `${text}K`;
  }
  return String(count);
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
