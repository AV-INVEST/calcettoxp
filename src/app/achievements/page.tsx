import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { hasActivePro } from "@/lib/entitlements";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  Trophy,
  Target,
  Crown,
  Lock,
  Check,
  Flame,
  Award,
  ShieldCheck,
  TrendingUp,
  Star,
  Zap,
  Medal,
  Goal,
  Footprints,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AchievementRequirementType } from "@prisma/client";

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  FIRST_MATCH: Zap,
  FIRST_WIN: Trophy,
  FIRST_GOAL: Target,
  HAT_TRICK: Target,
  FIVE_GOALS: Target,
  MATCHES_10: Footprints,
  MATCHES_50: Footprints,
  MATCHES_100: Footprints,
  GOALS_10: Target,
  GOALS_50: Target,
  GOALS_100: Target,
  CAREER_INDEX_1200: TrendingUp,
  CAREER_INDEX_1500: TrendingUp,
  LEVEL_10: Star,
  LEVEL_25: Star,
  LEVEL_50: Star,
  UNBEATEN_5: ShieldCheck,
  UNBEATEN_10: ShieldCheck,
  ON_FIRE: Flame,
  TEN_WINS: Trophy,
  FIFTY_WINS: Trophy,
};

function getIcon(key: string) {
  const Icon = ACHIEVEMENT_ICONS[key] ?? Award;
  return Icon;
}

function calculateProgress(
  key: string,
  requirementType: AchievementRequirementType,
  requirementValue: number,
  player: {
    matchesPlayed: number;
    wins: number;
    goals: number;
    careerIndex: number;
    level: number;
  }
): { current: number; target: number } | null {
  switch (requirementType) {
    case "COUNT":
      if (key.startsWith("MATCHES_")) {
        return { current: player.matchesPlayed, target: requirementValue };
      }
      if (key.startsWith("GOALS_")) {
        return { current: player.goals, target: requirementValue };
      }
      if (key === "TEN_WINS" || key === "FIFTY_WINS" || key === "FIRST_WIN") {
        return { current: player.wins, target: requirementValue };
      }
      if (key === "FIRST_MATCH") {
        return { current: Math.min(player.matchesPlayed, 1), target: 1 };
      }
      if (key === "FIRST_GOAL") {
        return { current: Math.min(player.goals, 1), target: 1 };
      }
      if (key === "HAT_TRICK") {
        return { current: 0, target: requirementValue };
      }
      if (key === "FIVE_GOALS") {
        return { current: 0, target: requirementValue };
      }
      if (key === "UNBEATEN_5" || key === "UNBEATEN_10") {
        return { current: 0, target: requirementValue };
      }
      if (key === "ON_FIRE") {
        return { current: 0, target: requirementValue };
      }
      return null;
    case "VALUE_CAREER_INDEX":
      return {
        current: Math.min(player.careerIndex, requirementValue),
        target: requirementValue,
      };
    case "VALUE_LEVEL":
      return {
        current: Math.min(player.level, requirementValue),
        target: requirementValue,
      };
    case "STREAK":
      return { current: 0, target: requirementValue };
    default:
      return null;
  }
}

export const metadata: Metadata = {
  title: "Achievement | CalcettoXP",
  description: "Tutti gli achievement CalcettoXP: obiettivi sbloccati, prossimi obiettivi e badge esclusivi PRO.",
  robots: { index: false, follow: false },
};

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.userId) redirect("/signin");

  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.user.userId },
  });
  if (!player) redirect("/onboarding");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.userId },
  });
  const isPro = hasActivePro(subscription);

  const allAchievements = await prisma.achievement.findMany({
    include: {
      playerAchievements: {
        where: { playerProfileId: player.id },
      },
    },
    orderBy: [{ tier: "asc" }, { requirementValue: "asc" }],
  });

  const unlockedCount = allAchievements.filter(
    (a) => a.playerAchievements[0]?.unlockedAt
  ).length;
  const freeTotal = allAchievements.filter((a) => a.tier === "FREE").length;
  const proTotal = allAchievements.filter((a) => a.tier === "PRO").length;
  const freeUnlocked = allAchievements.filter(
    (a) => a.tier === "FREE" && a.playerAchievements[0]?.unlockedAt
  ).length;
  const proUnlocked = allAchievements.filter(
    (a) => a.tier === "PRO" && a.playerAchievements[0]?.unlockedAt
  ).length;

  const totalProgress = allAchievements.length > 0
    ? Math.round((unlockedCount / allAchievements.length) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-bgPrimary text-textPrimary pb-28">
      <div className="max-w-7xl mx-auto px-5 py-6 md:py-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Medal size={22} className="text-greenElectric" />
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Achievement</h1>
          </div>
          <p className="text-textMuted mt-1">
            Tutti i traguardi da sbloccare nella tua carriera.
          </p>
        </div>

        <Card className="mb-6 border-greenElectric/30">
          <CardContent className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="url(#achProg)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(totalProgress / 100) * 264} 264`}
                    />
                    <defs>
                      <linearGradient id="achProg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22C55E" />
                        <stop offset="100%" stopColor="#7CFF6B" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black tabular-nums">{totalProgress}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-black">
                    {unlockedCount} / {allAchievements.length}
                  </div>
                  <div className="text-textMuted text-sm">
                    Achievement sbloccati
                  </div>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-bgSecondary/60 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="verde" className="text-[10px]">FREE</Badge>
                  </div>
                  <div className="text-lg font-black">
                    {freeUnlocked}
                    <span className="text-textMuted font-semibold text-sm"> / {freeTotal}</span>
                  </div>
                  <div className="mt-2">
                    <Progress
                      value={freeTotal > 0 ? (freeUnlocked / freeTotal) * 100 : 0}
                    />
                  </div>
                </div>
                <div className="bg-bgSecondary/60 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="elettrico" className="text-[10px]">
                      <Crown size={8} className="mr-0.5" /> PRO
                    </Badge>
                    {!isPro && (
                      <span className="text-[10px] text-danger font-bold flex items-center gap-0.5">
                        <Lock size={8} /> LOCKED
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-black">
                    {isPro ? proUnlocked : "—"}
                    <span className="text-textMuted font-semibold text-sm">
                      {" "}
                      / {proTotal}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress
                      variant={isPro ? "verde" : "muta"}
                      value={isPro && proTotal > 0 ? (proUnlocked / proTotal) * 100 : 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {allAchievements.map((a) => {
            const pa = a.playerAchievements[0];
            const unlocked = !!pa?.unlockedAt;
            const isProTier = a.tier === "PRO";
            const lockedVisual = isProTier && !isPro;

            const progress = calculateProgress(
              a.key,
              a.requirementType,
              a.requirementValue,
              {
                matchesPlayed: player.matchesPlayed,
                wins: player.wins,
                goals: player.goals,
                careerIndex: player.careerIndex,
                level: player.level,
              }
            );

            const pct =
              progress && progress.target > 0
                ? Math.min(100, (progress.current / progress.target) * 100)
                : unlocked
                ? 100
                : 0;

            const Icon = getIcon(a.key);

            return (
              <Card
                key={a.id}
                className={`relative overflow-hidden transition-all ${
                  unlocked
                    ? "border-greenElectric/40"
                    : lockedVisual
                    ? "opacity-60"
                    : ""
                }`}
              >
                {unlocked && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-greenPrimary/20 border border-greenElectric/40 flex items-center justify-center z-10">
                    <Check size={14} className="text-greenElectric" strokeWidth={3} />
                  </div>
                )}
                {lockedVisual && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center z-10">
                    <Lock size={12} className="text-textMuted" />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`relative shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        unlocked
                          ? "bg-gradient-to-br from-greenElectric/25 to-greenPrimary/15 border border-greenElectric/35"
                          : lockedVisual
                          ? "bg-white/5 border border-white/10"
                          : "bg-bgSecondary border border-white/5"
                      }`}
                    >
                      <Icon
                        size={22}
                        className={
                          unlocked
                            ? "text-greenElectric"
                            : lockedVisual
                            ? "text-textMuted/50"
                            : "text-textMuted"
                        }
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isProTier ? (
                          <Badge variant="elettrico" className="text-[9px]">
                            <Crown size={8} className="mr-0.5" /> PRO
                          </Badge>
                        ) : (
                          <Badge variant="verde" className="text-[9px]">FREE</Badge>
                        )}
                      </div>
                      <h3
                        className={`font-black text-sm md:text-base tracking-wide ${
                          unlocked ? "" : lockedVisual ? "text-textMuted/60" : ""
                        }`}
                      >
                        {a.name}
                      </h3>
                      <p
                        className={`text-xs mt-1 leading-snug ${
                          unlocked ? "text-textMuted" : "text-textMuted/70"
                        }`}
                      >
                        {a.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5">
                    {unlocked ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-greenElectric font-semibold flex items-center gap-1">
                          <Trophy size={11} />
                          Sbloccato
                        </span>
                        {pa?.unlockedAt && (
                          <span className="text-[10px] text-textMuted">
                            {new Date(pa.unlockedAt).toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    ) : lockedVisual ? (
                      <div className="flex items-center gap-2 text-[11px] text-danger font-semibold">
                        <Lock size={11} />
                        <span>Abbonamento PRO richiesto</span>
                      </div>
                    ) : progress ? (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] text-textMuted font-medium">
                            Progresso
                          </span>
                          <span className="text-[11px] font-bold tabular-nums">
                            {progress.current} / {progress.target}
                          </span>
                        </div>
                        <Progress value={pct} />
                      </div>
                    ) : (
                      <div className="text-[11px] text-textMuted">
                        Richiede azione specifica in partita
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <MobileBottomNav />
    </main>
  );
}
