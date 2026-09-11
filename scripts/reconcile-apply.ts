import { prisma } from "@/lib/prisma";
import {
  buildAggregatorContext,
  reconcileAchievementsForProfile,
  type ReconcileReport,
} from "@/lib/achievement-engine";

async function main() {
  console.log("=== RECONCILE APPLY (dryRun=false, ONLY SAFE CREATE) ===");
  console.log("START:", new Date().toISOString());
  console.log("");

  const profiles = await prisma.playerProfile.findMany({
    select: { id: true, username: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Trovati ${profiles.length} profili.`);
  const reports: ReconcileReport[] = [];

  for (const p of profiles) {
    const username = p.username ?? "?";
    console.log(`\n--- Reconciling: ${username} (${p.id}) ---`);
    const ctx = await buildAggregatorContext(p.id);
    const report = await reconcileAchievementsForProfile(p.id, {
      dryRun: false,
      context: ctx,
    });
    reports.push(report);
    console.log(
      `  newlyUnlocked (${report.newlyUnlocked.length}):`,
      report.newlyUnlocked.join(", ") || "[]"
    );
    if (report.completedButLockedPro.length > 0) {
      console.log(
        `  completedButLockedPro (${report.completedButLockedPro.length}):`,
        report.completedButLockedPro.join(", ")
      );
    }
    if (report.suspiciousUnlocked.length > 0) {
      console.warn(
        `  ⚠️  suspiciousUnlocked (${report.suspiciousUnlocked.length}):`,
        report.suspiciousUnlocked.map((s) => s.key).join(", ")
      );
    }
    console.log(
      `  total unlocked: before=${report.totalUnlockedBefore} → after=${report.totalUnlockedAfter}`
    );
  }

  console.log("\n=== SUMMARY ===");
  const totalNew = reports.reduce((a, r) => a + r.newlyUnlocked.length, 0);
  const totalSusp = reports.reduce((a, r) => a + r.suspiciousUnlocked.length, 0);
  const totalComp = reports.reduce((a, r) => a + r.completedButLockedPro.length, 0);
  console.log(`profili: ${profiles.length}`);
  console.log(`nuovi unlock creati: ${totalNew}`);
  console.log(`completed-but-locked PRO (non scritti): ${totalComp}`);
  console.log(`suspicious (non cancellati, solo segnalati): ${totalSusp}`);
  console.log(`\nNessun delete / truncate / drop eseguito.`);
  console.log("END:", new Date().toISOString());
}

main()
  .catch((e) => {
    console.error("FATAL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
