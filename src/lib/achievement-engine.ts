import { prisma } from "./prisma";
import {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_CATALOG_KEY_SET,
  countCatalogByTier,
  type AchievementCatalogEntry,
  type RoleAggregatePath,
} from "./achievement-catalog";
import { syncAchievementsFromCatalog } from "./achievement-sync";
import type { Prisma, PlayerProfile, Role } from "@prisma/client";

export type AggregatorContext = {
  profileId: string;
  isPro: boolean;
  lifetime: {
    matchesPlayed: number;
    wins: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    level: number;
    xp: number;
    careerIndex: number;
  };
  streaks: {
    winStreak: number;
    unbeatenStreak: number;
  };
  role: {
    primary: Role | null;
    roleMetrics: {
      ATT_GOALS: number;
      CEN_ASSISTS: number;
      DIF_MATCHES_LE1_AGAINST: number;
      POR_CLEAN_SHEETS: number;
    };
  };
  social: {
    validShareDays: number;
    confirmedReferrals: number;
  };
  seasons: {
    distinctSeasonsPlayed: number;
  };
  firstContributionMade: boolean;
};

export type EntryProgress = {
  key: string;
  tier: "FREE" | "PRO";
  category: AchievementCatalogEntry["category"];
  target: number;
  current: number;
  percentage: number;
  completed: boolean;
  unlockedAt: Date | null;
  /** true if requirement is met; for PRO trophies while user is FREE this stays true, but not unlocked */
  requirementMet: boolean;
  /** true when requirementMet AND (tier==FREE OR isPro) AND unlockedAt */
  isUnlocked: boolean;
  bestRolePath?: RoleAggregatePath & { current: number; label: string };
};

const STREAK_MAX_NEEDED = 22;

export function calcStreaks(matches: Array<{ result: string }>): {
  winStreak: number;
  unbeatenStreak: number;
} {
  let win = 0;
  for (const m of matches) {
    const r = String(m.result);
    if (r === "WIN") {
      win++;
      continue;
    }
    break;
  }
  let unbeaten = 0;
  for (const m of matches) {
    const r = String(m.result);
    if (r === "WIN" || r === "DRAW") {
      unbeaten++;
      continue;
    }
    break;
  }
  return { winStreak: win, unbeatenStreak: unbeaten };
}

export async function buildAggregatorContext(
  profileId: string,
  overrides?: Partial<AggregatorContext["lifetime"]> & {
    primaryRole?: Role | null;
    profile?: PlayerProfile | null;
  }
): Promise<AggregatorContext> {
  const profile =
    overrides?.profile ??
    (await prisma.playerProfile.findUnique({
      where: { id: profileId },
    }));

  if (!profile) {
    throw new Error("Profile not found: " + profileId);
  }

  const isPro = await checkIsProByUserId(profile.userId);
  const lifetime = {
    matchesPlayed: overrides?.matchesPlayed ?? profile.matchesPlayed,
    wins: overrides?.wins ?? profile.wins,
    goals: overrides?.goals ?? profile.goals,
    assists: overrides?.assists ?? profile.assists,
    cleanSheets: overrides?.cleanSheets ?? profile.cleanSheets,
    level: overrides?.level ?? profile.level,
    xp: overrides?.xp ?? profile.xp,
    careerIndex: overrides?.careerIndex ?? profile.careerIndex,
  };

  const primaryRole = overrides?.primaryRole ?? profile.primaryRole ?? null;

  const recent = await prisma.match.findMany({
    where: { playerId: profileId },
    orderBy: { playedAt: "desc" },
    take: STREAK_MAX_NEEDED,
    select: { result: true, playedAt: true },
  });
  const streaks = calcStreaks(recent as Array<{ result: string }>);

  const roleMetrics = await calcRoleMetrics(profileId);

  const validShareDays = await prisma.shareRecord
    .findMany({ where: { playerProfileId: profileId }, select: { dayKey: true }, distinct: ["dayKey"] })
    .then((rows) => rows.length);

  const confirmedReferrals = await prisma.referral.count({
    where: { referrerId: profileId, status: "CONFIRMED" },
  });

  const distinctSeasonsPlayed = await prisma.match
    .findMany({
      where: { playerId: profileId, seasonKey: { not: null } },
      select: { seasonKey: true },
      distinct: ["seasonKey"],
    })
    .then((r) => r.length);

  const firstContributionMade =
    lifetime.goals >= 1 ||
    lifetime.assists >= 1 ||
    lifetime.cleanSheets >= 1 ||
    (profile as unknown as { penaltiesSaved?: number })?.penaltiesSaved
      ? (profile as unknown as { penaltiesSaved?: number }).penaltiesSaved! >= 1
      : false;

  return {
    profileId,
    isPro,
    lifetime,
    streaks,
    role: { primary: primaryRole, roleMetrics },
    social: { validShareDays, confirmedReferrals },
    seasons: { distinctSeasonsPlayed },
    firstContributionMade,
  };
}

async function checkIsProByUserId(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      subscriptionStatus: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] },
    },
    select: { id: true },
  });
  return !!sub;
}

export async function calcRoleMetrics(profileId: string): Promise<
  AggregatorContext["role"]["roleMetrics"]
> {
  const out = {
    ATT_GOALS: 0,
    CEN_ASSISTS: 0,
    DIF_MATCHES_LE1_AGAINST: 0,
    POR_CLEAN_SHEETS: 0,
  };

  const matches = await prisma.match.findMany({
    where: { playerId: profileId },
    select: {
      role: true,
      goals: true,
      assists: true,
      goalsAgainst: true,
      result: true,
    },
  });

  for (const m of matches) {
    const role = (m.role ?? "") as string;
    if (role === "ATT") {
      out.ATT_GOALS += Number(m.goals ?? 0);
    }
    if (role === "CEN") {
      out.CEN_ASSISTS += Number(m.assists ?? 0);
    }
    if (role === "DIF") {
      const ga = Number(m.goalsAgainst ?? 0);
      if (ga <= 1) out.DIF_MATCHES_LE1_AGAINST++;
    }
    if (role === "POR") {
      const ga = Number(m.goalsAgainst ?? 0);
      if (ga === 0) out.POR_CLEAN_SHEETS++;
    }
  }

  return out;
}

export function progressForEntry(
  entry: AchievementCatalogEntry,
  ctx: AggregatorContext
): Omit<EntryProgress, "unlockedAt" | "isUnlocked"> {
  let current = 0;
  const req = entry.requirement;
  switch (req.kind) {
    case "LIFETIME_MATCHES":
      current = ctx.lifetime.matchesPlayed;
      break;
    case "LIFETIME_WINS":
      current = ctx.lifetime.wins;
      break;
    case "LIFETIME_LEVEL":
      current = ctx.lifetime.level;
      break;
    case "LIFETIME_CI":
      current = ctx.lifetime.careerIndex;
      break;
    case "LIFETIME_XP":
      current = ctx.lifetime.xp;
      break;
    case "STREAK_UNBEATEN":
      current = ctx.streaks.unbeatenStreak;
      break;
    case "STREAK_WIN":
      current = ctx.streaks.winStreak;
      break;
    case "SHARE_VALID_DAYS":
      current = ctx.social.validShareDays;
      break;
    case "REFERRAL_CONFIRMED":
      current = ctx.social.confirmedReferrals;
      break;
    case "SEASONS_DISTINCT":
      current = ctx.seasons.distinctSeasonsPlayed;
      break;
    case "FIRST_CONTRIBUTION":
      current = ctx.firstContributionMade ? 1 : 0;
      break;
    case "ROLE_AGGREGATE": {
      current = 0;
      break;
    }
  }

  let bestPath: (EntryProgress["bestRolePath"]) | undefined;
  let completed = false;

  if (req.kind === "ROLE_AGGREGATE" && req.rolePaths) {
    const primary = (ctx.role.primary ?? "ATT") as Role;
    const ranked = [...req.rolePaths].sort((a, b) => {
      const ap = priorityForRole(a.role, primary);
      const bp = priorityForRole(b.role, primary);
      return ap - bp;
    });
    let bestScore = -Infinity;
    for (const p of ranked) {
      const cur = metricForPath(p, ctx.role.roleMetrics);
      const pct = cur / Math.max(1, p.target);
      if (pct > bestScore) {
        bestScore = pct;
        const label = labelForPath(p);
        bestPath = { ...p, current: cur, label };
      }
      if (cur >= p.target) {
        completed = true;
      }
    }
    current = bestPath?.current ?? 0;
    if (bestPath) {
      const target = req.target === 1 ? bestPath.target : req.target;
      return {
        key: entry.key,
        tier: entry.tier,
        category: entry.category,
        target,
        current,
        percentage: clampPercent(current / target),
        completed,
        requirementMet: completed,
        bestRolePath: bestPath,
      };
    }
  }

  const target = req.target;
  completed = current >= target;
  return {
    key: entry.key,
    tier: entry.tier,
    category: entry.category,
    target,
    current,
    percentage: clampPercent(current / target),
    completed,
    requirementMet: completed,
    bestRolePath: bestPath,
  };
}

function metricForPath(
  path: RoleAggregatePath,
  metrics: AggregatorContext["role"]["roleMetrics"]
): number {
  switch (path.metric) {
    case "ATT_GOALS":
      return metrics.ATT_GOALS;
    case "CEN_ASSISTS":
      return metrics.CEN_ASSISTS;
    case "DIF_MATCHES_LE1_AGAINST":
      return metrics.DIF_MATCHES_LE1_AGAINST;
    case "POR_CLEAN_SHEETS":
      return metrics.POR_CLEAN_SHEETS;
  }
}

function priorityForRole(pathRole: string, primary: Role | string): number {
  return pathRole === primary ? 0 : 1;
}

function labelForPath(p: RoleAggregatePath): string {
  switch (p.metric) {
    case "ATT_GOALS":
      return `gol da ${roleShort(p.role)}`;
    case "CEN_ASSISTS":
      return `assist da ${roleShort(p.role)}`;
    case "DIF_MATCHES_LE1_AGAINST":
      return `partite ≤1 subito da ${roleShort(p.role)}`;
    case "POR_CLEAN_SHEETS":
      return `clean sheet da ${roleShort(p.role)}`;
  }
}

function roleShort(r: string): string {
  return r;
}

function clampPercent(n: number): number {
  if (!isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export async function evaluateAchievementProgress(
  profileId: string,
  opts?: {
    context?: AggregatorContext;
    skipSync?: boolean;
  }
): Promise<{
  all: EntryProgress[];
  summary: {
    total: number;
    free: number;
    pro: number;
    unlockedFree: number;
    unlockedPro: number;
    completedButLockedPro: number;
    percentage: number;
  };
  nextClosest: EntryProgress | null;
  lastUnlocked: EntryProgress | null;
}> {
  if (!opts?.skipSync) {
    await syncAchievementsFromCatalog();
  }
  const ctx = opts?.context ?? (await buildAggregatorContext(profileId));

  const unlockedRows = await prisma.playerAchievement.findMany({
    where: { playerProfileId: profileId },
    select: { unlockedAt: true, achievementId: true, achievement: { select: { key: true } } },
  });
  const unlockedMap = new Map<string, Date | null>();
  for (const r of unlockedRows) {
    const k = r.achievement?.key;
    if (k) unlockedMap.set(k, r.unlockedAt);
  }

  const counts = countCatalogByTier();
  let unlockedFree = 0;
  let unlockedPro = 0;
  let completedButLockedPro = 0;
  const all: EntryProgress[] = [];
  for (const entry of ACHIEVEMENT_CATALOG) {
    const partial = progressForEntry(entry, ctx);
    const unlockedAt = unlockedMap.get(entry.key) ?? null;
    const isUnlocked = !!unlockedAt && (entry.tier === "FREE" || ctx.isPro);
    if (isUnlocked) {
      if (entry.tier === "FREE") unlockedFree++;
      else unlockedPro++;
    } else if (entry.tier === "PRO" && partial.requirementMet) {
      completedButLockedPro++;
    }
    all.push({ ...partial, unlockedAt, isUnlocked });
  }
  const totalUnlocked = unlockedFree + unlockedPro;

  const notUnlocked = all
    .filter((e) => !e.isUnlocked)
    .sort((a, b) => {
      const pa = a.requirementMet ? 1 : 0;
      const pb = b.requirementMet ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return b.percentage - a.percentage;
    });
  const nextClosest = notUnlocked[0] ?? null;

  const unlockedSorted = [...all]
    .filter((e) => e.isUnlocked && e.unlockedAt)
    .sort((a, b) => (b.unlockedAt!.getTime() - a.unlockedAt!.getTime()));
  const lastUnlocked = unlockedSorted[0] ?? null;

  const summary = {
    total: counts.total,
    free: counts.free,
    pro: counts.pro,
    unlockedFree,
    unlockedPro,
    completedButLockedPro,
    percentage: totalUnlocked / counts.total,
  };

  return { all, summary, nextClosest, lastUnlocked };
}

export type NewUnlockResult = {
  key: string;
  name: string;
  tier: "FREE" | "PRO";
  icon: string;
};

export async function persistUnlocksForProfile(
  profileId: string,
  ctx: AggregatorContext
): Promise<NewUnlockResult[]> {
  const unlockedRows = await prisma.playerAchievement.findMany({
    where: { playerProfileId: profileId },
    select: { achievement: { select: { key: true } } },
  });
  const set = new Set<string>();
  for (const r of unlockedRows) {
    const k = r.achievement?.key;
    if (k) set.add(k);
  }

  const newly: NewUnlockResult[] = [];
  const now = new Date();
  for (const entry of ACHIEVEMENT_CATALOG) {
    if (set.has(entry.key)) continue;
    const p = progressForEntry(entry, ctx);
    if (!p.requirementMet) continue;
    if (entry.tier === "PRO" && !ctx.isPro) continue;
    try {
      const ach = await prisma.achievement.upsert({
        where: { key: entry.key },
        create: {
          key: entry.key,
          name: entry.name,
          description: entry.description,
          icon: entry.icon,
          category: entry.category,
          requirementType: "COUNT",
          requirementValue: entry.requirement.target,
          requirementMeta: {
            kind: entry.requirement.kind,
            target: entry.requirement.target,
            rolePaths: entry.requirement.rolePaths ?? null,
          } as Prisma.InputJsonValue,
          tier: entry.tier,
          isActive: true,
        },
        update: {
          name: entry.name,
          description: entry.description,
          icon: entry.icon,
          category: entry.category,
          requirementType: "COUNT",
          requirementValue: entry.requirement.target,
          requirementMeta: {
            kind: entry.requirement.kind,
            target: entry.requirement.target,
            rolePaths: entry.requirement.rolePaths ?? null,
          } as Prisma.InputJsonValue,
          tier: entry.tier,
          isActive: true,
        },
        select: { id: true, key: true },
      });
      await prisma.playerAchievement.create({
        data: {
          playerProfileId: profileId,
          achievementId: ach.id,
          unlockedAt: now,
        },
      });
      newly.push({ key: entry.key, name: entry.name, tier: entry.tier, icon: entry.icon });
      set.add(entry.key);
    } catch {
      // ignore single errors
    }
  }
  return newly;
}

export type ReconcileReport = {
  profileId: string;
  dryRun: boolean;
  newlyUnlocked: NewUnlockResult[];
  completedButLockedPro: Array<{ key: string; name: string }>;
  suspiciousUnlocked: Array<{
    key: string;
    unlockedAt: Date;
    reason: string;
  }>;
  totalUnlockedBefore: number;
  totalUnlockedAfter: number;
};

export async function reconcileAchievementsForProfile(
  profileId: string,
  opts?: { dryRun?: boolean; context?: AggregatorContext }
): Promise<ReconcileReport> {
  const dryRun = opts?.dryRun === true;
  const ctx = opts?.context ?? (await buildAggregatorContext(profileId));

  const unlockedRows = await prisma.playerAchievement.findMany({
    where: { playerProfileId: profileId },
    select: {
      unlockedAt: true,
      achievement: { select: { key: true, tier: true } },
    },
  });
  const unlockedMap = new Map<string, Date>();
  for (const r of unlockedRows) {
    const k = r.achievement?.key;
    if (k && r.unlockedAt) unlockedMap.set(k, r.unlockedAt);
  }
  const totalUnlockedBefore = unlockedMap.size;

  const newlyUnlocked: NewUnlockResult[] = [];
  const completedButLockedPro: Array<{ key: string; name: string }> = [];
  const suspiciousUnlocked: ReconcileReport["suspiciousUnlocked"] = [];

  const catalogEntriesByKey = new Map(ACHIEVEMENT_CATALOG.map((e) => [e.key, e]));

  for (const [key, unlockedAt] of unlockedMap) {
    const entry = catalogEntriesByKey.get(key);
    if (!entry) continue;
    const partial = progressForEntry(entry, ctx);
    if (entry.tier === "FREE") {
      if (!partial.requirementMet) {
        suspiciousUnlocked.push({
          key,
          unlockedAt,
          reason: "FREE achievement unlocked ma requirementMet=false",
        });
      }
    } else {
      if (!ctx.isPro || !partial.requirementMet) {
        suspiciousUnlocked.push({
          key,
          unlockedAt,
          reason:
            "PRO achievement unlocked ma isPro=" +
            ctx.isPro +
            " o requirementMet=" +
            partial.requirementMet,
        });
      }
    }
  }

  const now = new Date();
  for (const entry of ACHIEVEMENT_CATALOG) {
    if (unlockedMap.has(entry.key)) continue;
    const p = progressForEntry(entry, ctx);
    if (!p.requirementMet) {
      continue;
    }
    if (entry.tier === "PRO" && !ctx.isPro) {
      completedButLockedPro.push({ key: entry.key, name: entry.name });
      continue;
    }
    newlyUnlocked.push({
      key: entry.key,
      name: entry.name,
      tier: entry.tier,
      icon: entry.icon,
    });
    if (!dryRun) {
      try {
        const ach = await prisma.achievement.upsert({
          where: { key: entry.key },
          create: {
            key: entry.key,
            name: entry.name,
            description: entry.description,
            icon: entry.icon,
            category: entry.category,
            requirementType: "COUNT",
            requirementValue: entry.requirement.target,
            requirementMeta: {
              kind: entry.requirement.kind,
              target: entry.requirement.target,
              rolePaths: entry.requirement.rolePaths ?? null,
            } as Prisma.InputJsonValue,
            tier: entry.tier,
            isActive: true,
          },
          update: {
            name: entry.name,
            description: entry.description,
            icon: entry.icon,
            category: entry.category,
            requirementType: "COUNT",
            requirementValue: entry.requirement.target,
            requirementMeta: {
              kind: entry.requirement.kind,
              target: entry.requirement.target,
              rolePaths: entry.requirement.rolePaths ?? null,
            } as Prisma.InputJsonValue,
            tier: entry.tier,
            isActive: true,
          },
          select: { id: true, key: true },
        });
        await prisma.playerAchievement.create({
          data: {
            playerProfileId: profileId,
            achievementId: ach.id,
            unlockedAt: now,
          },
        });
      } catch {
        // ignore single errors
      }
    }
  }

  return {
    profileId,
    dryRun,
    newlyUnlocked,
    completedButLockedPro,
    suspiciousUnlocked,
    totalUnlockedBefore,
    totalUnlockedAfter: totalUnlockedBefore + newlyUnlocked.length,
  };
}

export async function reconcileProUnlocks(
  profileId: string
): Promise<NewUnlockResult[]> {
  const ctx = await buildAggregatorContext(profileId);
  if (!ctx.isPro) return [];
  const rep = await reconcileAchievementsForProfile(profileId, { context: ctx });
  return rep.newlyUnlocked;
}

export async function checkAchievementsAfterMatchV2(
  args: {
    profile: PlayerProfile;
    lifetimeAfterMatch: AggregatorContext["lifetime"];
  }
): Promise<NewUnlockResult[]> {
  const ctx = await buildAggregatorContext(args.profile.id, {
    ...args.lifetimeAfterMatch,
    profile: args.profile,
    primaryRole: args.profile.primaryRole ?? null,
  });
  const rep = await reconcileAchievementsForProfile(args.profile.id, {
    context: ctx,
  });
  return rep.newlyUnlocked;
}
