import { prisma } from "@/lib/prisma";
import { reconcileAchievementsForProfile } from "@/lib/achievement-engine";
import type { ReconcileReport } from "@/lib/achievement-engine";

type ProfileDiagnosis = {
  profileId: string;
  username?: string | null;
  matchesPlayedOnProfile: number;
  countMatchesDb: number;
  distinctSeasonsFromMatch: number;
  playerAchievementsUnlocked: number;
  profileMatchesDbDelta: number;
  dryRun?: ReconcileReport;
};

async function main() {
  console.log("=== TROPHY ENGINE DRY-RUN (READ-ONLY) ===");
  console.log("Start:", new Date().toISOString());

  const profiles = await prisma.playerProfile.findMany({
    select: {
      id: true,
      username: true,
      matchesPlayed: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\nTotal profiles: ${profiles.length}`);

  const diagnosis: ProfileDiagnosis[] = [];
  let aggNewUnlocks = 0;
  let aggSuspicious = 0;
  let aggCompletedButLockedPro = 0;

  for (const p of profiles) {
    const countMatchesDb = await prisma.match.count({ where: { playerId: p.id } });
    const seasonsRows = await prisma.match.findMany({
      where: { playerId: p.id, seasonKey: { not: null } },
      select: { seasonKey: true },
      distinct: ["seasonKey"],
    });
    const distinctSeasonsFromMatch = seasonsRows.length;

    const unlockedCount = await prisma.playerAchievement.count({
      where: { playerProfileId: p.id, unlockedAt: { not: null } },
    });

    const d: ProfileDiagnosis = {
      profileId: p.id,
      username: p.username,
      matchesPlayedOnProfile: p.matchesPlayed,
      countMatchesDb,
      distinctSeasonsFromMatch,
      playerAchievementsUnlocked: unlockedCount,
      profileMatchesDbDelta: p.matchesPlayed - countMatchesDb,
    };

    try {
      const dr = await reconcileAchievementsForProfile(p.id, { dryRun: true });
      d.dryRun = dr;
      aggNewUnlocks += dr.newlyUnlocked.length;
      aggSuspicious += dr.suspiciousUnlocked.length;
      aggCompletedButLockedPro += dr.completedButLockedPro.length;
    } catch (err) {
      console.error(`[ERROR] dry-run profile ${p.id}:`, err);
    }

    diagnosis.push(d);

    const line = [
      `id=${p.id.slice(0, 8)}..`,
      `user=${p.username ?? "-"}`,
      `profile.mp=${p.matchesPlayed}`,
      `db.match=${countMatchesDb}`,
      `Δ=${d.profileMatchesDbDelta}`,
      `seasonsFromMatch=${distinctSeasonsFromMatch}`,
      `pa.unlocked=${unlockedCount}`,
      d.dryRun
        ? `+new=${d.dryRun.newlyUnlocked.length} susp=${d.dryRun.suspiciousUnlocked.length} bl=${d.dryRun.completedButLockedPro.length}`
        : "no-dryrun",
    ].join(" | ");
    console.log(line);

    if (d.dryRun?.newlyUnlocked.length) {
      console.log(
        `    → NEW UNLOCKS: ${d.dryRun.newlyUnlocked
          .map((u) => `${u.key}(${u.tier})`)
          .join(", ")}`
      );
    }
    if (d.dryRun?.suspiciousUnlocked.length) {
      for (const s of d.dryRun.suspiciousUnlocked) {
        console.log(
          `    ⚠ SUSPICIOUS: ${s.key} @ ${s.unlockedAt.toISOString()} — ${s.reason}`
        );
      }
    }
  }

  console.log("\n=== AGGREGATE REPORT (DRY-RUN) ===");
  console.log(`Profiles scanned: ${profiles.length}`);
  console.log(`Total NEW unlocks to create: ${aggNewUnlocks}`);
  console.log(`Total SUSPICIOUS unlocked: ${aggSuspicious}`);
  console.log(`Total PRO completed-but-locked (FREE users): ${aggCompletedButLockedPro}`);

  const deltaMismatches = diagnosis.filter((d) => d.profileMatchesDbDelta !== 0);
  console.log(
    `Profile.matchesPlayed vs COUNT(Match) mismatches: ${deltaMismatches.length}`
  );
  for (const d of deltaMismatches) {
    console.log(
      `  Δ=${d.profileMatchesDbDelta} profile.mp=${d.matchesPlayedOnProfile} db.match=${d.countMatchesDb} user=${d.username ?? d.profileId}`
    );
  }

  const seasonMismatch = diagnosis.filter(
    (d) =>
      d.dryRun &&
      (d.distinctSeasonsFromMatch !== 1 ||
        d.dryRun.newlyUnlocked.some((n) => n.key.includes("CAPITOLO") || n.key.includes("STAGIONI") || n.key.includes("VITA")))
  );
  console.log(`\nSeason-based trophies check: ${seasonMismatch.length} profiles`);

  const fs = require("node:fs");
  const path = require("node:path");
  const outPath = path.resolve(__dirname, "..", ".trae", "specs", "trophy-v2-fix", "dry-run-report.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        profilesCount: profiles.length,
        aggregate: {
          newUnlocks: aggNewUnlocks,
          suspicious: aggSuspicious,
          completedButLockedPro: aggCompletedButLockedPro,
          mismatchesDelta: deltaMismatches.length,
        },
        profiles: diagnosis.map((d) => ({
          ...d,
          dryRun: d.dryRun
            ? {
                ...d.dryRun,
                newlyUnlocked: d.dryRun.newlyUnlocked.map((x) => x.key),
                completedButLockedPro: d.dryRun.completedButLockedPro.map((x) => x.key),
                suspiciousUnlocked: d.dryRun.suspiciousUnlocked.map((s) => ({
                  key: s.key,
                  reason: s.reason,
                  unlockedAt: s.unlockedAt,
                })),
              }
            : undefined,
        })),
      },
      null,
      2
    )
  );
  console.log(`\nJSON report saved to: ${outPath}`);
}

main()
  .then(() => {
    console.log("Done. NO WRITES PERFORMED (dry-run mode).");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
