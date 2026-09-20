export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameName: string;
}

export const LEADERBOARD_TITLE = 'Top Players This Week';

export const LEADERBOARD_ROWS: LeaderboardEntry[] = [
  {
    rank: 1,
    playerName: 'Alex_Pro99',
    gamesPlayed: 142,
    totalScore: 94250,
    streakDays: 12,
    favoriteGameName: 'Heartopia',
  },
  {
    rank: 2,
    playerName: 'CozyGamer_x',
    gamesPlayed: 118,
    totalScore: 81400,
    streakDays: 8,
    favoriteGameName: 'Cat Mail Co.',
  },
  {
    rank: 3,
    playerName: 'MatchMaster',
    gamesPlayed: 98,
    totalScore: 72110,
    streakDays: 5,
    favoriteGameName: 'Tiny Glade',
  },
  {
    rank: 4,
    playerName: 'BubblePop',
    gamesPlayed: 87,
    totalScore: 65900,
    streakDays: 3,
    favoriteGameName: 'Whisper of the House',
  },
  {
    rank: 5,
    playerName: 'SudokuGod',
    gamesPlayed: 74,
    totalScore: 59320,
    streakDays: 2,
    favoriteGameName: 'Cat Chess',
  },
];

const AVATAR_CLASSES = [
  'leaderboard__avatar--gold',
  'leaderboard__avatar--2',
  'leaderboard__avatar--3',
  'leaderboard__avatar--4',
  'leaderboard__avatar--5',
];

export function getAvatarClass(rank: number): string {
  return AVATAR_CLASSES[rank - 1] ?? AVATAR_CLASSES[0];
}

export function formatScore(score: number): string {
  return score.toLocaleString('en-US');
}

export function formatCompactScore(score: number): string {
  if (score >= 1000) {
    const tenths = Math.floor(score / 100) / 10;
    const text = tenths % 1 === 0 ? String(tenths) : tenths.toFixed(1);
    return `${text}K`;
  }
  return String(score);
}
