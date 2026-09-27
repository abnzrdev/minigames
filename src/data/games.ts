import catMailCover from '../assets/games/covers/cat-mail-co-card.jpg';
import heartopiaCover from '../assets/games/covers/heartopia-card.jpg';
import paliaCover from '../assets/games/covers/palia-card.jpg';
import potionsCover from '../assets/games/covers/shelve-the-potions-card.jpg';
import vacationCover from '../assets/games/covers/vacation-cafe-simulator-card.jpg';
import winterCover from '../assets/games/covers/winter-burrow-card.jpg';

export type LibraryGame = {
  title: string;
  category: string;
  price: string;
  description: string;
  rating: string;
  likes: string;
  cover: string;
};

export const LIBRARY_GAMES: LibraryGame[] = [
  {
    title: 'Vacation Cafe Simulator',
    category: 'Strategy',
    price: 'Free',
    description:
      'Cozy Italian Vacation Cafe 🏖️ No timers, No stress 😌 cook traditional dishes 🍝 upgrade and customize 🏠 just drink Prosecco 🥂 relax and grow your dream cafe ✨',
    rating: '4.8',
    likes: '28.7K',
    cover: vacationCover,
  },
  {
    title: 'Winter Burrow',
    category: 'Farm',
    price: 'Free',
    description:
      'A cozy woodland survival game about a mouse restoring their childhood burrow. Explore, gather resources, craft, knit warm sweaters, bake pies and meet the locals.',
    rating: '4.9',
    likes: '32.4K',
    cover: winterCover,
  },
  {
    title: 'Shelve the Potions!',
    category: 'Puzzle',
    price: 'Free',
    description:
      "Organize 2000+ potions on shelves after the witch's cats have knocked them over, using clues around an enchanted cellar. Learn strange symbols and decipher cryptic notes.",
    rating: '4.7',
    likes: '21.3K',
    cover: potionsCover,
  },
  {
    title: 'Heartopia',
    category: 'Strategy',
    price: '$1.99',
    description:
      'A multiplayer life simulation game crafted for creativity, freedom, and peace. Build your dream home, explore hobbies, and forge warm connections with friends in a cozy town.',
    rating: '4.6',
    likes: '46.8K',
    cover: heartopiaCover,
  },
  {
    title: 'Palia',
    category: 'Strategy',
    price: 'Free',
    description:
      'A free-to-play fantasy life sim adventure where you can craft, explore, and create the life and home of your dreams in a vibrant, heartwarming world.',
    rating: '4.8',
    likes: '89.5K',
    cover: paliaCover,
  },
  {
    title: 'Cat Mail Co.',
    category: 'Puzzle',
    price: 'Free',
    description:
      'Run a cozy cat post office. Sort and deliver parcels from the daily boat. At night, the moon reveals hidden truths about packages. Clear a strange backlog and unlock new destinations.',
    rating: '4.9',
    likes: '38.2K',
    cover: catMailCover,
  },
];
