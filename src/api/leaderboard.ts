const API_BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com';

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameName: string;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${API_BASE_URL}/api/leaderboard`);

  if (!response.ok) {
    throw new Error(`Failed to load leaderboard: ${response.status}`);
  }

  const result: LeaderboardResponse = await response.json();

  return result.data;
}
