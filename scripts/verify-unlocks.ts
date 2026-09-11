import { prisma } from "@/lib/prisma";

async function main() {
  const pa = await prisma.playerAchievement.findMany({
    select: {
      unlockedAt: true,
      achievementId: true,
      playerProfileId: true,
    },
    orderBy: [{ playerProfileId: "asc" }, { unlockedAt: "asc" }],
  });
  const achievements = await prisma.achievement.findMany({
    select: { id: true, key: true, tier: true, name: true },
  });
  const profiles = await prisma.playerProfile.findMany({
    select: { id: true, username: true },
  });
  const achMap = new Map(achievements.map((a) => [a.id, a]));
  const profMap = new Map(profiles.map((p) => [p.id, p]));

  console.log("PlayerAchievement count:", pa.length);
  for (const r of pa) {
    const ach = achMap.get(r.achievementId);
    const prof = profMap.get(r.playerProfileId);
    console.log(
      `  [${prof?.username ?? "?"}] ${ach?.tier ?? "?"} · ${ach?.key ?? "?"} (${ach?.name ?? "?"}) — unlockedAt=${r.unlockedAt?.toISOString()}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
