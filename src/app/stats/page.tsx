import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { hasActivePro } from "@/lib/entitlements";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import CareerIndexChart from "@/components/charts/CareerIndexChart";
import PersonalRecordsCard from "@/components/stats/PersonalRecordsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import {
  BarChart3,
  Trophy,
  Target,
  Footprints,
  Crown,
  Lock,
  TrendingUp,
  TrendingDown,
  Flame,
  Calendar,
  Users,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
} from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";
import Link from "next/link";
import { Role, MatchResult } from "@prisma/client";
import { formatSeasonName } from "@/lib/seasons";

export const metadata: Metadata = {
  title: "Statistiche | CalcettoXP",
  description: "Le tue statistiche CalcettoXP: partite, goal, assist, forma e Career Index.",
  robots: { index: false, follow: false },
};

const ROLE_LABELS: Record<Role, string> = {
  POR: "Portiere",
  DIF: "Difensore",
  CEN: "Centrocampista",
  ATT: "Attaccante",
};

export default async function StatsPage() {
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

  const careerIndexHistory = await prisma.careerIndexHistory.findMany({
    where: { playerProfileId: player.id },
    orderBy: { createdAt: "asc" },
    include: {
      match: {
        select: {
          result: true,
          playedAt: true,
          goals: true,
          assists: true,
          role: true,
        },
      },
    },
  });

  const playerSeasons = await prisma.playerSeason.findMany({
    where: { playerProfileId: player.id },
    orderBy: { startDate: "desc" },
  });

  const allMatches = await prisma.match.findMany({
    where: { playerId: player.id },
    orderBy: { playedAt: "desc" },
  });

  const chartData = careerIndexHistory.map((h, i) => {
    const date = h.match?.playedAt ?? h.createdAt;
    const result = h.match?.result;
    const delta = i === 0 ? 0 : h.changeValue;
    return {
      date,
      value: h.valueAfter,
      result: result as "WIN" | "DRAW" | "LOSS" | undefined,
      matchId: h.matchId ?? undefined,
      before: h.valueBefore,
      after: h.valueAfter,
      delta,
    };
  });

  const freeChartData = chartData.slice(-20);

  const currentSeason = playerSeasons[0];

  const winRate =
    player.matchesPlayed > 0
      ? Math.round((player.wins / player.matchesPlayed) * 100)
      : 0;

  function getMatchesInRange(days: number) {
    const cutoff = subDays(new Date(), days);
    return allMatches.filter((m) => new Date(m.playedAt) >= cutoff);
  }

  function calcPeriodStats(matches: typeof allMatches) {
    if (matches.length === 0) {
      return {
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        winRate: 0,
        goals: 0,
        assists: 0,
        avgGoals: 0,
        avgAssists: 0,
        ciDelta: 0,
        cleanSheets: 0,
      };
    }
    const wins = matches.filter((m) => m.result === "WIN").length;
    const draws = matches.filter((m) => m.result === "DRAW").length;
    const losses = matches.filter((m) => m.result === "LOSS").length;
    const goals = matches.reduce((s, m) => s + m.goals, 0);
    const assists = matches.reduce((s, m) => s + m.assists, 0);
    const cleanSheets = matches.filter((m) => m.cleanSheet).length;
    const sorted = [...matches].sort(
      (a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const ciDelta = last.careerIndexAfter - first.careerIndexBefore;
    return {
      matches: matches.length,
      wins,
      draws,
      losses,
      winRate: Math.round((wins / matches.length) * 100),
      goals,
      assists,
      avgGoals: +(goals / matches.length).toFixed(2),
      avgAssists: +(assists / matches.length).toFixed(2),
      ciDelta: +ciDelta.toFixed(1),
      cleanSheets,
    };
  }

  function getRoleStats() {
    const byRole = new Map<Role, typeof allMatches>();
    for (const m of allMatches) {
      if (!byRole.has(m.role)) byRole.set(m.role, []);
      byRole.get(m.role)!.push(m);
    }
    return Array.from(byRole.entries()).map(([role, matches]) => {
      const wins = matches.filter((m) => m.result === "WIN").length;
      const draws = matches.filter((m) => m.result === "DRAW").length;
      const losses = matches.filter((m) => m.result === "LOSS").length;
      const goals = matches.reduce((s, m) => s + m.goals, 0);
      const assists = matches.reduce((s, m) => s + m.assists, 0);
      return {
        role,
        label: ROLE_LABELS[role],
        matches: matches.length,
        wins,
        draws,
        losses,
        winRate: matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0,
        avgGoals: matches.length > 0 ? +(goals / matches.length).toFixed(2) : 0,
        avgAssists: matches.length > 0 ? +(assists / matches.length).toFixed(2) : 0,
      };
    });
  }

  function getRecords() {
    let maxCIUp = 0;
    let maxCIDown = 0;
    let maxGoals = 0;
    let maxAssists = 0;
    let matchMaxGoals: (typeof allMatches)[number] | null = null;
    let matchMaxAssists: (typeof allMatches)[number] | null = null;
    for (const m of allMatches) {
      if (m.careerIndexChange > maxCIUp) maxCIUp = m.careerIndexChange;
      if (m.careerIndexChange < maxCIDown) maxCIDown = m.careerIndexChange;
      if (m.goals > maxGoals) {
        maxGoals = m.goals;
        matchMaxGoals = m;
      }
      if (m.assists > maxAssists) {
        maxAssists = m.assists;
        matchMaxAssists = m;
      }
    }

    let longestWinStreak = 0;
    let currentStreak = 0;
    const sorted = [...allMatches].sort(
      (a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()
    );
    for (const m of sorted) {
      if (m.result === "WIN") {
        currentStreak++;
        longestWinStreak = Math.max(longestWinStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    let longestGoalStreak = 0;
    currentStreak = 0;
    for (const m of sorted) {
      if (m.goals > 0) {
        currentStreak++;
        longestGoalStreak = Math.max(longestGoalStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return {
      maxCIUp: +maxCIUp.toFixed(1),
      maxCIDown: +maxCIDown.toFixed(1),
      maxGoals,
      maxAssists,
      matchMaxGoalsDate: matchMaxGoals ? format(new Date(matchMaxGoals.playedAt), "dd/MM/yyyy") : null,
      matchMaxAssistsDate: matchMaxAssists ? format(new Date(matchMaxAssists.playedAt), "dd/MM/yyyy") : null,
      longestWinStreak,
      longestGoalStreak,
    };
  }

  const stats7 = isPro ? calcPeriodStats(getMatchesInRange(7)) : null;
  const stats30 = isPro ? calcPeriodStats(getMatchesInRange(30)) : null;
  const stats90 = isPro ? calcPeriodStats(getMatchesInRange(90)) : null;
  const roleStats = isPro ? getRoleStats() : null;
  const records = isPro ? getRecords() : null;

  return (
    <main className="min-h-screen bg-bgPrimary text-textPrimary pb-28">
      <div className="max-w-7xl mx-auto px-5 py-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Statistiche</h1>
          <p className="text-textMuted mt-2">
            Tutta la tua carriera a portata di mano.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-greenElectric/15 flex items-center justify-center">
                <Trophy size={16} className="text-greenElectric" />
              </div>
              <span className="text-textMuted text-xs font-semibold">Partite</span>
            </div>
            <div className="text-2xl md:text-3xl font-black tabular-nums">
              {player.matchesPlayed}
            </div>
            <div className="text-xs text-textMuted mt-1">
              <span className="text-greenPrimary">{player.wins}V</span> ·{" "}
              <span className="text-textMuted">{player.draws}P</span> ·{" "}
              <span className="text-danger">{player.losses}S</span>
            </div>
          </Card>

          <Card className="p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-greenElectric/15 flex items-center justify-center">
                <Target size={16} className="text-greenElectric" />
              </div>
              <span className="text-textMuted text-xs font-semibold">Gol</span>
            </div>
            <div className="text-2xl md:text-3xl font-black tabular-nums">
              {player.goals}
            </div>
            <div className="text-xs text-textMuted mt-1">
              {player.assists} assist
            </div>
          </Card>

          <Card className="p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-greenElectric/15 flex items-center justify-center">
                <TrendingUp size={16} className="text-greenElectric" />
              </div>
              <span className="text-textMuted text-xs font-semibold">Win Rate</span>
            </div>
            <div className="text-2xl md:text-3xl font-black tabular-nums">
              {winRate}%
            </div>
            <div className="mt-2">
              <Progress value={winRate} />
            </div>
          </Card>

          <Card className="p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-greenElectric/15 flex items-center justify-center">
                <BarChart3 size={16} className="text-greenElectric" />
              </div>
              <span className="text-textMuted text-xs font-semibold">Career Index</span>
            </div>
            <div className="text-2xl md:text-3xl font-black tabular-nums text-greenElectric">
              {player.careerIndex}
            </div>
            <div className="text-xs text-textMuted mt-1">
              OVR {player.overall} · LV {player.level}
            </div>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Andamento Career Index</CardTitle>
                <p className="text-textMuted text-sm mt-1">
                  {isPro ? "Storico completo" : "Ultimi 20 punti · Passa a PRO per lo storico completo"}
                </p>
              </div>
              {!isPro && (
                <Badge variant="grigio" className="flex items-center gap-1">
                  <Lock size={12} /> FREE
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CareerIndexChart data={isPro ? chartData : freeChartData} height={280} />
          </CardContent>
        </Card>

        {currentSeason && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{formatSeasonName(currentSeason.name)}</CardTitle>
                  <p className="text-textMuted text-sm mt-1">Stagione corrente</p>
                </div>
                <Badge variant="elettrico">
                  <Calendar size={12} className="mr-1" /> Attiva
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div className="bg-bgSecondary/60 rounded-xl p-3">
                  <div className="text-textMuted text-xs">Partite</div>
                  <div className="text-xl font-black">{currentSeason.matches}</div>
                </div>
                <div className="bg-bgSecondary/60 rounded-xl p-3">
                  <div className="text-textMuted text-xs">V/P/S</div>
                  <div className="text-xl font-black">
                    <span className="text-greenPrimary">{currentSeason.wins}</span>/
                    <span className="text-textMuted">{currentSeason.draws}</span>/
                    <span className="text-danger">{currentSeason.losses}</span>
                  </div>
                </div>
                <div className="bg-bgSecondary/60 rounded-xl p-3">
                  <div className="text-textMuted text-xs">Gol</div>
                  <div className="text-xl font-black">{currentSeason.goals}</div>
                </div>
                <div className="bg-bgSecondary/60 rounded-xl p-3">
                  <div className="text-textMuted text-xs">Assist</div>
                  <div className="text-xl font-black">{currentSeason.assists}</div>
                </div>
                <div className="bg-bgSecondary/60 rounded-xl p-3 col-span-2 md:col-span-1">
                  <div className="text-textMuted text-xs">CI Inizio → Fine</div>
                  <div className="text-lg font-black text-greenElectric">
                    {currentSeason.startCareerIndex}{" "}
                    <ChevronRight size={14} className="inline text-textMuted" />{" "}
                    {currentSeason.endCareerIndex}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-textMuted">Progressione CI nella stagione</span>
                  <span className="font-bold text-greenElectric">
                    Picco: {currentSeason.peakCareerIndex}
                  </span>
                </div>
                <Progress
                  value={Math.max(
                    0,
                    Math.min(
                      100,
                      ((currentSeason.endCareerIndex - currentSeason.startCareerIndex + 200) / 400) * 100
                    )
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {!isPro && (
          <Card className="mb-6 border-2 border-amber-500/30 relative overflow-hidden bg-gradient-to-br from-amber-500/[0.04] via-transparent to-amber-400/[0.03]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <CardContent className="px-6 py-5 md:p-8 relative">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
                <div className="flex flex-row-reverse md:flex-row md:items-start items-center gap-4 w-full">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 flex items-center justify-center shrink-0 shadow-xl shadow-amber-500/25 border border-amber-300/30 md:mr-0 ml-0 md:ml-0">
                    <Crown size={26} className="md:w-[30px] md:h-[30px] text-amber-950" />
                  </div>
                  <div className="flex-1 min-w-0 md:order-2 order-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="elettrico" className="border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.12)]">
                        <Crown size={12} className="mr-1 text-amber-300" /> PRO
                      </Badge>
                      <h3 className="text-lg md:text-xl font-black text-text-primary">
                        Passa a PRO per statistiche avanzate
                      </h3>
                    </div>
                    <ul className="text-textMuted text-xs md:text-sm mt-2 md:mt-3 space-y-1 md:space-y-1.5 grid md:grid-cols-2 gap-1">
                      <li className="flex items-center gap-2 min-w-0">
                        <CheckCircle size={13} className="md:w-[14px] md:h-[14px] text-amber-400 shrink-0" />
                        <span className="truncate">Analisi 7/30/90 giorni</span>
                      </li>
                      <li className="flex items-center gap-2 min-w-0">
                        <CheckCircle size={13} className="md:w-[14px] md:h-[14px] text-amber-400 shrink-0" />
                        <span className="truncate">Statistiche per ruolo</span>
                      </li>
                      <li className="flex items-center gap-2 min-w-0">
                        <CheckCircle size={13} className="md:w-[14px] md:h-[14px] text-amber-400 shrink-0" />
                        <span className="truncate">Record personali</span>
                      </li>
                      <li className="flex items-center gap-2 min-w-0">
                        <CheckCircle size={13} className="md:w-[14px] md:h-[14px] text-amber-400 shrink-0" />
                        <span className="truncate">Migliori streak</span>
                      </li>
                      <li className="flex items-center gap-2 min-w-0">
                        <CheckCircle size={13} className="md:w-[14px] md:h-[14px] text-amber-400 shrink-0" />
                        <span className="truncate">Andamento stagioni</span>
                      </li>
                      <li className="flex items-center gap-2 min-w-0">
                        <CheckCircle size={13} className="md:w-[14px] md:h-[14px] text-amber-400 shrink-0" />
                        <span className="truncate">Confronto stagioni</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex md:ml-4 md:shrink-0 justify-center md:justify-end w-full md:w-auto">
                  <Link href="/pricing" className="w-full md:w-auto">
                    <div
                      className="group inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-5 md:px-6 py-3 md:py-3.5 text-sm font-black uppercase tracking-wider text-amber-950 shadow-[0_0_25px_rgba(250,204,21,0.18)] transition hover:shadow-[0_0_40px_rgba(250,204,21,0.3)] active:scale-[0.99]"
                    >
                      <Crown size={15} />
                      <span>Sblocca PRO</span>
                      <ChevronRight
                        size={17}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isPro && stats7 && stats30 && stats90 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Analisi periodo</CardTitle>
              <p className="text-textMuted text-sm mt-1">Medie, delta CI e win rate per finestra temporale</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {([
                  { label: "Ultimi 7 giorni", s: stats7, days: 7 },
                  { label: "Ultimi 30 giorni", s: stats30, days: 30 },
                  { label: "Ultimi 90 giorni", s: stats90, days: 90 },
                ] as const).map(({ label, s }) => (
                  <div key={label} className="rounded-2xl bg-bgSecondary/60 p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold">{label}</span>
                      <Badge variant="grigio">{s.matches} partite</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-textMuted">Win Rate</div>
                        <div className="text-lg font-black flex items-center gap-1">
                          {s.winRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-textMuted">Delta CI</div>
                        <div
                          className={`text-lg font-black flex items-center gap-1 ${
                            s.ciDelta >= 0 ? "text-greenPrimary" : "text-danger"
                          }`}
                        >
                          {s.ciDelta >= 0 ? (
                            <ArrowUpRight size={16} />
                          ) : (
                            <ArrowDownRight size={16} />
                          )}
                          {s.ciDelta >= 0 ? "+" : ""}
                          {s.ciDelta}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-textMuted">Media gol</div>
                        <div className="text-lg font-black">{s.avgGoals}</div>
                      </div>
                      <div>
                        <div className="text-xs text-textMuted">Media assist</div>
                        <div className="text-lg font-black">{s.avgAssists}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <span className="text-greenPrimary font-bold">{s.wins}V</span>
                      <span className="text-textMuted font-bold">{s.draws}P</span>
                      <span className="text-danger font-bold">{s.losses}S</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isPro && roleStats && roleStats.length > 1 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Statistiche per ruolo</CardTitle>
              <p className="text-textMuted text-sm mt-1">Come ti comporti in ogni posizione</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {roleStats.map((r) => (
                  <div
                    key={r.role}
                    className="rounded-2xl bg-bgSecondary/60 p-4 border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="elettrico">{r.role}</Badge>
                        <span className="font-bold">{r.label}</span>
                      </div>
                      <Badge variant="grigio">{r.matches} partite</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-xs text-textMuted">Win Rate</div>
                        <div className="text-lg font-black text-greenPrimary">{r.winRate}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-textMuted">Media gol</div>
                        <div className="text-lg font-black">{r.avgGoals}</div>
                      </div>
                      <div>
                        <div className="text-xs text-textMuted">Media assist</div>
                        <div className="text-lg font-black">{r.avgAssists}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-1 text-xs justify-center">
                      <span className="text-greenPrimary font-bold">{r.wins}V</span>
                      <span className="text-textMuted font-bold">{r.draws}P</span>
                      <span className="text-danger font-bold">{r.losses}S</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isPro && records && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Record personali</CardTitle>
              <p className="text-textMuted text-sm mt-1">I tuoi migliori (e peggiori) momenti</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <RecordBox
                  icon={<TrendingUp size={18} className="text-greenElectric" />}
                  label="Maggior aumento CI"
                  value={`+${records.maxCIUp}`}
                />
                <RecordBox
                  icon={<TrendingDown size={18} className="text-danger" />}
                  label="Maggior calo CI"
                  value={`${records.maxCIDown}`}
                />
                <RecordBox
                  icon={<Target size={18} className="text-greenElectric" />}
                  label="Più gol in una partita"
                  value={`${records.maxGoals}`}
                  sub={records.matchMaxGoalsDate}
                />
                <RecordBox
                  icon={<Footprints size={18} className="text-greenElectric" />}
                  label="Più assist in una partita"
                  value={`${records.maxAssists}`}
                  sub={records.matchMaxAssistsDate}
                />
                <RecordBox
                  icon={<Flame size={18} className="text-yellow-400" />}
                  label="Streak vittorie"
                  value={`${records.longestWinStreak}`}
                  sub="consecutive"
                />
                <RecordBox
                  icon={<Flame size={18} className="text-orange-400" />}
                  label="Streak gol"
                  value={`${records.longestGoalStreak}`}
                  sub="partite consecutive"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {isPro && playerSeasons.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Andamento stagioni</CardTitle>
              <p className="text-textMuted text-sm mt-1">La tua storia stagione per stagione</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {playerSeasons.map((s) => {
                  const delta = s.endCareerIndex - s.startCareerIndex;
                  return (
                    <div
                      key={s.seasonKey}
                      className="rounded-2xl bg-bgSecondary/60 p-4 border border-white/5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
                        <div className="md:w-36">
                          <div className="font-black">{formatSeasonName(s.name)}</div>
                          <div className="text-xs text-textMuted">
                            {format(new Date(s.startDate), "MM/yy")} →{" "}
                            {format(new Date(s.endDate), "MM/yy")}
                          </div>
                        </div>
                        <div className="flex-1 grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
                          <StatMini label="Partite" value={`${s.matches}`} />
                          <StatMini
                            label="V/P/S"
                            value={`${s.wins}/${s.draws}/${s.losses}`}
                          />
                          <StatMini label="Gol" value={`${s.goals}`} />
                          <StatMini label="Assist" value={`${s.assists}`} />
                          <StatMini
                            label="CI Inizio"
                            value={`${s.startCareerIndex}`}
                          />
                          <StatMini
                            label="CI Fine"
                            value={
                              <span
                                className={
                                  delta >= 0 ? "text-greenPrimary" : "text-danger"
                                }
                              >
                                {s.endCareerIndex}
                                <span className="text-xs ml-1">
                                  ({delta >= 0 ? "+" : ""}
                                  {delta})
                                </span>
                              </span>
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {isPro && playerSeasons.length >= 2 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Confronto stagioni</CardTitle>
              <p className="text-textMuted text-sm mt-1">Metti a confronto le tue stagioni</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-textMuted text-xs uppercase tracking-wider">
                      <th className="text-left py-3 px-2">Stagione</th>
                      <th className="text-right py-3 px-2">Partite</th>
                      <th className="text-right py-3 px-2">V/P/S</th>
                      <th className="text-right py-3 px-2">Gol</th>
                      <th className="text-right py-3 px-2">Assist</th>
                      <th className="text-right py-3 px-2">CI Inizio</th>
                      <th className="text-right py-3 px-2">CI Fine</th>
                      <th className="text-right py-3 px-2">Delta</th>
                      <th className="text-right py-3 px-2">Picco</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerSeasons.map((s) => {
                      const delta = s.endCareerIndex - s.startCareerIndex;
                      return (
                        <tr
                          key={s.seasonKey}
                          className="border-b border-white/5 last:border-0"
                        >
                          <td className="py-3 px-2 font-bold">{formatSeasonName(s.name)}</td>
                          <td className="text-right py-3 px-2 tabular-nums">{s.matches}</td>
                          <td className="text-right py-3 px-2 tabular-nums">
                            <span className="text-greenPrimary">{s.wins}</span>/
                            <span className="text-textMuted">{s.draws}</span>/
                            <span className="text-danger">{s.losses}</span>
                          </td>
                          <td className="text-right py-3 px-2 tabular-nums">{s.goals}</td>
                          <td className="text-right py-3 px-2 tabular-nums">{s.assists}</td>
                          <td className="text-right py-3 px-2 tabular-nums">{s.startCareerIndex}</td>
                          <td className="text-right py-3 px-2 tabular-nums font-bold">
                            {s.endCareerIndex}
                          </td>
                          <td className="text-right py-3 px-2 tabular-nums">
                            <span
                              className={`font-bold ${
                                delta >= 0 ? "text-greenPrimary" : "text-danger"
                              }`}
                            >
                              {delta >= 0 ? "+" : ""}
                              {delta}
                            </span>
                          </td>
                          <td className="text-right py-3 px-2 tabular-nums text-greenElectric font-bold">
                            {s.peakCareerIndex}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        <section className="pt-4">
          <PersonalRecordsCard
            input={{
              profile: { careerIndex: player.careerIndex, overall: player.overall },
              matches: allMatches.map((m) => ({
                id: m.id,
                goals: m.goals,
                assists: m.assists,
                result: m.result,
                playedAt: m.playedAt,
                seasonKey: m.seasonKey,
              })),
              seasons: playerSeasons.map((ps) => ({
                seasonKey: ps.seasonKey,
                name: ps.name,
                startDate: ps.startDate,
                endDate: ps.endDate,
                matches: ps.matches,
                wins: ps.wins,
                goals: ps.goals,
                startCareerIndex: ps.startCareerIndex,
                endCareerIndex: ps.endCareerIndex,
                peakCareerIndex: ps.peakCareerIndex,
                startOverall: ps.startOverall,
                endOverall: ps.endOverall,
              })),
              isPro,
            }}
            isPro={isPro}
          />
        </section>
      </div>

      <MobileBottomNav />
    </main>
  );
}

function CheckCircle({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function RecordBox({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string | null;
}) {
  return (
    <div className="rounded-2xl bg-bgSecondary/60 p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-bgPrimary flex items-center justify-center">
          {icon}
        </div>
        <span className="text-textMuted text-xs font-semibold">{label}</span>
      </div>
      <div className="text-2xl font-black tabular-nums">{value}</div>
      {sub && <div className="text-xs text-textMuted mt-0.5">{sub}</div>}
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-textMuted uppercase tracking-wider">{label}</div>
      <div className="font-black text-sm md:text-base tabular-nums">{value}</div>
    </div>
  );
}
