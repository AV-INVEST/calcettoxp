import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateCardAttributes, type PlayerSummary } from "@/lib/card-attributes";
import { hasActivePro } from "@/lib/entitlements";
import { getSeasonKeyInfo } from "@/lib/seasons";
import {
  getLevelProgress,
  getStatusFromLevel,
  type PlayerStatus,
} from "@/lib/xp-levels";
import {
  computeActiveStreaks,
  countMatchesThisWeek,
  getBestCareerIndex,
  type ActiveStreaks,
} from "@/lib/retention";
import { isAchievementVisible } from "@/lib/achievements";
import PlayerCard from "@/components/player/PlayerCard";
import DashboardCardStage from "@/components/dashboard/DashboardCardStage";
import CareerIndexChart, {
  type CareerIndexDataPoint,
} from "@/components/charts/CareerIndexChart";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import NextAchievementProgress from "@/components/dashboard/NextAchievementProgress";
import CurrentSeasonCard from "@/components/dashboard/CurrentSeasonCard";
import MultiplayerComingSoonCard from "@/components/dashboard/MultiplayerComingSoonCard";
import NextGoalModule from "@/components/dashboard/NextGoalModule";
import { InstallPWAButton } from "@/components/pwa/InstallPWAButton";
import { ShareCardButton } from "@/components/share/ShareCardButton";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Minus,
  Calendar,
  Target,
  Zap,
  Award,
  ChevronRight,
  ArrowLeft,
  PlusCircle,
  Flame,
  Crown,
  BarChart3,
  History,
  Sparkles,
  Palette,
  Lock,
  Star,
  Share2,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import type { CardTheme } from "@/lib/username-config";

type Role = "POR" | "DIF" | "CEN" | "ATT";
type MatchResult = "WIN" | "DRAW" | "LOSS";

export const metadata: Metadata = {
  title: "Dashboard | CalcettoXP",
  description:
    "La tua carriera CalcettoXP: progressi, statistiche e prossimi obiettivi.",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<PlayerStatus, string> = {
  NOVIZIO: "Novizio",
  EMERGENTE: "Emergente",
  AFFERMATO: "Affermato",
  VETERANO: "Veterano",
  LEGGENDA: "Leggenda",
};

export default async function DashboardPage() {
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
  const effectiveCardTheme: CardTheme = allowedThemes.includes(cardTheme) &&
    (freeThemes.includes(cardTheme) || isPro)
      ? cardTheme
      : "CLASSIC";

  const now = new Date();

  const recentMatchesForStreaksQuery = prisma.match.findMany({
    where: { playerId: playerProfile.id },
    orderBy: { playedAt: "desc" },
    take: 50,
    select: {
      id: true,
      result: true,
      playedAt: true,
      goalsFor: true,
      goalsAgainst: true,
      role: true,
      goals: true,
      assists: true,
      careerIndexChange: true,
    },
  });

  const ciHistoryQuery = prisma.careerIndexHistory.findMany({
    where: { playerProfileId: playerProfile.id },
    orderBy: { createdAt: "asc" },
    take: isPro ? undefined : 20,
  });

  const playerAchievementsQuery = prisma.playerAchievement.findMany({
    where: { playerProfileId: playerProfile.id },
    include: { achievement: true },
    orderBy: [{ unlockedAt: "desc" }, { progress: "desc" }],
  });

  const [recentMatchesAll, ciHistory, playerAchievements] = await Promise.all([
    recentMatchesForStreaksQuery,
    ciHistoryQuery,
    playerAchievementsQuery,
  ]);

  const recentMatches = recentMatchesAll.slice(0, 5);

  const seasonKeyInfo = getSeasonKeyInfo();
  const currentSeasonKey =
    playerProfile.currentSeasonKey ?? seasonKeyInfo.seasonKey;

  let currentSeason = await prisma.playerSeason.findUnique({
    where: {
      playerProfileId_seasonKey: {
        playerProfileId: playerProfile.id,
        seasonKey: currentSeasonKey,
      },
    },
  });

  if (!currentSeason) {
    currentSeason = {
      playerProfileId: playerProfile.id,
      seasonKey: currentSeasonKey,
      name: seasonKeyInfo.name,
      startDate: seasonKeyInfo.startDate,
      endDate: seasonKeyInfo.endDate,
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals: 0,
      assists: 0,
      startCareerIndex: playerProfile.careerIndex,
      endCareerIndex: playerProfile.careerIndex,
      peakCareerIndex: playerProfile.careerIndex,
      startOverall: playerProfile.overall,
      endOverall: playerProfile.overall,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

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
    recentMatches: recentMatchesAll.slice(0, 10).map((m) => ({
      careerIndexChange: m.careerIndexChange,
      result: m.result,
      goals: m.goals,
      assists: m.assists,
      playedAt: m.playedAt,
    })),
  };

  const attributes = calculateCardAttributes(summary);

  const lastCiChange =
    ciHistory.length > 0 ? ciHistory[ciHistory.length - 1].changeValue : 0;

  const ciChartData: CareerIndexDataPoint[] = ciHistory.map((h) => ({
    date: h.createdAt,
    value: h.valueAfter,
    before: h.valueBefore,
    after: h.valueAfter,
    delta: h.changeValue,
    matchId: h.matchId ?? undefined,
  }));

  if (ciChartData.length === 0) {
    ciChartData.push({
      date: playerProfile.createdAt,
      value: playerProfile.careerIndex,
    });
  }

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recent30d = ciHistory.filter((h) => h.createdAt >= thirtyDaysAgo);
  let trend30d = 0;
  if (recent30d.length >= 2) {
    trend30d =
      recent30d[recent30d.length - 1].valueAfter - recent30d[0].valueBefore;
  } else if (ciHistory.length >= 2) {
    trend30d =
      ciHistory[ciHistory.length - 1].valueAfter - ciHistory[0].valueBefore;
  }
  const trend30dPositive = trend30d >= 0;

  const winRate =
    playerProfile.matchesPlayed > 0
      ? Math.round((playerProfile.wins / playerProfile.matchesPlayed) * 100)
      : 0;

  const inProgressAchievements = playerAchievements
    .filter((pa) => isAchievementVisible(pa.achievement))
    .filter((pa) => !pa.unlockedAt && (pa.progressTarget ?? 0) > 0)
    .map((pa) => ({
      name: pa.achievement.name,
      description: pa.achievement.description,
      progress: pa.progress,
      progressTarget: pa.progressTarget ?? 0,
      tier: pa.achievement.tier as "FREE" | "PRO",
      progressPct:
        (pa.progressTarget ?? 0) > 0
          ? Math.min(100, (pa.progress / (pa.progressTarget ?? 1)) * 100)
          : 0,
    }))
    .sort((a, b) => b.progressPct - a.progressPct);

  const nextAchievement = inProgressAchievements[0] ?? null;

  const resultStyles: Record<
    MatchResult,
    { variant: "verde" | "rosso" | "grigio"; icon: LucideIcon }
  > = {
    WIN: { variant: "verde", icon: Trophy },
    DRAW: { variant: "grigio", icon: Minus },
    LOSS: { variant: "rosso", icon: Trophy },
  };

  const levelProgress = getLevelProgress(playerProfile.xp);
  const playerStatus = getStatusFromLevel(playerProfile.level);

  const streaks: ActiveStreaks = computeActiveStreaks(recentMatchesAll);
  const matchesThisWeek = countMatchesThisWeek(recentMatchesAll, now);
  const bestCI = getBestCareerIndex(playerProfile.careerIndex, ciHistory);
  const isPersonalBest = playerProfile.careerIndex >= bestCI && playerProfile.matchesPlayed > 0;

  const activeStreakLabel =
    streaks.winStreak >= 2
      ? `${streaks.winStreak} vittorie`
      : streaks.unbeatenStreak >= 2
      ? `${streaks.unbeatenStreak} imbattuto`
      : streaks.lossStreak >= 2
      ? `${streaks.lossStreak} sconfitte`
      : "Costruisci la striscia";

  const activeStreakPositive =
    streaks.winStreak >= 2 || streaks.unbeatenStreak >= 2;

  const isMaxLevel = levelProgress.currentLevel >= 50;

  return (
    <main className="min-h-screen bg-bgPrimary text-textPrimary pb-32 md:pb-10">
      <div className="max-w-4xl mx-auto px-4 py-5 md:py-8 space-y-5 md:space-y-7">
        {/* 1) Header */}
        <header>
          <div className="flex items-start gap-3">
            <Link
              href="/"
              aria-label="Torna alla home"
              title="Home"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-bgCard text-textMuted transition-all hover:border-greenElectric/30 hover:bg-greenElectric/8 hover:text-greenElectric active:scale-[0.97] md:hidden"
            >
              <ArrowLeft className="h-[17px] w-[17px]" strokeWidth={2.2} />
            </Link>
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight truncate">
                Ciao,{" "}
                <span className="text-greenElectric">
                  {playerProfile.nickname}
                </span>
                .
              </h1>
              <small className="text-sm text-textMuted font-medium block">
                {STATUS_LABEL[playerStatus]} · Pronto per la prossima partita?
              </small>
            </div>
          </div>
        </header>

        {/* 2) MAIN PLAYER CARD protagonista */}
        <section className="flex justify-center">
          <div className="w-full max-w-md">
            <DashboardCardStage
              nickname={playerProfile.nickname}
              role={playerProfile.primaryRole as Role}
              overall={playerProfile.overall}
              level={playerProfile.level}
              careerIndex={playerProfile.careerIndex}
              careerIndexChange={lastCiChange || undefined}
              attributes={attributes}
              avatarImage={session.user?.image ?? null}
              isPro={isPro}
              effectiveCardTheme={effectiveCardTheme}
            />
          </div>
        </section>

        {/* 2.5) CONDIVIDI LA MIA CARD (mobile centratura premium, layout desktop invariato) */}
        <section className="w-full max-w-full">
          <Card className="border-white/5 bg-bgCard/60 w-full max-w-full">
            <CardContent className="px-5 py-4 md:p-5 w-full max-w-full">
              {playerProfile.isPublic ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 w-full sm:w-auto justify-center sm:justify-start min-w-0">
                    <div className="w-11 h-11 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-greenPrimary/25 to-greenElectric/15 border border-greenElectric/25 flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(124,255,107,0.12)]">
                      <Share2 size={20} className="text-greenElectric" />
                    </div>
                    <div className="min-w-0 w-full sm:w-auto text-center sm:text-left">
                      <p className="text-sm md:text-sm font-black text-textPrimary uppercase tracking-wider truncate">
                        Condividi la mia card
                      </p>
                      <p className="text-[11px] md:text-[11px] text-textMuted truncate mt-0.5">
                        Mostra la tua carriera ai tuoi amici
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-1 sm:mt-0">
                    <ShareCardButton
                      username={playerProfile.username}
                      label="CONDIVIDI"
                      variant="primary"
                      size="md"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 w-full sm:w-auto justify-center sm:justify-start min-w-0">
                    <div className="w-11 h-11 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Lock size={20} className="text-textMuted" />
                    </div>
                    <div className="min-w-0 w-full sm:w-auto text-center sm:text-left">
                      <p className="text-sm md:text-sm font-black text-textPrimary uppercase tracking-wider truncate">
                        Condividi la mia card
                      </p>
                      <p className="text-[11px] md:text-[11px] text-textMuted truncate mt-0.5">
                        Rendi pubblico il profilo per condividere la tua card
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-1 sm:mt-0">
                    <Link
                      href="/settings"
                      className="w-full sm:w-auto max-w-xs sm:max-w-none inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-black uppercase tracking-wider text-textPrimary hover:bg-white/10 hover:border-white/25 transition active:scale-[0.99]"
                    >
                      <Settings size={15} />
                      <span>Impostazioni</span>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 3) KEY METRICS: OVR · CI · Level (mobile abbreviato CI, desktop completo) */}
        <section className="w-full max-w-full">
          <Card className="overflow-hidden w-full max-w-full">
            <CardContent className="p-4 md:p-6 w-full max-w-full">
              <div className="grid grid-cols-3 gap-2 md:gap-6 w-full max-w-full">
                <div className="text-center min-w-0 flex flex-col justify-center items-center py-2 md:py-0">
                  <div className="text-[10px] md:text-[11px] font-semibold text-textMuted uppercase tracking-[0.15em] mb-1.5 md:mb-2 truncate w-full">
                    OVR
                  </div>
                  <div
                    className="text-xl sm:text-2xl md:text-5xl font-black tabular-nums whitespace-nowrap min-w-0 bg-gradient-to-b from-greenElectric via-greenPrimary to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(124,255,107,0.18)] leading-tight"
                    style={{ letterSpacing: "-0.03em" }}
                  >
                    {playerProfile.overall}
                  </div>
                </div>
                <div className="text-center border-x border-white/5 min-w-0 flex flex-col justify-center items-center py-2 md:py-0 px-1 md:px-0">
                  <div className="text-[10px] md:text-[11px] font-semibold text-textMuted uppercase tracking-[0.15em] mb-1.5 md:mb-2 truncate w-full">
                    <span className="md:hidden">CI</span>
                    <span className="hidden md:inline">Career Index</span>
                  </div>
                  <div
                    className="text-lg sm:text-xl md:text-4xl font-black tabular-nums whitespace-nowrap min-w-0 w-full leading-tight"
                    style={{ color: "#7CFF6B" }}
                  >
                    {playerProfile.careerIndex}
                  </div>
                  <div
                    className={`mt-1.5 md:mt-2 flex items-center justify-center gap-1 text-[10px] md:text-xs font-bold tabular-nums whitespace-nowrap ${
                      lastCiChange >= 0 ? "text-greenPrimary" : "text-danger"
                    }`}
                  >
                    {lastCiChange >= 0 ? (
                      <TrendingUp size={11} strokeWidth={2.5} className="md:w-[13px] md:h-[13px] shrink-0" />
                    ) : (
                      <TrendingDown size={11} strokeWidth={2.5} className="md:w-[13px] md:h-[13px] shrink-0" />
                    )}
                    <span>
                      {lastCiChange >= 0 ? "+" : ""}
                      {lastCiChange}
                    </span>
                  </div>
                </div>
                <div className="text-center min-w-0 flex flex-col justify-center items-center py-2 md:py-0">
                  <div className="text-[10px] md:text-[11px] font-semibold text-textMuted uppercase tracking-[0.15em] mb-1.5 md:mb-2 truncate w-full">
                    <span className="md:hidden">LV</span>
                    <span className="hidden md:inline">Livello</span>
                  </div>
                  <div className="text-lg sm:text-xl md:text-4xl font-black tabular-nums whitespace-nowrap min-w-0 text-textPrimary w-full leading-tight">
                    <span className="text-blue-400">
                      {levelProgress.currentLevel}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4) XP BAR CUMULATIVA + PROGRESSO LIVELLO */}
        <section>
          <Card className="border-white/10">
            <CardContent className="p-4 md:p-6 space-y-3">
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-[0.18em] mb-1">
                    {isMaxLevel ? "Massimo" : "Progresso livello"}
                  </div>
                  <div className="text-xl md:text-2xl font-black tabular-nums">
                    <span className="text-blue-400">
                      LV {levelProgress.currentLevel}
                    </span>
                    {!isMaxLevel && (
                      <span className="text-textMuted text-base md:text-lg mx-2 font-bold">
                        →
                      </span>
                    )}
                    {!isMaxLevel && (
                      <span className="text-textMuted font-bold">
                        LV {levelProgress.currentLevel + 1}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.18em] mb-1">
                    XP
                  </div>
                  <div className="text-base md:text-lg font-bold tabular-nums">
                    {levelProgress.xpInCurrentLevel.toLocaleString("it-IT")}
                    {!isMaxLevel && (
                      <>
                        <span className="text-textMuted font-semibold mx-0.5">
                          /
                        </span>
                        <span className="text-textMuted font-semibold">
                          {(
                            levelProgress.nextThreshold -
                            levelProgress.currentThreshold
                          ).toLocaleString("it-IT")}
                        </span>
                      </>
                    )}
                  </div>
                  <div
                    className={`mt-1 text-xs font-black tabular-nums ${
                      isMaxLevel
                        ? "text-yellow-400"
                        : levelProgress.progressPct >= 75
                        ? "text-greenPrimary"
                        : "text-greenElectric"
                    }`}
                  >
                    {isMaxLevel
                      ? "LIVELLO MASSIMO"
                      : `${levelProgress.progressPct.toFixed(0)}%`}
                  </div>
                </div>
              </div>

              <div className="relative h-4 md:h-5 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                  style={{ width: `${levelProgress.progressPct}%` }}
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-full mix-blend-overlay opacity-60"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.15) 100%)",
                  }}
                />
              </div>

              {!isMaxLevel ? (
                <div className="flex items-center justify-between pt-0.5">
                  <p className="text-[11px] md:text-xs text-textMuted font-semibold">
                    {levelProgress.xpToNextLevel.toLocaleString(
                      "it-IT",
                    )}{" "}
                    XP al prossimo livello
                  </p>
                  <p className="text-[11px] md:text-xs text-textMuted font-medium tabular-nums">
                    Totale: {playerProfile.xp.toLocaleString("it-IT")} XP
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-0.5">
                  <p className="text-[11px] md:text-xs font-black text-yellow-400">
                    ✦ LEGGENDA ✦ Congratulazioni, hai raggiunto il livello massimo!
                  </p>
                  <p className="text-[11px] md:text-xs text-textMuted font-medium tabular-nums">
                    {playerProfile.xp.toLocaleString("it-IT")} XP
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 5) CTA PRIMARIA ENORME: REGISTRA PARTITA */}
        <section>
          <Link
            href="/matches/new"
            className="group relative block w-full overflow-hidden rounded-2xl border-2 border-greenPrimary/60 bg-gradient-to-br from-greenPrimary via-greenElectric to-emerald-400 p-[1px] shadow-[0_0_40px_rgba(124,255,107,0.22)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(124,255,107,0.4)] active:scale-[0.995]"
          >
            <div className="flex items-center justify-center gap-3 rounded-[14px] bg-gradient-to-br from-greenPrimary/95 via-greenElectric/95 to-emerald-400/95 px-5 py-4 md:py-5">
              <PlusCircle
                className="h-7 w-7 md:h-8 md:w-8 text-bgPrimary transition-transform duration-300 group-hover:rotate-90"
                strokeWidth={2.4}
              />
              <div className="flex flex-col items-center">
                <span className="text-xl md:text-2xl font-black tracking-[0.08em] text-bgPrimary uppercase drop-shadow-sm">
                  Registra partita
                </span>
                <span className="mt-0.5 text-[11px] md:text-xs font-bold text-emerald-950/90 uppercase tracking-wider">
                  Circa 20 secondi · Single Player
                </span>
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-60 mix-blend-overlay"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.12) 100%)",
              }}
            />
          </Link>
        </section>

        {/* 6) 4 METRICHE COMPATTE: Streak · Settimana · Stagione · Record (2x2 mobile, 4-col desktop, stessa altezza) */}
        <section className="w-full max-w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4 w-full max-w-full">
            <Card className="flex flex-col w-full">
              <CardContent className="p-3.5 md:p-4 py-4 md:py-4 space-y-1.5 md:space-y-1 flex flex-1 flex-col w-full text-center md:text-left items-center md:items-start">
                <div className="flex items-center justify-center md:justify-start gap-1.5 min-w-0 w-full">
                  <Flame
                    size={14}
                    className={
                      activeStreakPositive ? "text-orange-400" : "text-textMuted"
                    }
                  />
                  <span className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.15em] truncate">
                    Streak
                  </span>
                </div>
                <div
                  className={`text-lg md:text-xl font-black tabular-nums mt-0.5 ${
                    activeStreakPositive
                      ? streaks.winStreak >= 2
                        ? "text-greenPrimary"
                        : "text-yellow-400"
                      : streaks.lossStreak >= 2
                      ? "text-danger"
                      : "text-textPrimary"
                  }`}
                >
                  {streaks.winStreak >= 2
                    ? `${streaks.winStreak}W`
                    : streaks.unbeatenStreak >= 2
                    ? `${streaks.unbeatenStreak}U`
                    : streaks.lossStreak >= 2
                    ? `${streaks.lossStreak}L`
                    : "—"}
                </div>
                <p className="text-[11px] text-textMuted font-medium truncate mt-auto leading-snug">
                  {activeStreakLabel}
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col w-full">
              <CardContent className="p-3.5 md:p-4 py-4 md:py-4 space-y-1.5 md:space-y-1 flex flex-1 flex-col w-full text-center md:text-left items-center md:items-start">
                <div className="flex items-center justify-center md:justify-start gap-1.5 min-w-0 w-full">
                  <Calendar size={14} className="text-blue-400" />
                  <span className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.15em] truncate">
                    Settimana
                  </span>
                </div>
                <div className="text-lg md:text-xl font-black tabular-nums text-blue-400 mt-0.5">
                  {matchesThisWeek}
                </div>
                <p className="text-[11px] text-textMuted font-medium mt-auto leading-snug">
                  {matchesThisWeek === 1
                    ? "partita questa settimana"
                    : "partite questa settimana"}
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col w-full">
              <CardContent className="p-3.5 md:p-4 py-4 md:py-4 space-y-1.5 md:space-y-1 flex flex-1 flex-col w-full text-center md:text-left items-center md:items-start">
                <div className="flex items-center justify-center md:justify-start gap-1.5 min-w-0 w-full">
                  <Trophy size={14} className="text-yellow-400" />
                  <span className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.15em] truncate">
                    Stagione
                  </span>
                </div>
                <div className="text-lg md:text-xl font-black tabular-nums text-textPrimary mt-0.5">
                  {currentSeason.matches}
                </div>
                <p className="text-[11px] text-textMuted font-medium truncate mt-auto leading-snug">
                  {currentSeason.name}
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col w-full">
              <CardContent className="p-3.5 md:p-4 py-4 md:py-4 space-y-1.5 md:space-y-1 flex flex-1 flex-col w-full text-center md:text-left items-center md:items-start">
                <div className="flex items-center justify-center md:justify-start gap-1.5 min-w-0 w-full">
                  <Crown
                    size={14}
                    className={
                      isPersonalBest ? "text-yellow-400" : "text-textMuted"
                    }
                  />
                  <span className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.15em] truncate">
                    Miglior CI
                  </span>
                </div>
                <div className="text-lg md:text-xl font-black tabular-nums text-yellow-400 mt-0.5">
                  {bestCI}
                </div>
                <p className="text-[11px] text-textMuted font-medium mt-auto leading-snug">
                  {isPersonalBest
                    ? "Record personale ora!"
                    : `Record: +${Math.max(0, bestCI - playerProfile.careerIndex)} da recuperare`}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 7) PROSSIMO TRAGUARDO */}
        <section>
          <NextGoalModule
            input={{
              matchesPlayed: summary.matchesPlayed,
              wins: summary.wins,
              goals: summary.goals,
              assists: summary.assists,
              level: summary.level,
              careerIndex: summary.careerIndex,
              isPro,
            }}
            isPro={isPro}
          />
        </section>

        {/* 8) ULTIME 5 PARTITE */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-greenPrimary/15 border border-greenPrimary/30 flex items-center justify-center">
                    <Trophy size={20} className="text-greenPrimary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Ultime partite
                    </CardTitle>
                    <p className="text-xs text-textMuted mt-0.5">
                      {playerProfile.matchesPlayed === 0
                        ? "Inizia la tua carriera"
                        : `Cronologia ultime ${recentMatches.length} · ${playerProfile.matchesPlayed} totali`}
                    </p>
                  </div>
                </div>
                {playerProfile.matchesPlayed > 0 && (
                  <Link
                    href="/matches"
                    className="flex items-center gap-1 text-xs font-semibold text-greenElectric hover:text-greenPrimary transition-colors"
                  >
                    Vedi tutte
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentMatches.length === 0 ? (
                <div className="rounded-xl bg-white/5 p-6 text-center">
                  <Calendar size={32} className="mx-auto mb-3 text-textMuted" />
                  <p className="text-sm font-semibold text-textPrimary mb-1">
                    Nessuna partita ancora
                  </p>
                  <p className="text-xs text-textMuted">
                    Registra la tua prima partita per vedere il tuo progresso.
                  </p>
                </div>
              ) : (
                recentMatches.map((match) => {
                  const style =
                    resultStyles[match.result as MatchResult];
                  const ResIcon = style.icon;
                  const ciPos = match.careerIndexChange >= 0;
                  return (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="block group"
                    >
                      <div className="flex items-center gap-3 md:gap-4 rounded-xl p-3 md:p-4 bg-white/5 border border-transparent hover:border-greenPrimary/20 hover:bg-white/[0.07] transition-all duration-200">
                        <div className="flex-shrink-0 w-14">
                          <Badge
                            variant={style.variant}
                            className="w-full justify-center py-1.5 text-[10px] font-black uppercase tracking-wider"
                          >
                            {match.result === "LOSS" ? (
                              <ResIcon size={11} className="rotate-180" />
                            ) : (
                              <ResIcon size={11} />
                            )}
                            {match.result}
                          </Badge>
                          <div className="text-[10px] text-textMuted text-center mt-1.5 font-medium">
                            {format(
                              new Date(match.playedAt),
                              "dd/MM",
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex items-center gap-3 md:gap-4">
                          <div className="text-center min-w-[60px]">
                            <div className="text-xl md:text-2xl font-black tabular-nums">
                              <span className="text-textPrimary">
                                {match.goalsFor}
                              </span>
                              <span className="text-textMuted font-medium">
                                {" - "}
                              </span>
                              <span className="text-textMuted">
                                {match.goalsAgainst}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 grid grid-cols-3 gap-2 md:gap-4 text-xs">
                            <div>
                              <div className="text-[9px] font-semibold text-textMuted uppercase tracking-wider mb-0.5">
                                Ruolo
                              </div>
                              <div className="font-bold text-textPrimary">
                                {match.role}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] font-semibold text-textMuted uppercase tracking-wider mb-0.5">
                                Gol
                              </div>
                              <div className="font-bold text-yellow-400 tabular-nums">
                                {match.goals}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] font-semibold text-textMuted uppercase tracking-wider mb-0.5">
                                Ass
                              </div>
                              <div className="font-bold text-blue-400 tabular-nums">
                                {match.assists}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold tabular-nums shrink-0 ${
                              ciPos
                                ? "bg-greenPrimary/10 text-greenPrimary border border-greenPrimary/20"
                                : "bg-danger/10 text-danger border border-danger/20"
                            }`}
                          >
                            {ciPos ? (
                              <TrendingUp size={12} strokeWidth={2.5} />
                            ) : (
                              <TrendingDown size={12} strokeWidth={2.5} />
                            )}
                            <span>
                              {ciPos ? "+" : ""}
                              {match.careerIndexChange}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </section>

        {/* 9) CAREER INDEX CHART */}
        <section>
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-greenPrimary/15 border border-greenPrimary/30 flex items-center justify-center">
                    <Zap size={20} className="text-greenPrimary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Career Index
                    </CardTitle>
                    <p className="text-xs text-textMuted mt-0.5">
                      Ultime {ciChartData.length} rilevazioni
                      {!isPro && ciChartData.length >= 20 && (
                        <>
                          {" · "}
                          <span className="inline-flex items-center gap-1 text-textMuted">
                            <Lock size={11} />
                            Storico completo PRO
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-end gap-4 flex-wrap">
                  <div>
                    <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-1">
                      Trend 30g
                    </div>
                    <div
                      className={`flex items-center gap-1 text-lg font-bold tabular-nums ${
                        trend30dPositive
                          ? "text-greenPrimary"
                          : "text-danger"
                      }`}
                    >
                      {trend30dPositive ? (
                        <TrendingUp size={16} strokeWidth={2.5} />
                      ) : (
                        <TrendingDown size={16} strokeWidth={2.5} />
                      )}
                      <span>
                        {trend30dPositive ? "+" : ""}
                        {trend30d}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CareerIndexChart data={ciChartData} height={240} />
            </CardContent>
          </Card>
        </section>

        {/* 10) STATS 2x2 mobile + Win Rate full-width (2-col mobile, 3-col desktop, stessa altezza) */}
        <section className="w-full max-w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4 w-full max-w-full">
            <Card className="flex flex-col w-full">
              <CardContent className="p-4 md:p-5 flex flex-1 flex-col w-full">
                <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-1.5 truncate">
                  Partite
                </div>
                <div className="text-2xl md:text-3xl font-black text-textPrimary tabular-nums mt-auto">
                  {playerProfile.matchesPlayed}
                </div>
              </CardContent>
            </Card>
            <Card className="flex flex-col w-full">
              <CardContent className="p-4 md:p-5 flex flex-1 flex-col w-full">
                <div className="text-[10px] font-semibold text-greenPrimary uppercase tracking-wider mb-1.5 truncate">
                  Vittorie
                </div>
                <div className="text-2xl md:text-3xl font-black text-greenPrimary tabular-nums mt-auto">
                  {playerProfile.wins}
                </div>
              </CardContent>
            </Card>
            <Card className="flex flex-col w-full">
              <CardContent className="p-4 md:p-5 flex flex-1 flex-col w-full">
                <div className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider mb-1.5 truncate">
                  Gol
                </div>
                <div className="text-2xl md:text-3xl font-black text-yellow-400 tabular-nums mt-auto">
                  {playerProfile.goals}
                </div>
              </CardContent>
            </Card>
            <Card className="flex flex-col w-full">
              <CardContent className="p-4 md:p-5 flex flex-1 flex-col w-full">
                <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1.5 truncate">
                  Assist
                </div>
                <div className="text-2xl md:text-3xl font-black text-blue-400 tabular-nums mt-auto">
                  {playerProfile.assists}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2 md:col-span-2 w-full max-w-full">
              <CardContent className="p-4 md:p-5 w-full max-w-full">
                <div className="flex items-center justify-between mb-2.5 gap-2 w-full">
                  <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider min-w-0 truncate">
                    Win Rate
                  </div>
                  <div className="text-sm font-bold text-textPrimary tabular-nums shrink-0">
                    {winRate}%
                  </div>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-greenPrimary to-greenElectric"
                    style={{ width: `${winRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 11) NEXT ACHIEVEMENT PROGRESS */}
        <section>
          <div className="mb-3">
            <div className="flex items-center gap-2.5">
              <Award size={18} className="text-greenElectric" />
              <h2 className="text-sm font-bold text-textMuted uppercase tracking-wider">
                Prossimo achievement
              </h2>
            </div>
          </div>
          {nextAchievement ? (
            <NextAchievementProgress achievement={nextAchievement} />
          ) : (
            <Card>
              <CardContent className="p-5 text-center">
                <Target size={32} className="mx-auto mb-3 text-textMuted" />
                <p className="text-sm font-semibold text-textPrimary mb-1">
                  Tutti gli achievement sbloccati!
                </p>
                <p className="text-xs text-textMuted">
                  Continua a giocare per ottenere nuovi trofei.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* 12) CURRENT SEASON */}
        <section>
          <CurrentSeasonCard
            season={{
              name: currentSeason.name,
              matches: currentSeason.matches,
              wins: currentSeason.wins,
              draws: currentSeason.draws,
              losses: currentSeason.losses,
              startCareerIndex: currentSeason.startCareerIndex,
              endCareerIndex: currentSeason.endCareerIndex,
              peakCareerIndex: currentSeason.peakCareerIndex,
              startOverall: currentSeason.startOverall,
              endOverall: currentSeason.endOverall,
            }}
          />
        </section>

        {/* 13) FREE vs PRO TEASERS — Dark + Gold Premium (4 eleganti, NON invasivi) */}
        {!isPro && (
          <section className="space-y-3 md:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 px-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Crown size={16} className="text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300/90">
                  Vantaggi esclusivi
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/25 rounded-full px-2 py-0.5">
                  €3,90/mese
                </span>
              </div>
              <p className="text-[11px] text-textMuted font-medium hidden sm:block">
                Profondità carriera · Personalizzazione · Analytics
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
              <Card className="relative overflow-hidden border-amber-500/15 bg-gradient-to-br from-amber-500/[0.04] to-transparent flex flex-col">
                <div className="absolute top-2 right-2 text-amber-400/70 z-10">
                  <Lock size={12} />
                </div>
                <CardContent className="p-3 md:p-4 space-y-2 flex-1 flex flex-col">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <Palette size={16} className="text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-textPrimary leading-tight">
                      Temi Premium
                    </p>
                    <p className="text-[11px] text-textMuted mt-1 leading-snug">
                      Night · Elite · Neon
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-amber-500/15 bg-gradient-to-br from-amber-500/[0.04] to-transparent flex flex-col">
                <div className="absolute top-2 right-2 text-amber-400/70 z-10">
                  <Lock size={12} />
                </div>
                <CardContent className="p-3 md:p-4 space-y-2 flex-1 flex flex-col">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <BarChart3 size={16} className="text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-textPrimary leading-tight">
                      Analytics avanzate
                    </p>
                    <p className="text-[11px] text-textMuted mt-1 leading-snug">
                      7 / 30 / 90 giorni
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-amber-500/15 bg-gradient-to-br from-amber-500/[0.04] to-transparent flex flex-col">
                <div className="absolute top-2 right-2 text-amber-400/70 z-10">
                  <Lock size={12} />
                </div>
                <CardContent className="p-3 md:p-4 space-y-2 flex-1 flex flex-col">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <History size={16} className="text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-textPrimary leading-tight">
                      Storico completo
                    </p>
                    <p className="text-[11px] text-textMuted mt-1 leading-snug">
                      CI illimitato · Tutte le stagioni
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-amber-500/15 bg-gradient-to-br from-amber-500/[0.04] to-transparent flex flex-col">
                <div className="absolute top-2 right-2 text-amber-400/70 z-10">
                  <Lock size={12} />
                </div>
                <CardContent className="p-3 md:p-4 space-y-2 flex-1 flex flex-col">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <Star size={16} className="text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-textPrimary leading-tight">
                      Record avanzati
                    </p>
                    <p className="text-[11px] text-textMuted mt-1 leading-snug">
                      Streaks · Per ruolo · Traguardi extra
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="pt-1 w-full flex justify-center sm:justify-start">
              <Link
                href="/pricing"
                className="group w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-black uppercase tracking-wider text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.08)] transition-all hover:from-amber-500/20 hover:via-amber-400/15 hover:to-amber-500/20 hover:text-amber-200 hover:border-amber-400/60 hover:shadow-[0_0_35px_rgba(251,191,36,0.15)] active:scale-[0.99]"
              >
                <Crown size={15} className="shrink-0" />
                <span>Scopri PRO</span>
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 shrink-0"
                />
              </Link>
            </div>
          </section>
        )}

        {/* 14) MULTIPLAYER COMING SOON — separatore wave fluida verde CalcettoXP */}
        <section className="pt-8 md:pt-12">
          <div
            aria-hidden
            className="pointer-events-none mb-6 md:mb-9 mx-auto w-full"
          >
            <svg
              viewBox="0 0 1440 80"
              preserveAspectRatio="none"
              className="w-full h-12 md:h-16"
              style={{
                filter: "drop-shadow(0 0 12px rgba(124,255,107,0.25))",
              }}
            >
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7CFF6B" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#22C55E" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7CFF6B" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="waveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7CFF6B" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#7CFF6B" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#7CFF6B" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                d="M0,40 C180,60 360,10 540,30 C720,50 900,5 1080,25 C1260,45 1380,20 1440,35 L1440,80 L0,80 Z"
                fill="url(#waveGradient)"
              />
              <path
                d="M0,40 C180,60 360,10 540,30 C720,50 900,5 1080,25 C1260,45 1380,20 1440,35"
                fill="none"
                stroke="url(#waveStroke)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <MultiplayerComingSoonCard />
        </section>
      </div>

      <InstallPWAButton />
      <MobileBottomNav />
    </main>
  );
}
