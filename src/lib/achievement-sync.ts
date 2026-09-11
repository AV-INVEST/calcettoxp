import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";
import {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_CATALOG_KEY_SET,
  type AchievementCatalogEntry,
} from "./achievement-catalog";

export function catalogToAchievementData(entry: AchievementCatalogEntry) {
  return {
    name: entry.name,
    description: entry.description,
    category: entry.category,
    requirementType: mapKindToRequirementType(entry.requirement.kind),
    requirementValue: entry.requirement.target,
    requirementMeta: {
      kind: entry.requirement.kind,
      target: entry.requirement.target,
      rolePaths: entry.requirement.rolePaths ?? null,
    } as Prisma.InputJsonValue,
    tier: entry.tier,
    isActive: true,
  } as const;
}

function mapKindToRequirementType(
  kind: AchievementCatalogEntry["requirement"]["kind"]
): "COUNT" | "VALUE_CAREER_INDEX" | "VALUE_LEVEL" | "STREAK" {
  switch (kind) {
    case "LIFETIME_CI":
      return "VALUE_CAREER_INDEX";
    case "LIFETIME_LEVEL":
      return "VALUE_LEVEL";
    case "STREAK_UNBEATEN":
    case "STREAK_WIN":
      return "STREAK";
    case "LIFETIME_MATCHES":
    case "LIFETIME_WINS":
    case "LIFETIME_XP":
    case "SHARE_VALID_DAYS":
    case "REFERRAL_CONFIRMED":
    case "SEASONS_DISTINCT":
    case "FIRST_CONTRIBUTION":
    case "ROLE_AGGREGATE":
    default:
      return "COUNT";
  }
}

export type SyncReport = {
  upserted: number;
  skippedExisting: number;
  excludedLegacy: number;
  totalCatalog: number;
  errors: Array<{ key: string; message: string }>;
};

export async function syncAchievementsFromCatalog(
  opts: {
    log?: (msg: string) => void;
  } = {}
): Promise<SyncReport> {
  const report: SyncReport = {
    upserted: 0,
    skippedExisting: 0,
    excludedLegacy: 0,
    totalCatalog: ACHIEVEMENT_CATALOG.length,
    errors: [],
  };

  const existing = await prisma.achievement.findMany({
    select: { key: true, isActive: true },
  });
  const existingSet = new Map(existing.map((r) => [r.key, r]));

  for (const entry of ACHIEVEMENT_CATALOG) {
    try {
      const data = catalogToAchievementData(entry);
      const prev = existingSet.get(entry.key);

      if (prev) {
        await prisma.achievement.update({
          where: { key: entry.key },
          data,
        });
        report.skippedExisting++;
      } else {
        await prisma.achievement.create({
          data: { key: entry.key, ...data },
        });
        report.upserted++;
      }
      opts.log?.(`[sync] ${entry.key} (${entry.tier})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      report.errors.push({ key: entry.key, message: msg });
      opts.log?.(`[sync] ERRORE ${entry.key}: ${msg}`);
    }
  }

  for (const row of existing) {
    if (!ACHIEVEMENT_CATALOG_KEY_SET.has(row.key) && row.isActive) {
      try {
        await prisma.achievement.update({
          where: { key: row.key },
          data: { isActive: false },
        });
        report.excludedLegacy++;
        opts.log?.(`[sync] legacy escluso: ${row.key}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        report.errors.push({ key: row.key, message: msg });
      }
    } else if (!ACHIEVEMENT_CATALOG_KEY_SET.has(row.key)) {
      report.excludedLegacy++;
    }
  }

  return report;
}
