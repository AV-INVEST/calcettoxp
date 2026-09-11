import type { PlayerProfile, Match, Achievement } from "@prisma/client";
import {
  checkAchievementsAfterMatchV2,
  buildAggregatorContext,
  calcStreaks,
  type AggregatorContext,
  type NewUnlockResult,
} from "./achievement-engine";

export const MAX_ACHIEVABLE_LEVEL = 50;

export function isAchievementVisible(a: {
  requirementType?: string;
  requirementValue?: number;
}): boolean {
  if (
    a.requirementType === "VALUE_LEVEL" &&
    typeof a.requirementValue === "number" &&
    a.requirementValue > MAX_ACHIEVABLE_LEVEL
  ) {
    return false;
  }
  return true;
}

export function filterVisibleAchievements<
  T extends { requirementType?: string; requirementValue?: number }
>(items: T[]): T[] {
  return items.filter(isAchievementVisible);
}

export type AchievementResult = {
  achievementId: string;
  key: string;
  name: string;
  tier?: "FREE" | "PRO";
  icon?: string;
};

type LegacyPlayerLike = Pick<
  PlayerProfile,
  | "id"
  | "matchesPlayed"
  | "wins"
  | "draws"
  | "losses"
  | "goals"
  | "assists"
  | "cleanSheets"
  | "careerIndex"
  | "level"
  | "xp"
> & {
  primaryRole?: PlayerProfile["primaryRole"] | null;
  achievements?: Array<{
    achievementId: string;
    achievement?: Pick<Achievement, "key">;
    unlockedAt: Date | null;
  }>;
};

type LegacyMatchLike = Pick<Match, "result" | "goals" | "assists"> & {
  playerStats?: Partial<AggregatorContext["lifetime"]>;
  stats?: Partial<AggregatorContext["lifetime"]>;
};

export async function checkAchievementsAfterMatch(
  player: LegacyPlayerLike & { id: string },
  match: LegacyMatchLike,
  _prisma?: unknown
): Promise<AchievementResult[]> {
  const lifetimeAfterMatch: AggregatorContext["lifetime"] = {
    matchesPlayed: (match.playerStats?.matchesPlayed ?? match.stats?.matchesPlayed ?? player.matchesPlayed) as number,
    wins: (match.playerStats?.wins ?? match.stats?.wins ?? player.wins) as number,
    goals: (match.playerStats?.goals ?? match.stats?.goals ?? player.goals) as number,
    assists: (match.playerStats?.assists ?? match.stats?.assists ?? player.assists) as number,
    cleanSheets: (match.playerStats?.cleanSheets ?? match.stats?.cleanSheets ?? player.cleanSheets) as number,
    level: (match.playerStats?.level ?? match.stats?.level ?? player.level) as number,
    xp: (match.playerStats?.xp ?? match.stats?.xp ?? player.xp) as number,
    careerIndex: (match.playerStats?.careerIndex ?? match.stats?.careerIndex ?? player.careerIndex) as number,
  };

  let newly: NewUnlockResult[] = [];
  try {
    newly = await checkAchievementsAfterMatchV2({
      profile: player as PlayerProfile,
      lifetimeAfterMatch,
    });
  } catch {
    newly = [];
  }

  return newly.map((n) => ({
    achievementId: n.key,
    key: n.key,
    name: n.name,
    tier: n.tier,
    icon: n.icon,
  }));
}

export { buildAggregatorContext, calcStreaks };
export type { AggregatorContext, NewUnlockResult };
