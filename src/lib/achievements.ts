type AchievementResult = {
  achievementId: string;
  key: string;
  name: string;
};

type AnyRecord = Record<string, any>;

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

function mk(key: string): AchievementResult | null {
  const def = ACHIEVEMENTS[key];
  if (!def) return null;
  return { achievementId: key, key, name: def.name };
}

function safeGet<T = any>(obj: any, path: string[], fallback?: T): T | undefined {
  let current = obj;
  for (const key of path) {
    if (current == null) return fallback;
    current = current[key];
  }
  return current as T;
}

async function fetchRecentMatches(
  player: AnyRecord,
  prisma: any,
  count: number
): Promise<Array<{ result: string; playedAt: any }>> {
  try {
    if (prisma && prisma.match && typeof prisma.match.findMany === 'function') {
      const playerId = safeGet(player, ['id']) ?? safeGet(player, ['playerId']);
      if (playerId != null) {
        const res = await prisma.match.findMany({
          where: {
            OR: [
              { playerId },
              { players: { some: { id: playerId } } },
              { homeTeam: { players: { some: { id: playerId } } } },
              { awayTeam: { players: { some: { id: playerId } } } },
            ],
          },
          orderBy: { playedAt: 'desc' },
          take: count,
          select: { result: true, playedAt: true },
        });
        if (Array.isArray(res) && res.length > 0) return res;
      }
    }
  } catch {
  }
  const inline = safeGet<any[]>(player, ['recentMatches']) ?? safeGet<any[]>(player, ['matches']);
  if (Array.isArray(inline)) {
    return inline.slice(0, count).map((m) => ({
      result: safeGet(m, ['result'], ''),
      playedAt: safeGet(m, ['playedAt']),
    }));
  }
  return [];
}

function hasUnbeatenStreak(matches: Array<{ result: string }>, length: number): boolean {
  if (matches.length < length) return false;
  const slice = matches.slice(0, length);
  return slice.every((m) => m.result === 'WIN' || m.result === 'DRAW');
}

function hasWinStreak(matches: Array<{ result: string }>, length: number): boolean {
  if (matches.length < length) return false;
  const slice = matches.slice(0, length);
  return slice.every((m) => m.result === 'WIN');
}

export async function checkAchievementsAfterMatch(
  player: AnyRecord = {},
  match: AnyRecord = {},
  prisma?: any
): Promise<AchievementResult[]> {
  const unlocked: AchievementResult[] = [];
  const push = (key: string) => {
    const a = mk(key);
    if (a) unlocked.push(a);
  };

  try {
    const matchesPlayed: number =
      safeGet<number>(match, ['playerStats', 'matchesPlayed']) ??
      safeGet<number>(match, ['stats', 'matchesPlayed']) ??
      safeGet<number>(player, ['matchesPlayed']) ??
      safeGet<number>(player, ['stats', 'matchesPlayed']) ??
      0;

    const wins: number =
      safeGet<number>(match, ['playerStats', 'wins']) ??
      safeGet<number>(match, ['stats', 'wins']) ??
      safeGet<number>(player, ['wins']) ??
      safeGet<number>(player, ['stats', 'wins']) ??
      0;

    const totalGoals: number =
      safeGet<number>(match, ['playerStats', 'goals']) ??
      safeGet<number>(match, ['stats', 'goals']) ??
      safeGet<number>(player, ['goals']) ??
      safeGet<number>(player, ['stats', 'goals']) ??
      0;

    const matchGoals: number =
      safeGet<number>(match, ['goals']) ??
      safeGet<number>(match, ['playerGoals']) ??
      safeGet<number>(match, ['stats', 'goals']) ??
      0;

    const matchResult: string = safeGet<string>(match, ['result']) ?? '';
    const careerIndex: number =
      safeGet<number>(player, ['careerIndex']) ??
      safeGet<number>(player, ['stats', 'careerIndex']) ??
      safeGet<number>(match, ['playerStats', 'careerIndex']) ??
      0;

    const level: number =
      safeGet<number>(player, ['level']) ??
      safeGet<number>(player, ['stats', 'level']) ??
      safeGet<number>(match, ['playerStats', 'level']) ??
      0;

    const existingAchievements: string[] = Array.isArray(safeGet(player, ['achievements']))
      ? (safeGet<any[]>(player, ['achievements'])!).map((a: any) =>
          typeof a === 'string' ? a : safeGet(a, ['key']) ?? safeGet(a, ['achievementId']) ?? ''
        )
      : [];

    const alreadyUnlocked = new Set(existingAchievements.filter(Boolean));
    const tryUnlock = (key: string, cond: boolean) => {
      if (cond && !alreadyUnlocked.has(key)) push(key);
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

    try {
      const recent10 = await fetchRecentMatches(player, prisma, 10);
      tryUnlock('UNBEATEN_5', hasUnbeatenStreak(recent10, 5));
      tryUnlock('UNBEATEN_10', hasUnbeatenStreak(recent10, 10));
      tryUnlock('ON_FIRE', hasWinStreak(recent10, 5));
    } catch {
    }
  } catch {
  }

  return unlocked;
}
