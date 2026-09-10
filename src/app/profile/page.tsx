import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { hasActivePro } from "@/lib/entitlements";
import { filterVisibleAchievements } from "@/lib/achievements";
import { calculateCardAttributes } from "@/lib/card-attributes";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import EditProfileModalWrapper from "@/components/profile/EditProfileModalWrapper";
import { AlreadyProPortalButton } from "@/components/pricing/StripeButtons";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  User as UserIcon,
  Crown,
  MapPin,
  Calendar,
  Footprints,
  Target,
  Trophy,
  Award,
  TrendingUp,
  Shield,
  CalendarDays,
  ChevronRight,
  Star,
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import Link from "next/link";
import { Role, PreferredFoot } from "@prisma/client";

const ROLE_LABELS: Record<Role, string> = {
  POR: "Portiere",
  DIF: "Difensore",
  CEN: "Centrocampista",
  ATT: "Attaccante",
};

const FOOT_LABELS: Record<PreferredFoot, string> = {
  RIGHT: "Destro",
  LEFT: "Sinistro",
  BOTH: "Entrambi",
};

const PLAN_LABEL: Record<string, { label: string; price: string }> = {
  monthly: { label: "Mensile", price: "€3,90/mese" },
  yearly: { label: "Annuale", price: "€29,90/anno" },
};

function detectPlanFromPriceId(
  priceId: string | null | undefined,
  envMonthly?: string,
  envYearly?: string
): "monthly" | "yearly" | null {
  if (!priceId) return null;
  if (envMonthly && priceId === envMonthly) return "monthly";
  if (envYearly && priceId === envYearly) return "yearly";
  const lower = priceId.toLowerCase();
  if (lower.includes("year") || lower.includes("annual")) return "yearly";
  if (lower.includes("month")) return "monthly";
  return null;
}

function countryFlagEmoji(country?: string | null): string {
  if (!country) return "🌍";
  const it = /italia|italy|^it$/i.test(country.trim());
  if (it) return "🇮🇹";
  return "🏳️";
}

export const metadata: Metadata = {
  title: "Il mio profilo | CalcettoXP",
  description: "Modifica la tua scheda giocatore CalcettoXP e le tue preferenze.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.userId) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: { id: true, email: true, name: true, image: true },
  });

  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.user.userId },
    include: {
      seasons: { orderBy: { startDate: "desc" } },
      achievements: {
        include: { achievement: true },
        where: { unlockedAt: { not: null } },
        take: 6,
        orderBy: { unlockedAt: "desc" },
      },
      matches: {
        orderBy: { playedAt: "desc" },
        take: 12,
        select: {
          careerIndexChange: true,
          result: true,
          goals: true,
          assists: true,
          playedAt: true,
        },
      },
    },
  });

  if (!player) redirect("/onboarding");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.userId },
  });

  const isPro = hasActivePro(subscription);

  const winRate =
    player.matchesPlayed > 0
      ? Math.round((player.wins / player.matchesPlayed) * 100)
      : 0;

  const age = player.birthDate ? differenceInYears(new Date(), new Date(player.birthDate)) : null;

  const allAchievements = filterVisibleAchievements(
    await prisma.achievement.findMany({
      include: {
        playerAchievements: {
          where: { playerProfileId: player.id },
        },
      },
      orderBy: [{ tier: "asc" }, { requirementValue: "asc" }],
    })
  );

  const unlockedCount = allAchievements.filter(
    (a) => a.playerAchievements[0]?.unlockedAt
  ).length;

  const visibleSeasons = isPro ? player.seasons : player.seasons.slice(0, 1);

  const summaryRecent = (player.matches || []).map((m) => ({
    careerIndexChange: m.careerIndexChange,
    result: m.result,
    goals: m.goals,
    assists: m.assists,
    playedAt: m.playedAt,
  }));

  const cardAttrs = calculateCardAttributes({
    matchesPlayed: player.matchesPlayed,
    wins: player.wins,
    losses: player.losses,
    draws: player.draws,
    goals: player.goals,
    assists: player.assists,
    level: player.level,
    xp: player.xp,
    careerIndex: player.careerIndex,
    role: player.primaryRole,
    recentMatches: summaryRecent,
  });

  const planKey = detectPlanFromPriceId(
    subscription?.stripePriceId ?? null,
    process.env.STRIPE_PRICE_PRO_MONTHLY,
    process.env.STRIPE_PRICE_PRO_YEARLY
  );

  const planLabel = planKey ? PLAN_LABEL[planKey] : null;
  const cancelAtPeriodEnd = !!subscription?.cancelAtPeriodEnd;
  const currentPeriodEnd = subscription?.currentPeriodEnd;
  const disdettoAttivo = isPro && cancelAtPeriodEnd;

  return (
    <main className="min-h-screen bg-bgPrimary text-textPrimary pb-28">
      <div className="max-w-7xl mx-auto px-5 py-6 md:py-10 space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Il tuo profilo</h1>
          <p className="text-textMuted mt-2">
            Ecco come appari nel mondo di CalcettoXP.
          </p>
        </div>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-greenElectric/20 via-greenPrimary/10 to-transparent" />
          {isPro && (
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-400/10 to-transparent pointer-events-none" aria-hidden />
          )}
          <CardContent className="p-5 md:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
              <div className="relative shrink-0 mx-auto md:mx-0">
                <div className={`absolute -inset-1 rounded-full blur-[1px] ${
                  isPro
                    ? "bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600/40 opacity-70"
                    : "bg-gradient-to-br from-greenElectric via-greenPrimary to-greenElectric/30 opacity-70"
                }`} />
                <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-bgCard border-2 ${
                  isPro ? "border-amber-400/50" : "border-greenElectric/40"
                } flex items-center justify-center overflow-hidden shadow-xl ${
                  isPro ? "shadow-amber-500/15" : "shadow-greenElectric/10"
                }`}>
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon size={40} className={isPro ? "text-amber-400/70" : "text-greenElectric/70"} />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-bgCard border-2 border-bgPrimary flex items-center justify-center shadow-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-bgPrimary font-black text-sm ${
                    isPro
                      ? "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600"
                      : "bg-gradient-to-br from-greenElectric to-greenPrimary"
                  }`}>
                    {player.overall}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1 justify-center md:justify-start">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight truncate">
                    @{player.username}
                  </h2>
                  {isPro ? (
                    <Badge variant="elettrico" className="text-[10px] shadow-[0_0_15px_rgba(250,204,21,0.15)] border-amber-400/30 shrink-0">
                      <Crown size={10} className="mr-1" /> PRO
                    </Badge>
                  ) : (
                    <Badge variant="grigio" className="text-[10px] tracking-wide shrink-0">
                      FREE
                    </Badge>
                  )}
                </div>
                {user?.name && user.name !== player.username && user.name !== player.nickname && (
                  <p className="text-textMuted text-sm mb-1 md:mb-2 text-center md:text-left truncate max-w-full">
                    {user.name}
                  </p>
                )}
                {player.nickname && player.nickname !== player.username && (
                  <p className="text-textMuted text-xs mb-1 md:mb-2 text-center md:text-left opacity-70 truncate max-w-full">
                    aka {player.nickname}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 md:gap-x-4 gap-y-1 md:gap-y-1.5 text-xs md:text-sm text-textMuted">
                  <span className="flex items-center gap-1 md:gap-1.5 min-w-0">
                    <span className="text-base md:text-lg leading-none shrink-0">
                      {countryFlagEmoji(player.country)}
                    </span>
                    <span className="truncate">
                      {player.country || "Nazionalità non impostata"}
                    </span>
                  </span>
                  {player.city && (
                    <span className="flex items-center gap-1 md:gap-1.5 min-w-0">
                      <MapPin size={12} className="md:w-[14px] md:h-[14px] shrink-0" />
                      <span className="truncate">{player.city}</span>
                    </span>
                  )}
                  {age !== null && (
                    <span className="flex items-center gap-1 md:gap-1.5 shrink-0">
                      <Calendar size={12} className="md:w-[14px] md:h-[14px] shrink-0" />
                      <span>{age} anni</span>
                    </span>
                  )}
                  {player.preferredFoot && (
                    <span className="flex items-center gap-1 md:gap-1.5 shrink-0">
                      <Footprints size={12} className="md:w-[14px] md:h-[14px] shrink-0" />
                      <span>{FOOT_LABELS[player.preferredFoot]}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 md:gap-2 mt-2 md:mt-3">
                  <Badge variant="verde" className="text-[11px] md:text-xs">
                    {player.primaryRole} · {ROLE_LABELS[player.primaryRole]}
                  </Badge>
                  {player.secondaryRole && (
                    <Badge variant="grigio" className="text-[11px] md:text-xs">
                      {player.secondaryRole} · {ROLE_LABELS[player.secondaryRole]}
                    </Badge>
                  )}
                  {player.lastPrimaryRoleChangeAt && (() => {
                    const nextAvail = new Date(player.lastPrimaryRoleChangeAt);
                    nextAvail.setDate(nextAvail.getDate() + 30);
                    const now = new Date();
                    if (nextAvail > now) {
                      return (
                        <Badge variant="grigio" className="text-[9px] md:text-[10px]">
                          <CalendarDays size={10} className="mr-1" />
                          Cambio ruolo {format(nextAvail, "dd/MM/yy")}
                        </Badge>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              <div className="md:ml-auto flex md:flex-col gap-3 md:gap-3 items-stretch md:items-end w-full md:w-auto">
                {/* Mobile: 3 colonne equal width FULL-WIDTH con più padding e aria; Desktop invariato */}
                <div className="grid grid-cols-3 md:flex md:items-center gap-2 md:gap-3 lg:gap-4 bg-bgSecondary/60 rounded-2xl p-3 md:p-3 lg:px-5 lg:py-4 border border-white/5 w-full md:w-auto">
                  <div className="min-w-0">
                    <MobileStatPill label="LV" value={player.level} icon={<Star size={12} className="md:w-[14px] md:h-[14px] text-yellow-400" />} />
                  </div>
                  <div className="hidden md:block w-px h-8 bg-white/10 self-stretch" />
                  <div className="min-w-0">
                    <MobileStatPill
                      label="OVR"
                      value={player.overall}
                      icon={<Award size={12} className="md:w-[14px] md:h-[14px] text-greenElectric" />}
                      accent
                    />
                  </div>
                  <div className="hidden md:block w-px h-8 bg-white/10 self-stretch" />
                  <div className="min-w-0">
                    <MobileStatPill
                      label="CI"
                      value={player.careerIndex}
                      icon={<TrendingUp size={12} className="md:w-[14px] md:h-[14px] text-greenPrimary" />}
                      accent
                    />
                  </div>
                </div>
                <div className="w-full md:w-auto flex justify-center md:justify-end">
                  <div className="w-full md:w-auto max-w-sm md:max-w-none">
                    <EditProfileModalWrapper
                      initial={{
                        username: player.username,
                        nickname: player.nickname,
                        country: player.country,
                        city: player.city,
                        preferredFoot: player.preferredFoot,
                        primaryRole: player.primaryRole,
                        secondaryRole: player.secondaryRole,
                        birthDate: player.birthDate,
                        lastPrimaryRoleChangeAt: player.lastPrimaryRoleChangeAt,
                        lastUsernameChangeAt: player.lastUsernameChangeAt,
                        isPro,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={<Trophy size={16} className="text-greenElectric" />}
            label="Partite totali"
            value={`${player.matchesPlayed}`}
            sub={
              <span>
                <span className="text-greenPrimary">{player.wins}V</span> /{" "}
                <span className="text-textMuted">{player.draws}P</span> /{" "}
                <span className="text-danger">{player.losses}S</span>
              </span>
            }
          />
          <StatCard
            icon={<Target size={16} className="text-greenElectric" />}
            label="Gol totali"
            value={`${player.goals}`}
            sub={`${player.assists} assist`}
          />
          <StatCard
            icon={<TrendingUp size={16} className="text-greenElectric" />}
            label="Win Rate"
            value={`${winRate}%`}
            sub={<Progress value={winRate} />}
            subClass="mt-2"
          />
          <StatCard
            icon={<Shield size={16} className="text-greenElectric" />}
            label="Clean Sheets"
            value={`${player.cleanSheets}`}
            sub={player.matchesPlayed > 0 ? `${Math.round((player.cleanSheets / player.matchesPlayed) * 100)}% partite` : "-"}
          />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Achievement sbloccati</CardTitle>
                <p className="text-textMuted text-sm mt-1">
                  {unlockedCount} su {allAchievements.length} totali
                </p>
              </div>
              <Link href="/achievements" className="text-greenElectric text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Vedi tutti <ChevronRight size={16} />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {player.achievements.length === 0 ? (
              <div className="text-center py-8">
                <Award size={40} className="mx-auto text-textMuted/40 mb-3" />
                <p className="text-textMuted">Nessun achievement ancora sbloccato.</p>
                <p className="text-textMuted text-sm mt-1">
                  Inizia a registrare partite per sbloccare i tuoi primi traguardi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {player.achievements.map((pa) => (
                  <div
                    key={pa.achievementId}
                    className="rounded-xl bg-gradient-to-br from-greenPrimary/10 via-bgSecondary to-bgSecondary border border-greenElectric/20 p-4 relative overflow-hidden"
                  >
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-greenPrimary/20 border border-greenElectric/40 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7CFF6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m9 11 3 3L22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {pa.achievement.tier === "PRO" ? (
                        <Badge variant="elettrico" className="text-[9px]">
                          <Crown size={8} className="mr-0.5" /> PRO
                        </Badge>
                      ) : (
                        <Badge variant="verde" className="text-[9px]">FREE</Badge>
                      )}
                    </div>
                    <div className="font-black text-sm mt-1">{pa.achievement.name}</div>
                    <div className="text-textMuted text-xs mt-0.5 leading-snug">
                      {pa.achievement.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Storico stagioni</CardTitle>
                <p className="text-textMuted text-sm mt-1">
                  {isPro
                    ? `Mostra ${visibleSeasons.length} ${visibleSeasons.length === 1 ? "stagione" : "stagioni"}`
                    : "Solo stagione corrente · Passa a PRO per lo storico completo"}
                </p>
              </div>
              {!isPro && (
                <Badge variant="grigio" className="flex items-center gap-1">
                  <Lock size={12} /> LOCKED
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visibleSeasons.map((s) => {
                const delta = s.endCareerIndex - s.startCareerIndex;
                return (
                  <div
                    key={s.seasonKey}
                    className="rounded-2xl bg-bgSecondary/60 border border-white/5 p-4 md:p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
                      <div className="md:w-36">
                        <div className="font-black text-lg">{s.name}</div>
                        <div className="text-xs text-textMuted mt-0.5">
                          {format(new Date(s.startDate), "MMM yy")} →{" "}
                          {format(new Date(s.endDate), "MMM yy")}
                        </div>
                      </div>
                      <div className="flex-1 grid grid-cols-3 md:grid-cols-6 gap-3">
                        <MiniStat label="Partite" value={`${s.matches}`} />
                        <MiniStat
                          label="V/P/S"
                          value={
                            <span>
                              <span className="text-greenPrimary">{s.wins}</span>/
                              <span className="text-textMuted">{s.draws}</span>/
                              <span className="text-danger">{s.losses}</span>
                            </span>
                          }
                        />
                        <MiniStat label="Gol" value={`${s.goals}`} />
                        <MiniStat label="Assist" value={`${s.assists}`} />
                        <MiniStat label="CI Inizio" value={`${s.startCareerIndex}`} />
                        <MiniStat
                          label="CI Fine"
                          value={
                            <span className={delta >= 0 ? "text-greenPrimary" : "text-danger"}>
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
              {!isPro && player.seasons.length > 1 && (
                <Link href="/pricing">
                  <div className="rounded-2xl border-2 border-dashed border-white/10 hover:border-greenElectric/40 p-4 text-center transition-colors cursor-pointer group">
                    <p className="text-textMuted text-sm">
                      <span className="text-greenElectric font-semibold group-hover:underline">
                        Passa a PRO
                      </span>{" "}
                      per vedere altre {player.seasons.length - 1} stagioni
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-greenElectric/15 border border-greenElectric/25 flex items-center justify-center">
                <CreditCard size={18} className="text-greenElectric" />
              </div>
              <div>
                <CardTitle className="text-lg">Gestione abbonamento</CardTitle>
                <p className="text-textMuted text-sm mt-0.5">
                  {isPro ? "Dettagli del tuo piano PRO." : "Piano base · FREE per sempre."}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isPro ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <InfoRow
                    icon={<Crown size={14} className="text-amber-400" />}
                    label="Piano attivo"
                    value={
                      <div className="flex items-center gap-2">
                        <Badge variant="elettrico" className="text-[10px] border-amber-400/30">
                          PRO · {planLabel ? planLabel.label : "CalcettoXP"}
                        </Badge>
                        {disdettoAttivo ? (
                          <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">
                            DISDETTO
                          </Badge>
                        ) : (
                          <Badge variant="verde" className="text-[10px]">
                            <CheckCircle2 size={10} className="mr-1" /> ATTIVO
                          </Badge>
                        )}
                      </div>
                    }
                  />
                  {currentPeriodEnd && (
                    <InfoRow
                      icon={<Calendar size={14} className="text-greenElectric" />}
                      label={disdettoAttivo ? "Accesso PRO fino al" : "Prossimo rinnovo"}
                      value={
                        <span className="font-bold tabular-nums text-textPrimary">
                          {format(new Date(currentPeriodEnd), "dd MMM yyyy")}
                        </span>
                      }
                    />
                  )}
                  {planLabel && (
                    <InfoRow
                      icon={<CreditCard size={14} className="text-greenElectric/80" />}
                      label="Prezzo"
                      value={<span className="font-semibold">{planLabel.price}</span>}
                    />
                  )}
                </div>

                {disdettoAttivo && (
                  <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                      <CalendarDays size={14} className="text-amber-300" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-200 text-sm">Abbonamento disdetto</div>
                      <p className="text-textMuted text-xs mt-0.5">
                        L&lsquo;accesso PRO resterà attivo fino alla fine del periodo pagato.
                        {currentPeriodEnd && (
                          <> Dopo il <span className="text-amber-200 font-semibold">{format(new Date(currentPeriodEnd), "dd MMM yyyy")}</span> tornerai automaticamente al piano FREE.</>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-white/5 pt-5">
                  <div className="text-xs text-textMuted">
                    Fatturazione e pagamenti gestiti in sicurezza da Stripe.
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <AlreadyProPortalButton className="[&>button]:border-amber-400/30 [&>button]:text-amber-200 [&>button:hover]:bg-amber-500/10 [&>button:hover]:text-amber-100 [&>button]:shadow-none" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="grigio" className="text-[11px] tracking-wide uppercase">
                      Piano FREE
                    </Badge>
                  </div>
                  <div className="text-lg font-black text-textPrimary">Le basi della tua carriera</div>
                  <p className="text-textMuted text-sm max-w-xl">
                    Registra partite, traccia carriera e OVR, condividi la tua Player Card.
                    Passa a PRO per temi esclusivi, analytics avanzate e maggiore profondità.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Link
                    href="/pricing"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-6 py-3 text-sm font-black uppercase tracking-wider text-amber-950 shadow-[0_0_25px_rgba(250,204,21,0.18)] transition hover:shadow-[0_0_40px_rgba(250,204,21,0.32)] active:scale-[0.99]"
                  >
                    <Crown size={15} /> Scopri PRO
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="pt-4">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-bgSecondary/60 border border-white/5 hover:border-greenElectric/25 hover:bg-greenElectric/5 transition-all text-textMuted hover:text-textPrimary font-semibold"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Torna alla dashboard
          </Link>
        </div>
      </div>

      <MobileBottomNav />
    </main>
  );
}

function MobileStatPill({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-2 items-center min-w-0 w-full gap-1.5 md:gap-2">
      <div className="flex items-center gap-1 md:gap-1.5 bg-bgPrimary rounded-lg px-2 md:px-2 py-1.5 md:py-1 border border-white/5 shrink-0 max-w-full">
        {icon}
        <span className="text-[9px] md:text-[10px] font-black text-textMuted uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
      <div
        className={`text-base sm:text-lg md:text-xl font-black tabular-nums whitespace-nowrap min-w-0 w-full text-center md:text-left md:w-auto leading-tight ${
          accent ? "text-greenElectric" : "text-textPrimary"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  subClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
  subClass?: string;
}) {
  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-greenElectric/15 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-textMuted text-xs font-semibold">{label}</span>
      </div>
      <div className="text-2xl md:text-3xl font-black tabular-nums">{value}</div>
      {sub && <div className={`text-xs text-textMuted mt-1 ${subClass ?? ""}`}>{sub}</div>}
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-textMuted uppercase tracking-wider">{label}</div>
      <div className="font-black text-sm md:text-base tabular-nums">{value}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-bgSecondary/60 border border-white/5 p-4">
      <div className="flex items-center gap-2 mb-1.5 text-[11px] uppercase tracking-wider text-textMuted">
        {icon} {label}
      </div>
      <div>{value}</div>
    </div>
  );
}
