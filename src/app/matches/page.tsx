import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getSeasonKeyInfo } from "@/lib/seasons";
import { hasActivePro } from "@/lib/entitlements";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Trophy, Lock, Target, Zap, TrendingUp, TrendingDown, Minus, Calendar, Crown } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partite | CalcettoXP",
  description: "Storico partite registrate nella tua carriera CalcettoXP.",
  robots: { index: false, follow: false },
};

const RESULT_LABELS: Record<string, { label: string; variant: "verde" | "rosso" | "grigio" }> = {
  WIN: { label: "V", variant: "verde" },
  DRAW: { label: "P", variant: "grigio" },
  LOSS: { label: "S", variant: "rosso" },
};

const ROLE_SHORT: Record<string, string> = {
  POR: "POR",
  DIF: "DIF",
  CEN: "CEN",
  ATT: "ATT",
};

type MatchWithRel = {
  id: string;
  playedAt: Date;
  result: string;
  goalsFor: number;
  goalsAgainst: number;
  role: string;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  careerIndexChange: number;
  xpEarned: number;
  lockedAt: Date | null;
  seasonKey: string | null;
  isVerified: boolean;
  verificationType: string;
};

export default async function MatchesListPage() {
  const session = await auth();
  if (!session?.user?.userId) redirect("/signin");

  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.user.userId },
    select: { id: true, currentSeasonKey: true },
  });

  if (!player) redirect("/onboarding");

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.userId },
    select: { subscriptionStatus: true, currentPeriodEnd: true },
  });

  const isPro = hasActivePro(sub ?? undefined);
  const currentSeason = getSeasonKeyInfo().seasonKey;
  const seasonToFilter = isPro ? undefined : currentSeason;

  const matchesRaw = await prisma.match.findMany({
    where: {
      playerId: player.id,
      ...(seasonToFilter ? { seasonKey: seasonToFilter } : {}),
    },
    orderBy: { playedAt: "desc" },
  });

  const matches: MatchWithRel[] = matchesRaw;

  const groups = new Map<string, MatchWithRel[]>();
  for (const m of matches) {
    const key = format(new Date(m.playedAt), "yyyy-MM-dd");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }

  const uniqueSeasonKeys = new Set<string>();
  matches.forEach((m) => {
    if (m.seasonKey) uniqueSeasonKeys.add(m.seasonKey);
  });
  const seasonKeys = Array.from(uniqueSeasonKeys).sort().reverse();

  return (
    <div className="flex min-h-screen flex-col bg-bgPrimary">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-bgCard/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Trophy size={22} className="text-greenElectric shrink-0" />
              <h1 className="truncate text-xl font-black text-textPrimary">
                Le mie partite
              </h1>
            </div>
            <p className="mt-0.5 truncate text-xs text-textMuted">
              {matches.length} partite registrate
              {!isPro && (
                <span className="ml-2 inline-flex items-center gap-1 text-yellow-400/80">
                  · Stagione corrente
                </span>
              )}
            </p>
          </div>

          {!isPro && (
            <Link
              href="/pricing"
              className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-xs font-bold text-yellow-400 hover:bg-yellow-400/20 transition md:flex"
            >
              <Crown size={14} />
              PRO
            </Link>
          )}
        </div>

        {seasonKeys.length > 1 && isPro && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:px-6">
            {seasonKeys.map((sk) => (
              <Badge
                key={sk}
                variant={sk === currentSeason ? "elettrico" : "grigio"}
                className="shrink-0"
              >
                Stagione {sk}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        <PageContainer className="pb-32 space-y-6">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bgSecondary text-textMuted">
                  <Trophy size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-textPrimary">
                    Nessuna partita ancora
                  </h3>
                  <p className="mt-1 text-sm text-textMuted">
                    Inizia a registrare le tue partite per tracciare progressi e statistiche.
                  </p>
                </div>
                <Link
                  href="/matches/new"
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-greenPrimary px-5 py-2.5 text-sm font-bold text-bgPrimary hover:bg-greenPrimary/90 transition"
                >
                  <Trophy size={18} />
                  Registra la prima partita
                </Link>
              </CardContent>
            </Card>
          ) : (
            Array.from(groups.entries()).map(([dateKey, dayMatches]) => {
              const dateObj = new Date(dateKey + "T00:00:00");
              return (
                <section key={dateKey} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Calendar size={14} className="text-textMuted shrink-0" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-textMuted">
                      {format(dateObj, "EEEE d MMMM yyyy", { locale: it })}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {dayMatches.map((m) => {
                      const r = RESULT_LABELS[m.result] ?? RESULT_LABELS.DRAW;
                      const ciUp = m.careerIndexChange > 0;
                      const ciDown = m.careerIndexChange < 0;
                      return (
                        <Link
                          key={m.id}
                          href={`/matches/${m.id}`}
                          className="group block"
                        >
                          <Card className="transition-all duration-200 group-hover:border-white/15 group-hover:bg-bgCard/70">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant={r.variant}
                                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black p-0"
                                >
                                  {r.label}
                                </Badge>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-lg font-black tabular-nums text-textPrimary">
                                      {m.goalsFor} - {m.goalsAgainst}
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="grigio" className="text-[10px] px-2 py-0.5">
                                        {ROLE_SHORT[m.role] ?? m.role}
                                      </Badge>
                                      {m.cleanSheet && (
                                        <Badge variant="elettrico" className="text-[10px] px-2 py-0.5">
                                          CS
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-textMuted">
                                    <span className="inline-flex items-center gap-1">
                                      <Target size={12} className="text-greenPrimary/70" />
                                      {m.goals} gol
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <Zap size={12} className="text-greenElectric/70" />
                                      {m.assists} ass
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px]">
                                      {format(new Date(m.playedAt), "HH:mm", { locale: it })}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-1.5">
                                  <div
                                    className={`inline-flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-bold tabular-nums ${
                                      ciUp
                                        ? "bg-greenPrimary/15 text-greenPrimary"
                                        : ciDown
                                        ? "bg-danger/15 text-danger"
                                        : "bg-white/5 text-textMuted"
                                    }`}
                                  >
                                    {ciUp ? <TrendingUp size={12} /> : ciDown ? <TrendingDown size={12} /> : <Minus size={12} />}
                                    <span>
                                      {ciUp ? "+" : ""}
                                      {m.careerIndexChange} CI
                                    </span>
                                  </div>
                                  <Badge variant="elettrico" className="text-[10px] px-2 py-0.5">
                                    +{m.xpEarned} XP
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <span
                                      title="Partita registrata"
                                      className="inline-flex items-center gap-1 text-[10px] text-textMuted"
                                    >
                                      <Lock size={10} />
                                    </span>
                                    {m.isVerified ? (
                                      <Badge variant="elettrico" className="text-[9px] px-1.5 py-0.5">
                                        ✓
                                      </Badge>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </PageContainer>
      </main>

      <MobileBottomNav />
    </div>
  );
}
