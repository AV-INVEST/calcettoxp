import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateCardAttributes, type PlayerSummary } from "@/lib/card-attributes";
import { hasActivePro } from "@/lib/entitlements";
import { getSeasonKeyInfo, formatSeasonName } from "@/lib/seasons";
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
import { PersonalRecordsCard } from "@/components/stats/PersonalRecordsCard";
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
  Check,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import type { CardTheme } from "@/lib/username-config";

type Role = "POR" | "DIF" | "CEN" | "ATT";
type MatchResult = "WIN" | "DRAW" | "LOSS";

export const metadata: Metadata = {
  title: "La mia Card | CalcettoXP",
  description:
    "La tua carriera CalcettoXP: evoluzione, record e prossimi obiettivi.",
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

  const playerSeasonsQuery = prisma.playerSeason.findMany({
    where: { playerProfileId: playerProfile.id },
    orderBy: { startDate: "desc" },
    select: {
      seasonKey: true,
      name: true,
      startDate: true,
      endDate: true,
      matches: true,
      wins: true,
      goals: true,
      startCareerIndex: true,
      endCareerIndex: true,
      peakCareerIndex: true,
      startOverall: true,
      endOverall: true,
    },
  });

  const [recentMatchesAll, ciHistory, playerAchievements, playerSeasons] = await Promise.all([
    recentMatchesForStreaksQuery,
    ciHistoryQuery,
    playerAchievementsQuery,
    playerSeasonsQuery,
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
    streaks.winStreak >= 1
      ? streaks.winStreak === 1
        ? "1 vittoria"
        : `${streaks.winStreak} vittorie`
      : streaks.unbeatenStreak >= 1
      ? streaks.unbeatenStreak === 1
        ? "1 imbattuto"
        : `${streaks.unbeatenStreak} imbattuto`
      : streaks.lossStreak >= 1
      ? streaks.lossStreak === 1
        ? "1 sconfitta"
        : `${streaks.lossStreak} sconfitte`
      : "Inizia la striscia";

  const activeStreakPositive =
    streaks.winStreak >= 1 || streaks.unbeatenStreak >= 1;

  const isMaxLevel = levelProgress.currentLevel >= 50;

  const personalRecordsInput = {
    profile: {
      careerIndex: playerProfile.careerIndex,
      overall: playerProfile.overall,
    },
    matches: recentMatchesAll.map((m) => ({
      id: m.id,
      goals: m.goals,
      assists: m.assists,
      result: m.result,
      playedAt: m.playedAt,
      seasonKey: currentSeasonKey,
    })),
    seasons: playerSeasons,
    isPro,
  };

  function aggregateForDays(days: number) {
    const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
    const matches = recentMatchesAll.filter(
      (m) => new Date(m.playedAt).getTime() >= cutoff
    );
    const p = matches.length;
    const w = matches.filter((m) => m.result === "WIN").length;
    const d = matches.filter((m) => m.result === "DRAW").length;
    const l = matches.filter((m) => m.result === "LOSS").length;
    const g = matches.reduce((sum, m) => sum + (m.goals ?? 0), 0);
    const a = matches.reduce((sum, m) => sum + (m.assists ?? 0), 0);
    const ci = matches.reduce((sum, m) => sum + (m.careerIndexChange ?? 0), 0);
    const wr = p > 0 ? Math.round((w / p) * 100) : 0;
    return { p, w, d, l, g, a, ci, wr };
  }

  const periodStats = {
    d7: aggregateForDays(7),
    d30: aggregateForDays(30),
    d90: aggregateForDays(90),
  };

  type RoleKey = "POR" | "DIF" | "CEN" | "ATT";
  const roleAgg: Record<string, { p: number; w: number; g: number; a: number; ci: number }> = {};
  for (const m of recentMatchesAll) {
    const r = (m.role as RoleKey) ?? playerProfile.primaryRole;
    if (!r) continue;
    if (!roleAgg[r]) roleAgg[r] = { p: 0, w: 0, g: 0, a: 0, ci: 0 };
    roleAgg[r].p++;
    if (m.result === "WIN") roleAgg[r].w++;
    roleAgg[r].g += m.goals ?? 0;
    roleAgg[r].a += m.assists ?? 0;
    roleAgg[r].ci += m.careerIndexChange ?? 0;
  }
  const roleStatsEntries = Object.entries(roleAgg)
    .map(([role, s]) => ({
      role: role as RoleKey,
      ...s,
      wr: s.p > 0 ? Math.round((s.w / s.p) * 100) : 0,
    }))
    .sort((a, b) => b.p - a.p);

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

        {/* 2.5) CONDIVIDI LA MIA CARD (mobile compatto premium, layout desktop invariato) */}
        <section className="w-full max-w-full">
          <Card className="border-white/5 bg-bgCard/60 w-full max-w-full">
            <CardContent className="px-5 py-3.5 md:px-6 md:py-5 w-full max-w-full">
              {playerProfile.isPublic ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2.5 md:gap-3 w-full sm:w-auto justify-center sm:justify-start min-w-0">
                    <div className="w-10 h-10 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-greenPrimary/25 to-greenElectric/15 border border-greenElectric/25 flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(124,255,107,0.12)]">
                      <Share2 size={18} className="text-greenElectric" />
                    </div>
                    <div className="min-w-0 w-full sm:w-auto text-center sm:text-left">
                      <p className="text-[13px] md:text-sm font-black text-textPrimary uppercase tracking-wider truncate">
                        Condividi la mia card
                      </p>
                      <p className="text-[11px] md:text-[11px] text-textMuted truncate mt-0.5">
                        Mostra la tua carriera ai tuoi amici
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-0.5 sm:mt-0">
                    <ShareCardButton
                      username={playerProfile.username}
                      label="CONDIVIDI"
                      variant="primary"
                      size="md"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2.5 md:gap-3 w-full sm:w-auto justify-center sm:justify-start min-w-0">
                    <div className="w-10 h-10 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Lock size={18} className="text-textMuted" />
                    </div>
                    <div className="min-w-0 w-full sm:w-auto text-center sm:text-left">
                      <p className="text-[13px] md:text-sm font-black text-textPrimary uppercase tracking-wider truncate">
                        Condividi la mia card
                      </p>
                      <p className="text-[11px] md:text-[11px] text-textMuted truncate mt-0.5">
                        Rendi pubblico il profilo per condividere la tua card
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-0.5 sm:mt-0">
                    <Link
                      href="/settings"
                      className="w-full sm:w-auto max-w-xs sm:max-w-none inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2.5 h-10 md:h-11 text-[12px] md:text-sm font-black uppercase tracking-wider text-textPrimary hover:bg-white/10 hover:border-white/25 transition active:scale-[0.99]"
                    >
                      <Settings size={14} />
                      <span>Impostazioni</span>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 3) KEY METRICS: OVR · CI · LV (mobile 3 box separati, desktop invariato) */}
        <section className="w-full max-w-full">
          <div className="hidden md:block">
            <Card className="overflow-hidden w-full max-w-full">
              <CardContent className="md:p-6 w-full max-w-full">
                <div className="grid grid-cols-3 gap-6 w-full max-w-full">
                  <div className="text-center min-w-0 flex flex-col justify-center items-center md:py-0">
                    <div className="text-[11px] font-semibold text-textMuted uppercase tracking-[0.15em] mb-2 truncate w-full">
                      OVR
                    </div>
                    <div
                      className="md:text-5xl font-black tabular-nums whitespace-nowrap min-w-0 bg-gradient-to-b from-greenElectric via-greenPrimary to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(124,255,107,0.18)] leading-tight"
                      style={{ letterSpacing: "-0.03em" }}
                    >
                      {playerProfile.overall}
                    </div>
                  </div>
                  <div className="text-center min-w-0 flex flex-col justify-center items-center md:py-0">
                    <div className="text-[11px] font-semibold text-textMuted uppercase tracking-[0.15em] mb-2 truncate w-full">
                      Career Index
                    </div>
                    <div
                      className="md:text-4xl font-black tabular-nums whitespace-nowrap min-w-0 w-full leading-tight"
                      style={{ color: "#7CFF6B" }}
                    >
                      {playerProfile.careerIndex}
                    </div>
                    <div
                      className={`md:mt-2 flex items-center justify-center gap-1 md:text-xs font-bold tabular-nums whitespace-nowrap ${
                        lastCiChange >= 0 ? "text-greenPrimary" : "text-danger"
                      }`}
                    >
                      {lastCiChange >= 0 ? (
                        <TrendingUp strokeWidth={2.5} className="md:w-[13px] md:h-[13px] shrink-0" size={13} />
                      ) : (
                        <TrendingDown strokeWidth={2.5} className="md:w-[13px] md:h-[13px] shrink-0" size={13} />
                      )}
                      <span>
                        {lastCiChange >= 0 ? "+" : ""}
                        {lastCiChange}
                      </span>
                    </div>
                  </div>
                  <div className="text-center min-w-0 flex flex-col justify-center items-center md:py-0">
                    <div className="text-[11px] font-semibold text-textMuted uppercase tracking-[0.15em] mb-2 truncate w-full">
                      Livello
                    </div>
                    <div className="md:text-4xl font-black tabular-nums whitespace-nowrap min-w-0 text-textPrimary w-full leading-tight">
                      <span className="text-blue-400">
                        {levelProgress.currentLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:hidden grid grid-cols-3 gap-2 w-full max-w-full">
            <div className="text-center min-w-0 flex flex-col justify-center items-center py-3.5 px-1 rounded-2xl bg-white/[0.025] border border-white/5">
              <div className="text-[9px] font-semibold text-textMuted uppercase tracking-[0.18em] mb-1.5 truncate w-full">
                OVR
              </div>
              <div
                className="text-[26px] font-black tabular-nums whitespace-nowrap min-w-0 bg-gradient-to-b from-greenElectric via-greenPrimary to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(124,255,107,0.18)] leading-none"
                style={{ letterSpacing: "-0.03em" }}
              >
                {playerProfile.overall}
              </div>
            </div>
            <div className="text-center min-w-0 flex flex-col justify-center items-center py-3.5 px-1 rounded-2xl bg-white/[0.025] border border-white/5">
              <div className="text-[9px] font-semibold text-textMuted uppercase tracking-[0.18em] mb-1.5 truncate w-full">
                CI
              </div>
              <div
                className="text-[22px] font-black tabular-nums whitespace-nowrap min-w-0 w-full leading-none"
                style={{ color: "#7CFF6B" }}
              >
                {playerProfile.careerIndex}
              </div>
              <div
                className={`mt-1.5 flex items-center justify-center gap-0.5 text-[10px] font-black tabular-nums whitespace-nowrap ${
                  lastCiChange >= 0 ? "text-greenPrimary" : "text-danger"
                }`}
              >
                {lastCiChange >= 0 ? (
                  <TrendingUp size={10} strokeWidth={2.5} className="shrink-0" />
                ) : (
                  <TrendingDown size={10} strokeWidth={2.5} className="shrink-0" />
                )}
                <span>
                  {lastCiChange >= 0 ? "+" : ""}
                  {lastCiChange}
                </span>
              </div>
            </div>
            <div className="text-center min-w-0 flex flex-col justify-center items-center py-3.5 px-1 rounded-2xl bg-white/[0.025] border border-white/5">
              <div className="text-[9px] font-semibold text-textMuted uppercase tracking-[0.18em] mb-1.5 truncate w-full">
                LV
              </div>
              <div className="text-[22px] font-black tabular-nums whitespace-nowrap min-w-0 text-textPrimary w-full leading-none">
                <span className="text-blue-400">
                  {levelProgress.currentLevel}
                </span>
              </div>
            </div>
          </div>
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

        {/* 6) CAREER INDEX — andamento carriera */}
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

        {/* 7) 4 METRICHE COMPATTE: Streak · Settimana · Stagione · Record (2x2 mobile, 4-col desktop, stessa altezza) */}
        <section className="w-full max-w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-fr gap-2.5 md:gap-4 w-full max-w-full">
            <Card className="flex flex-col w-full h-full">
              <CardContent className="px-3 py-5 md:p-4 flex flex-col items-center justify-center text-center w-full min-h-[120px] h-full gap-2">
                <div className="flex items-center justify-center gap-1.5 min-w-0 shrink-0">
                  <Flame
                    size={14}
                    className={
                      activeStreakPositive ? "text-orange-400" : "text-textMuted"
                    }
                  />
                  <span className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.15em] whitespace-nowrap">
                    Streak
                  </span>
                </div>
                <div
                  className={`text-lg md:text-xl font-black tabular-nums shrink-0 ${
                    activeStreakPositive
                      ? streaks.winStreak >= 1
                        ? "text-greenPrimary"
                        : "text-yellow-400"
                      : streaks.lossStreak >= 1
                      ? "text-danger"
                      : "text-textPrimary"
                  }`}
                >
                  {streaks.winStreak >= 1
                    ? `${streaks.winStreak}W`
                    : streaks.unbeatenStreak >= 1
                    ? `${streaks.unbeatenStreak}U`
                    : streaks.lossStreak >= 1
                    ? `${streaks.lossStreak}L`
                    : "—"}
                </div>
                <p className="text-[11px] text-textMuted font-medium leading-snug shrink-0">
                  {activeStreakLabel}
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col w-full h-full">
              <CardContent className="px-3 py-5 md:p-4 flex flex-col items-center justify-center text-center w-full min-h-[120px] h-full gap-2">
                <div className="flex items-center justify-center gap-1.5 min-w-0 shrink-0">
                  <Calendar size={14} className="text-blue-400" />
                  <span className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.15em] whitespace-nowrap">
                    Settimana
                  </span>
                </div>
                <div className="text-lg md:text-xl font-black tabular-nums text-blue-400 shrink-0">
                  {matchesThisWeek}
                </div>
                <p className="text-[11px] text-textMuted font-medium leading-snug shrink-0">
                  {matchesThisWeek === 1
                    ? "partita questa settimana"
                    : "partite questa settimana"}
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col w-full h-full">
              <CardContent className="px-3 py-5 md:p-4 flex flex-col items-center justify-center text-center w-full min-h-[120px] h-full gap-2">
                <div className="flex items-center justify-center gap-1.5 min-w-0 shrink-0">
                  <Trophy size={14} className="text-yellow-400" />
                  <span className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.15em] whitespace-nowrap">
                    Stagione
                  </span>
                </div>
                <div className="text-lg md:text-xl font-black tabular-nums text-textPrimary shrink-0">
                  {currentSeason.matches}
                </div>
                <p className="text-[11px] text-textMuted font-medium leading-snug shrink-0">
                  {formatSeasonName(currentSeason.name)}
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col w-full h-full">
              <CardContent className="px-3 py-5 md:p-4 flex flex-col items-center justify-center text-center w-full min-h-[120px] h-full gap-2">
                <div className="flex items-center justify-center gap-1.5 min-w-0 shrink-0">
                  <Crown
                    size={14}
                    className={
                      isPersonalBest ? "text-yellow-400" : "text-textMuted"
                    }
                  />
                  <span className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.15em] whitespace-nowrap">
                    Miglior CI
                  </span>
                </div>
                <div className="text-lg md:text-xl font-black tabular-nums text-yellow-400 shrink-0">
                  {bestCI}
                </div>
                <p className="text-[11px] text-textMuted font-medium leading-snug shrink-0">
                  {isPersonalBest
                    ? "Record personale ora!"
                    : `Record: +${Math.max(0, bestCI - playerProfile.careerIndex)} da recuperare`}
                </p>
              </CardContent>
            </Card>
          </div>
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
                      <div className="flex flex-col gap-3 rounded-xl p-3 md:p-4 bg-white/5 border border-transparent hover:border-greenPrimary/20 hover:bg-white/[0.07] transition-all duration-200">
                        <div className="flex items-center justify-between w-full gap-3">
                          <Badge
                            variant={style.variant}
                            className="justify-center px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shrink-0"
                          >
                            {match.result === "LOSS" ? (
                              <ResIcon size={11} className="rotate-180" />
                            ) : (
                              <ResIcon size={11} />
                            )}
                            <span className="ml-1">{match.result}</span>
                          </Badge>

                          <div className="shrink-0">
                            <div className="text-xl md:text-2xl font-black tabular-nums">
                              <span className="text-textPrimary">
                                {match.goalsFor}
                              </span>
                              <span className="text-textMuted font-medium mx-1">
                                -
                              </span>
                              <span className="text-textMuted">
                                {match.goalsAgainst}
                              </span>
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
                            <span className="whitespace-nowrap">
                              {ciPos ? "+" : ""}
                              {match.careerIndexChange} CI
                            </span>
                          </div>
                        </div>

                        <div className="md:hidden flex items-center justify-between w-full gap-2">
                          <div className="text-[11px] text-textMuted font-medium shrink-0">
                            {format(new Date(match.playedAt), "dd/MM")}
                          </div>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="text-center">
                              <div className="text-[9px] font-semibold text-textMuted uppercase tracking-wider mb-0.5">
                                Ruolo
                              </div>
                              <div className="text-xs font-bold text-textPrimary">
                                {match.role}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-[9px] font-semibold text-textMuted uppercase tracking-wider mb-0.5">
                                Gol
                              </div>
                              <div className="text-xs font-bold text-yellow-400 tabular-nums">
                                {match.goals}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-[9px] font-semibold text-textMuted uppercase tracking-wider mb-0.5">
                                Ass
                              </div>
                              <div className="text-xs font-bold text-blue-400 tabular-nums">
                                {match.assists}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-between w-full gap-4">
                          <div className="text-[11px] text-textMuted font-medium shrink-0">
                            {format(new Date(match.playedAt), "dd/MM/yyyy")}
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-4 text-xs">
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
                          <div className="w-[120px] shrink-0" />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </section>

        {/* 9) RECORD PERSONALI */}
        <section>
          <PersonalRecordsCard input={personalRecordsInput} isPro={isPro} />
        </section>

        {/* 10) STAGIONE CORRENTE */}
        <section>
          <CurrentSeasonCard
            season={{
              name: formatSeasonName(currentSeason.name),
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

        {/* 11) PROSSIMI OBIETTIVI — compatti (goal + trofeo) */}
        <section className="space-y-3 md:space-y-4">
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
          <div>
            <div className="mb-3">
              <div className="flex items-center gap-2.5">
                <Award size={18} className="text-greenElectric" />
                <h2 className="text-sm font-bold text-textMuted uppercase tracking-wider">
                  Prossimo trofeo
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
                    Tutti i trofei sbloccati!
                  </p>
                  <p className="text-xs text-textMuted">
                    Continua a giocare per ottenere nuovi trofei.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* 12) ANALYTICS PRO + UNA CTA PRO FORTE */}
        {isPro ? (
          <section className="space-y-3 md:space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                      <BarChart3 size={20} className="text-amber-300" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Periodi
                      </CardTitle>
                      <p className="text-xs text-textMuted mt-0.5">
                        La tua performance su finestre temporali
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(
                    [
                      ["7 giorni", periodStats.d7],
                      ["30 giorni", periodStats.d30],
                      ["90 giorni", periodStats.d90],
                    ] as const
                  ).map(([label, s]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 flex flex-col gap-2"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-widest text-textMuted">
                        {label}
                      </div>
                      <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-textMuted mb-0.5">
                            Partite
                          </div>
                          <div className="font-bold tabular-nums">{s.p}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-textMuted mb-0.5">
                            Win Rate
                          </div>
                          <div className="font-bold tabular-nums text-greenPrimary">
                            {s.wr}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-textMuted mb-0.5">
                            Gol
                          </div>
                          <div className="font-bold tabular-nums text-yellow-400">
                            {s.g}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-textMuted mb-0.5">
                            Assist
                          </div>
                          <div className="font-bold tabular-nums text-blue-400">
                            {s.a}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-[9px] uppercase tracking-wider text-textMuted mb-0.5">
                            Δ Career Index
                          </div>
                          <div
                            className={`font-bold tabular-nums ${
                              s.ci >= 0 ? "text-greenPrimary" : "text-danger"
                            }`}
                          >
                            {s.ci >= 0 ? "+" : ""}
                            {s.ci}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {roleStatsEntries.length > 1 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center">
                      <Users size={20} className="text-amber-300" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Per ruolo
                      </CardTitle>
                      <p className="text-xs text-textMuted mt-0.5">
                        Dove rendi di più
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-wider text-textMuted">
                          <th className="py-2 pr-3 font-semibold">Ruolo</th>
                          <th className="py-2 px-2 text-right font-semibold">Partite</th>
                          <th className="py-2 px-2 text-right font-semibold">Win</th>
                          <th className="py-2 px-2 text-right font-semibold">Gol</th>
                          <th className="py-2 px-2 text-right font-semibold">Ass</th>
                          <th className="py-2 pl-3 text-right font-semibold">ΔCI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {roleStatsEntries.map((r) => (
                          <tr key={r.role}>
                            <td className="py-2.5 pr-3">
                              <span className="font-black tracking-wide">
                                {r.role}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right tabular-nums">
                              {r.p}
                            </td>
                            <td className="py-2.5 px-2 text-right tabular-nums text-greenPrimary">
                              {r.wr}%
                            </td>
                            <td className="py-2.5 px-2 text-right tabular-nums text-yellow-400">
                              {r.g}
                            </td>
                            <td className="py-2.5 px-2 text-right tabular-nums text-blue-400">
                              {r.a}
                            </td>
                            <td
                              className={`py-2.5 pl-3 text-right tabular-nums ${
                                r.ci >= 0 ? "text-greenPrimary" : "text-danger"
                              }`}
                            >
                              {r.ci >= 0 ? "+" : ""}
                              {r.ci}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        ) : (
          <section>
            <Card className="relative overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#15100a]/80 via-[#0d0a06]/95 to-[#0a0804]/90 shadow-[0_0_60px_rgba(251,191,36,0.06)]">
              <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
                <div className="absolute -top-20 -right-16 w-56 h-56 md:w-72 md:h-72 rounded-full bg-amber-400/10 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-52 h-52 md:w-64 md:h-64 rounded-full bg-yellow-500/10 blur-3xl" />
              </div>
              <CardContent className="relative p-4 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start items-center gap-3 md:gap-5 text-center md:text-left">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400/25 via-amber-500/20 to-yellow-300/10 border border-amber-400/40 flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.18)]">
                      <Crown
                        size={24}
                        className="md:w-10 md:h-10 text-amber-300 drop-shadow"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 w-full md:w-auto flex flex-col items-center md:items-start">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                        <Crown size={10} strokeWidth={2.5} />
                        PRO
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200/80">
                        €3,90 / mese
                      </span>
                    </div>
                    <h3 className="text-lg md:text-2xl font-black text-textPrimary tracking-tight mb-1.5 leading-tight">
                      Passa a PRO per statistiche avanzate
                    </h3>
                    <p className="text-[13px] md:text-[13px] text-textMuted mb-3 md:mb-5 leading-snug md:leading-relaxed max-w-md">
                      Trasforma la tua card in un centro comando completo. Analisi periodiche, performance per ruolo, storico completo, temi premium e record avanzati.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mb-3.5 md:mb-6 w-full md:w-auto">
                      {[
                        "Analytics 7 / 30 / 90 giorni",
                        "Statistiche per ruolo",
                        "Storico completo Career Index",
                        "Storico completo stagioni",
                        "Temi premium card",
                        "Record avanzati",
                      ].map((b, i) => (
                        <li
                          key={i}
                          className="inline-flex items-center gap-2 text-[12px] md:text-[13px] font-semibold text-amber-100/90 justify-center md:justify-start"
                        >
                          <span className="w-4 h-4 md:w-[18px] md:h-[18px] shrink-0 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                            <Check
                              size={10}
                              strokeWidth={3}
                              className="text-amber-300"
                            />
                          </span>
                          <span className="min-w-0 whitespace-nowrap">{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/pricing"
                      className="group relative inline-flex w-full max-w-[280px] md:w-auto md:max-w-none items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl px-6 py-2.5 md:px-7 md:py-3.5 text-sm md:text-base font-black uppercase tracking-[0.14em] md:tracking-wider text-[#0b0904] shadow-[0_0_40px_rgba(251,191,36,0.25)] hover:shadow-[0_0_55px_rgba(251,191,36,0.45)] hover:-translate-y-0.5 active:scale-[0.99] transition-all"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(234,179,8,0.98) 0%, rgba(250,204,21,0.98) 55%, rgba(253,224,71,0.98) 100%)",
                      }}
                    >
                      <Crown size={16} className="shrink-0" strokeWidth={2.2} />
                      <span>Passa a PRO</span>
                      <ChevronRight
                        size={17}
                        className="shrink-0 transition-transform group-hover:translate-x-0.5"
                        strokeWidth={2.4}
                      />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
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
