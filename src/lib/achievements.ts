import { PrismaClient } from '@prisma/client';
import type { PlayerProfile, Match, PlayerAchievement, Achievement } from '@prisma/client';

export type AchievementResult = {
  achievementId: string;
  key: string;
  name: string;
};

const ACHIEVEMENTS: Record<string, { name: string }> = {
  FIRST_MATCH: { name: 'Prima Partita' },
  FIRST_WIN: { name: 'Prima Vittoria' },
  FIRST_GOAL: { name: 'Primo Gol' },
  HAT_TRICK: { name: 'Poker' },
  FIVE_GOALS: { name: 'Cinque Gol' },
  MATCHES_10: { name: '10 Partite' },
  MATCHES_50: { name: '50 Partite' },
  MATCHES_100: { name: '100 Partite' },
  GOALS_10: { name: '10 Gol' },
  GOALS_50: { name: '50 Gol' },
  GOALS_100: { name: '100 Gol' },
  CAREER_INDEX_1200: { name: 'Carriera 1200' },
  CAREER_INDEX_1500: { name: 'Carriera 1500' },
  LEVEL_10: { name: 'Livello 10' },
  LEVEL_25: { name: 'Livello 25' },
  LEVEL_50: { name: 'Livello 50' },
  UNBEATEN_5: { name: '5 Partite Imbattuto' },
  UNBEATEN_10: { name: '10 Partite Imbattuto' },
  ON_FIRE: { name: 'Stato di Grazia' },
  TEN_WINS: { name: '10 Vittorie' },
  FIFTY_WINS: { name: '50 Vittorie' },
};

type PrismaLike = {
  match: {
    findMany: (args: {
      where: { playerId: string };
      orderBy: { playedAt: 'desc' };
      take: number;
      select: { result: true; playedAt: true };
    }) => Promise<Array<{ result: 'WIN' | 'DRAW' | 'LOSS'; playedAt: Date | string }>>;
    count: (args: { where: { playerId: string; result: 'WIN' | 'DRAW' | 'LOSS' } }) => Promise<number>;
  };
  playerAchievement: {
    findMany: (args: { where: { playerProfileId: string } }) => Promise<Array<{ achievementId: string }>>;
    create: (args: { data: any }) => Promise<any>;
  };
  achievement: {
    findMany: () => Promise<Array<Achievement>>;
  };
};

type PlayerWithProfile = Pick<
  PlayerProfile,
  | 'id'
  | 'matchesPlayed'
  | 'wins'
  | 'draws'
  | 'losses'
  | 'goals'
  | 'assists'
  | 'cleanSheets'
  | 'careerIndex'
  | 'level'
  | 'xp'
> & {
  achievements?: Array<{
    achievementId: string;
    achievement?: Pick<Achievement, 'key'>;
    unlockedAt: Date | null;
  }>;
};

type MatchLike = Pick<Match, 'result' | 'goals' | 'assists'> & {
  playerStats?: {
    matchesPlayed?: number;
    wins?: number;
    goals?: number;
    careerIndex?: number;
    level?: number;
  };
  stats?: {
    matchesPlayed?: number;
    wins?: number;
    goals?: number;
    careerIndex?: number;
    level?: number;
  };
};

function mk(key: string): AchievementResult | null {
  const def = ACHIEVEMENTS[key];
  if (!def) return null;
  return { achievementId: key, key, name: def.name };
}

async function fetchRecentMatches(
  player: PlayerWithProfile & { id: string },
  prisma: PrismaLike | undefined,
  count: number
): Promise<Array<{ result: string; playedAt: Date | string | null | undefined }>> {
  if (prisma && prisma.match && typeof prisma.match.findMany === 'function') {
    const playerId = player.id;
    const res = await prisma.match.findMany({
      where: { playerId },
      orderBy: { playedAt: 'desc' },
      take: count,
      select: { result: true, playedAt: true },
    });
    if (Array.isArray(res) && res.length > 0) {
      return res.map((m) => ({
        result: String(m.result),
        playedAt: m.playedAt,
      }));
    }
  }
  return [];
}

function hasUnbeatenStreak(
  matches: Array<{ result: string }>,
  length: number
): boolean {
  if (matches.length < length) return false;
  const slice = matches.slice(0, length);
  return slice.every((m) => m.result === 'WIN' || m.result === 'DRAW');
}

function hasWinStreak(
  matches: Array<{ result: string }>,
  length: number
): boolean {
  if (matches.length < length) return false;
  const slice = matches.slice(0, length);
  return slice.every((m) => m.result === 'WIN');
}

export async function checkAchievementsAfterMatch(
  player: PlayerWithProfile & { id: string },
  match: MatchLike,
  prisma?: PrismaLike
): Promise<AchievementResult[]> {
  const unlocked: AchievementResult[] = [];
  const push = (key: string) => {
    const a = mk(key);
    if (a) unlocked.push(a);
  };

  const matchesPlayed: number =
    match.playerStats?.matchesPlayed ??
    match.stats?.matchesPlayed ??
    player.matchesPlayed ??
    0;

  const wins: number =
    match.playerStats?.wins ??
    match.stats?.wins ??
    player.wins ??
    0;

  const totalGoals: number =
    match.playerStats?.goals ??
    match.stats?.goals ??
    player.goals ??
    0;

  const matchGoals: number = match.goals ?? 0;

  const matchResult: string = String(match.result ?? '');
  const careerIndex: number =
    player.careerIndex ??
    match.playerStats?.careerIndex ??
    match.stats?.careerIndex ??
    0;

  const level: number =
    player.level ??
    match.playerStats?.level ??
    match.stats?.level ??
    0;

  const existingKeySet = new Set<string>();
  if (Array.isArray(player.achievements)) {
    for (const a of player.achievements) {
      if (a.unlockedAt) {
        const k = a.achievement?.key ?? a.achievementId;
        if (k) existingKeySet.add(k);
      }
    }
  }

  const tryUnlock = (key: string, cond: boolean) => {
    if (cond && !existingKeySet.has(key)) push(key);
  };

  tryUnlock('FIRST_MATCH', matchesPlayed >= 1 || matchResult !== '');
  tryUnlock('FIRST_WIN', (matchResult === 'WIN' && matchesPlayed >= 1) || wins >= 1);
  tryUnlock('FIRST_GOAL', totalGoals >= 1 || matchGoals >= 1);
  tryUnlock('HAT_TRICK', matchGoals >= 3);
  tryUnlock('FIVE_GOALS', matchGoals >= 5);
  tryUnlock('MATCHES_10', matchesPlayed >= 10);
  tryUnlock('MATCHES_50', matchesPlayed >= 50);
  tryUnlock('MATCHES_100', matchesPlayed >= 100);
  tryUnlock('GOALS_10', totalGoals >= 10);
  tryUnlock('GOALS_50', totalGoals >= 50);
  tryUnlock('GOALS_100', totalGoals >= 100);
  tryUnlock('CAREER_INDEX_1200', careerIndex >= 1200);
  tryUnlock('CAREER_INDEX_1500', careerIndex >= 1500);
  tryUnlock('LEVEL_10', level >= 10);
  tryUnlock('LEVEL_25', level >= 25);
  tryUnlock('LEVEL_50', level >= 50);
  tryUnlock('TEN_WINS', wins >= 10);
  tryUnlock('FIFTY_WINS', wins >= 50);

  const recent10 = await fetchRecentMatches(player, prisma, 10);
  tryUnlock('UNBEATEN_5', hasUnbeatenStreak(recent10, 5));
  tryUnlock('UNBEATEN_10', hasUnbeatenStreak(recent10, 10));
  tryUnlock('ON_FIRE', hasWinStreak(recent10, 5));

  return unlocked;
}
