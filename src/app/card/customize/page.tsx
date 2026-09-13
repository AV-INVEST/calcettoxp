import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasActivePro } from "@/lib/entitlements";
import { calculateCardAttributes, type PlayerSummary } from "@/lib/card-attributes";
import { CardCustomizeClient } from "./CardCustomizeClient";
import type { CardTheme } from "@/lib/username-config";

type Role = "POR" | "DIF" | "CEN" | "ATT";

export const metadata: Metadata = {
  title: "Personalizza la tua Card | CalcettoXP",
  description:
    "Personalizza l'aspetto della tua Player Card CalcettoXP con temi esclusivi.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CardCustomizePage() {
  const session = await auth();
  if (!session?.user?.userId) {
    redirect("/signin");
  }

  const userId = session.user.userId;

  const playerProfile = await prisma.playerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!playerProfile) {
    redirect("/onboarding");
  }

  const subscription = playerProfile.user.subscription ?? null;
  const isPro = hasActivePro(subscription);

  const cardTheme = (playerProfile.cardTheme as CardTheme) ?? "CLASSIC";
  const allowedThemes: readonly CardTheme[] = ["CLASSIC", "NIGHT", "ELITE", "NEON"];
  const freeThemes: readonly CardTheme[] = ["CLASSIC"];
  const effectiveCardTheme: CardTheme =
    allowedThemes.includes(cardTheme) &&
    (freeThemes.includes(cardTheme) || isPro)
      ? cardTheme
      : "CLASSIC";

  const recentMatchesForAttributes = await prisma.match.findMany({
    where: { playerId: playerProfile.id },
    orderBy: { playedAt: "desc" },
    take: 10,
    select: {
      careerIndexChange: true,
      result: true,
      goals: true,
      assists: true,
      playedAt: true,
    },
  });

  const lastCiChangeEntry = await prisma.careerIndexHistory.findFirst({
    where: { playerProfileId: playerProfile.id },
    orderBy: { createdAt: "desc" },
    select: { changeValue: true },
  });

  const summary: PlayerSummary = {
    matchesPlayed: playerProfile.matchesPlayed,
    wins: playerProfile.wins,
    losses: playerProfile.losses,
    draws: playerProfile.draws,
    goals: playerProfile.goals,
    assists: playerProfile.assists,
    level: playerProfile.level,
    xp: playerProfile.xp,
    careerIndex: playerProfile.careerIndex,
    role: playerProfile.primaryRole,
    recentMatches: recentMatchesForAttributes.map((m) => ({
      careerIndexChange: m.careerIndexChange,
      result: m.result,
      goals: m.goals,
      assists: m.assists,
      playedAt: m.playedAt,
    })),
  };

  const attributes = calculateCardAttributes(summary);

  return (
    <div className="min-h-screen w-full bg-bgPrimary">
      <CardCustomizeClient
        nickname={playerProfile.nickname}
        role={playerProfile.primaryRole as Role}
        overall={playerProfile.overall}
        level={playerProfile.level}
        careerIndex={playerProfile.careerIndex}
        careerIndexChange={lastCiChangeEntry?.changeValue ?? undefined}
        attributes={attributes}
        avatarImage={session.user?.image ?? null}
        isPro={isPro}
        savedCardTheme={effectiveCardTheme}
      />
    </div>
  );
}
