import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateCardAttributes, type PlayerSummary } from "@/lib/card-attributes";
import { hasActivePro } from "@/lib/entitlements";
import { getSeasonKeyInfo } from "@/lib/seasons";
import PlayerCard from "@/components/player/PlayerCard";
import CareerIndexChart, { type CareerIndexDataPoint } from "@/components/charts/CareerIndexChart";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import NextAchievementProgress from "@/components/dashboard/NextAchievementProgress";
import CurrentSeasonCard from "@/components/dashboard/CurrentSeasonCard";
import MultiplayerComingSoonCard from "@/components/dashboard/MultiplayerComingSoonCard";
import NextGoalModule from "@/components/dashboard/NextGoalModule";
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
} from "lucide-react";
import { format } from "date-fns";
import { InstallPWAButton } from "@/components/pwa/InstallPWAButton";

type Role = "POR" | "DIF" | "CEN" | "ATT";
type MatchResult = "WIN" | "DRAW" | "LOSS";

export const metadata: Metadata = {
  title: "Dashboard | CalcettoXP",
  description: "La tua carriera CalcettoXP: progressi, statistiche e prossimi obiettivi.",
  robots: { index: false, follow: false },
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

  const [recentMatches, ciHistory, playerAchievements] = await Promise.all([
    prisma.match.findMany({
      where: { playerId: playerProfile.id },
      orderBy: { playedAt: "desc" },
      take: 5,
    }),
    prisma.careerIndexHistory.findMany({
      where: { playerProfileId: playerProfile.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    }),
    prisma.playerAchievement.findMany({
      where: { playerProfileId: playerProfile.id },
      include: { achievement: true },
      orderBy: [{ unlockedAt: "desc" }, { progress: "desc" }],
    }),
  ]);

  const seasonKeyInfo = getSeasonKeyInfo();
  const currentSeasonKey = playerProfile.currentSeasonKey ?? seasonKeyInfo.seasonKey;

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
    role: playerProfile.primaryRole,
    recentMatches: recentMatches.map((m) => ({
      careerIndexChange: m.careerIndexChange,
      result: m.result,
      goals: m.goals,
      assists: m.assists,
      playedAt: m.playedAt,
    })),
  };

  const attributes = calculateCardAttributes(summary);

  const lastCiChange = ciHistory.length > 0 ? ciHistory[ciHistory.length - 1].changeValue : 0;

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

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recent30d = ciHistory.filter((h) => h.createdAt >= thirtyDaysAgo);
  let trend30d = 0;
  if (recent30d.length >= 2) {
    trend30d = recent30d[recent30d.length - 1].valueAfter - recent30d[0].valueBefore;
  } else if (ciHistory.length >= 2) {
    trend30d = ciHistory[ciHistory.length - 1].valueAfter - ciHistory[0].valueBefore;
  }
  const trend30dPositive = trend30d >= 0;

  const winRate =
    playerProfile.matchesPlayed > 0
      ? Math.round((playerProfile.wins / playerProfile.matchesPlayed) * 100)
      : 0;

  const inProgressAchievements = playerAchievements
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
    { variant: "verde" | "rosso" | "grigio"; icon: React.ComponentType<{ size?: number; className?: string }> }
  > = {
    WIN: { variant: "verde", icon: Trophy },
    DRAW: { variant: "grigio", icon: Minus },
    LOSS: { variant: "rosso", icon: Trophy },
  };

  return (
    <main className="min-h-screen bg-bgPrimary text-textPrimary pb-32 md:pb-10">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* 1) Header */}
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Ciao, <span className="text-greenElectric">{playerProfile.nickname}</span>.
          </h1>
          <small className="text-sm text-textMuted font-medium">
            Pronto per la prossima partita?
          </small>
        </header>

        {/* 2) Main PlayerCard */}
        <section className="flex justify-center">
          <PlayerCard
            nickname={playerProfile.nickname}
            role={playerProfile.primaryRole as Role}
            overall={playerProfile.overall}
            level={playerProfile.level}
            careerIndex={playerProfile.careerIndex}
            careerIndexChange={lastCiChange || undefined}
            attributes={attributes}
            premiumBadge={isPro}
            size="lg"
            highlighted
          />
        </section>

        {/* 3) Career Index card */}
        <section>
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-greenPrimary/15 border border-greenPrimary/30 flex items-center justify-center">
                    <Zap size={20} className="text-greenPrimary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Career Index</CardTitle>
                    <p className="text-xs text-textMuted mt-0.5">
                      Ultime {ciChartData.length} rilevazioni
                    </p>
                  </div>
                </div>
                <div className="flex items-end gap-4 flex-wrap">
                  <div>
                    <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-1">
                      Attuale
                    </div>
                    <div
                      className="text-3xl font-black tabular-nums"
                      style={{ color: "#7CFF6B" }}
                    >
                      {playerProfile.careerIndex}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-1">
                      Ultima variazione
                    </div>
                    <div
                      className={`flex items-center gap-1 text-lg font-bold tabular-nums ${
                        lastCiChange >= 0 ? "text-greenPrimary" : "text-danger"
                      }`}
                    >
                      {lastCiChange >= 0 ? (
                        <TrendingUp size={16} strokeWidth={2.5} />
                      ) : (
                        <TrendingDown size={16} strokeWidth={2.5} />
                      )}
                      <span>
                        {lastCiChange >= 0 ? "+" : ""}
                        {lastCiChange}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-1">
                      Trend 30g
                    </div>
                    <div
                      className={`flex items-center gap-1 text-lg font-bold tabular-nums ${
                        trend30dPositive ? "text-greenPrimary" : "text-danger"
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

        {/* 4) Quick Stats grid */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Card>
              <CardContent className="p-4 md:p-5">
                <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-1.5">
                  Partite
                </div>
                <div className="text-2xl md:text-3xl font-black text-textPrimary tabular-nums">
                  {playerProfile.matchesPlayed}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 md:p-5">
                <div className="text-[10px] font-semibold text-greenPrimary uppercase tracking-wider mb-1.5">
                  Vittorie
                </div>
                <div className="text-2xl md:text-3xl font-black text-greenPrimary tabular-nums">
                  {playerProfile.wins}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 md:p-5">
                <div className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider mb-1.5">
                  Gol
                </div>
                <div className="text-2xl md:text-3xl font-black text-yellow-400 tabular-nums">
                  {playerProfile.goals}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 md:p-5">
                <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1.5">
                  Assist
                </div>
                <div className="text-2xl md:text-3xl font-black text-blue-400 tabular-nums">
                  {playerProfile.assists}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2 md:col-span-2">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
                    Win Rate
                  </div>
                  <div className="text-sm font-bold text-textPrimary tabular-nums">
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

        {/* 5) Recent Matches lista */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-greenPrimary/15 border border-greenPrimary/30 flex items-center justify-center">
                    <Trophy size={20} className="text-greenPrimary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Partite recenti</CardTitle>
                    <p className="text-xs text-textMuted mt-0.5">
                      Ultime {recentMatches.length} partite
                    </p>
                  </div>
                </div>
                <Link
                  href="/matches"
                  className="flex items-center gap-1 text-xs font-semibold text-greenElectric hover:text-greenPrimary transition-colors"
                >
                  Vedi tutte
                  <ChevronRight size={14} />
                </Link>
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
                  const style = resultStyles[match.result as MatchResult];
                  const ResIcon = style.icon;
                  const ciPos = match.careerIndexChange >= 0;
                  return (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="block group"
                    >
                      <div
                        className="flex items-center gap-3 md:gap-4 rounded-xl p-3 md:p-4 bg-white/5 border border-transparent hover:border-greenPrimary/20 hover:bg-white/[0.07] transition-all duration-200"
                      >
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
                            {format(new Date(match.playedAt), "dd/MM")}
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

        {/* 6) Next Achievement progress */}
        <section>
          <div className="mb-3">
            <div className="flex items-center gap-2.5">
              <Award size={18} className="text-greenElectric" />
              <h2 className="text-sm font-bold text-textMuted uppercase tracking-wider">
                Prossimo obiettivo
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

        {/* 7) Current Season card */}
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

        {/* 7bis) Next Goal */}
        <section>
          <NextGoalModule
            input={{
              matchesPlayed: summary.matchesPlayed,
              wins: summary.wins,
              goals: summary.goals,
              assists: summary.assists,
              level: summary.level,
              careerIndex: summary.careerIndex,
              isPro: isPro,
            }}
            isPro={isPro}
          />
        </section>

        {/* 8) Multiplayer Card bloccata */}
        <section>
          <MultiplayerComingSoonCard />
        </section>
      </div>

      <InstallPWAButton />
      {/* 9) MobileBottomNav */}
      <MobileBottomNav />
    </main>
  );
}
