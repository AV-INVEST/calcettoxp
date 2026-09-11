import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  ArrowLeft,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  Shield,
  Clock,
  StickyNote,
  AlertCircle,
} from "lucide-react";
import type { Role as PrismaRole, MatchResult as PrismaMatchResult } from "@prisma/client";

export const metadata: Metadata = {
  title: "Dettaglio partita | CalcettoXP",
  description: "Dettaglio di una partita registrata nella tua carriera CalcettoXP.",
  robots: { index: false, follow: false },
};

const RESULT_INFO: Record<string, { label: string; full: string; variant: "verde" | "rosso" | "grigio" }> = {
  WIN: { label: "VITTORIA", full: "Vittoria", variant: "verde" },
  DRAW: { label: "PAREGGIO", full: "Pareggio", variant: "grigio" },
  LOSS: { label: "SCONFITTA", full: "Sconfitta", variant: "rosso" },
};

const ROLE_LABEL: Record<string, string> = {
  POR: "Portiere",
  DIF: "Difensore",
  CEN: "Centrocampista",
  ATT: "Attaccante",
};

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.userId) redirect("/signin");

  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.user.userId },
    select: { id: true, nickname: true },
  });

  if (!player) redirect("/onboarding");

  const match = await prisma.match.findUnique({
    where: { id },
  });

  if (!match) notFound();
  if (match.playerId !== player.id) {
    redirect("/matches");
  }

  const r = RESULT_INFO[match.result] ?? RESULT_INFO.DRAW;
  const ciUp = match.careerIndexChange > 0;
  const ciDown = match.careerIndexChange < 0;

  return (
    <div className="flex min-h-screen flex-col bg-bgPrimary">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-bgCard/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 md:px-6">
          <Link
            href="/matches"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-textPrimary hover:bg-white/10 transition"
            aria-label="Torna alle partite"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-black text-textPrimary">
              Dettaglio partita
            </h1>
            <p className="truncate text-xs text-textMuted">
              {format(new Date(match.playedAt), "EEEE d MMMM yyyy · HH:mm", {
                locale: it,
              })}
              {match.seasonKey && ` · Stagione ${match.seasonKey}`}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <PageContainer className="pb-32 space-y-4">
          <div
            className={`relative overflow-hidden rounded-2xl border p-5 ${
              r.variant === "verde"
                ? "bg-gradient-to-br from-greenPrimary/20 via-greenElectric/10 to-bgCard border-greenElectric/30"
                : r.variant === "rosso"
                ? "bg-gradient-to-br from-danger/20 via-danger/5 to-bgCard border-danger/30"
                : "bg-gradient-to-br from-white/5 to-bgCard border-white/10"
            }`}
          >
            <div className="absolute -right-6 -top-6 opacity-10">
              <Trophy size={140} />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <Badge variant={r.variant} className="mb-3 text-sm px-4 py-1.5">
                {r.label}
              </Badge>
              <div className="flex items-center gap-6">
                <span className="text-6xl font-black tabular-nums text-textPrimary">
                  {match.goalsFor}
                </span>
                <span className="text-2xl font-bold text-textMuted">-</span>
                <span className="text-6xl font-black tabular-nums text-textPrimary">
                  {match.goalsAgainst}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Badge variant="grigio">{ROLE_LABEL[match.role] ?? match.role}</Badge>
                {match.cleanSheet && (
                  <Badge variant="elettrico">
                    <Shield size={12} className="mr-1" />
                    Clean Sheet
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {(match.role as string) === "POR" ? (
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-textMuted">Rigori parati</p>
                    <p className="text-xl font-bold tabular-nums text-textPrimary">
                      {(match as unknown as { penaltiesSaved?: number }).penaltiesSaved ?? 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-textMuted">Parate decisive</p>
                    <p className="text-xl font-bold tabular-nums text-textPrimary">
                      {(match as unknown as { keySaves?: number }).keySaves ?? 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-greenPrimary/15 text-greenPrimary">
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-textMuted">Gol (tuoi)</p>
                    <p className="text-xl font-bold tabular-nums text-textPrimary">
                      {match.goals}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-greenElectric/15 text-greenElectric">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-textMuted">Assist</p>
                    <p className="text-xl font-bold tabular-nums text-textPrimary">
                      {match.assists}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-textPrimary">
                Progressi partita
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[11px] text-textMuted">XP Guadagnati</p>
                  <Badge variant="elettrico" className="mt-1 text-sm px-3 py-1">
                    +{match.xpEarned}
                  </Badge>
                </div>
                <div>
                  <p className="text-[11px] text-textMuted">Career Index</p>
                  <div
                    className={`mt-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ${
                      ciUp
                        ? "bg-greenPrimary/15 text-greenPrimary"
                        : ciDown
                        ? "bg-danger/15 text-danger"
                        : "bg-white/5 text-textMuted"
                    }`}
                  >
                    {ciUp ? <TrendingUp size={14} /> : ciDown ? <TrendingDown size={14} /> : <Minus size={14} />}
                    {ciUp ? "+" : ""}
                    {match.careerIndexChange}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-textMuted">CI Before → After</p>
                  <p className="mt-1 text-sm font-bold tabular-nums text-textPrimary">
                    {match.careerIndexBefore}{" "}
                    <span className="text-textMuted">→</span>{" "}
                    {match.careerIndexAfter}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-textPrimary">Stato partita</h3>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-bgSecondary p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-textMuted">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-textPrimary">
                    Partita registrata · Non più modificabile
                  </p>
                  <p className="text-xs text-textMuted">
                    {match.verificationType === "SELF_REPORTED"
                      ? "Registrazione personale"
                      : "Confermata da altri giocatori"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-bgSecondary/60 p-3 text-xs text-textMuted">
                <Clock size={14} className="shrink-0" />
                <span>
                  Creata:{" "}
                  {format(new Date(match.createdAt), "d MMM yyyy · HH:mm", {
                    locale: it,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {match.notes && (
            <Card>
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-textPrimary">
                  <StickyNote size={16} className="text-textMuted" />
                  Note
                </div>
                <p className="rounded-xl bg-bgSecondary p-3 text-sm leading-relaxed text-textPrimary whitespace-pre-wrap">
                  {match.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </PageContainer>
      </main>

      <MobileBottomNav />
    </div>
  );
}
