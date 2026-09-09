import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { hasActivePro } from "@/lib/entitlements";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import EditProfileModalWrapper from "@/components/profile/EditProfileModalWrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  User as UserIcon,
  Crown,
  MapPin,
  Flag,
  Calendar,
  Footprints,
  Target,
  Trophy,
  Award,
  TrendingUp,
  Shield,
  Pencil,
  CalendarDays,
  ChevronRight,
  Star,
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

  const currentSeason = player.seasons[0];
  const visibleSeasons = isPro ? player.seasons : player.seasons.slice(0, 1);

  return (
    <main className="min-h-screen bg-bgPrimary text-textPrimary pb-28">
      <div className="max-w-7xl mx-auto px-5 py-6 md:py-10">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Il tuo profilo</h1>
            <p className="text-textMuted mt-2">
              Ecco come appari nel mondo di CalcettoXP.
            </p>
          </div>
          {isPro && (
            <Badge variant="elettrico" className="shrink-0">
              <Crown size={12} className="mr-1" /> PRO
            </Badge>
          )}
        </div>

        <Card className="mb-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-greenElectric/20 via-greenPrimary/10 to-transparent" />
          <CardContent className="p-5 md:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-greenElectric via-greenPrimary to-greenElectric/30 opacity-70 blur-[1px]" />
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-bgCard border-2 border-greenElectric/40 flex items-center justify-center overflow-hidden shadow-xl shadow-greenElectric/10">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon size={40} className="text-greenElectric/70" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-bgCard border-2 border-bgPrimary flex items-center justify-center shadow-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-greenElectric to-greenPrimary flex items-center justify-center text-bgPrimary font-black text-sm">
                    {player.overall}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight truncate">
                    {player.nickname}
                  </h2>
                  {isPro && (
                    <Badge variant="elettrico" className="text-[10px]">
                      <Crown size={10} className="mr-1" /> PRO
                    </Badge>
                  )}
                </div>
                {user?.name && user.name !== player.nickname && (
                  <p className="text-textMuted text-sm mb-2">{user.name}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-textMuted">
                  <span className="flex items-center gap-1.5">
                    <span className="text-lg leading-none">
                      {countryFlagEmoji(player.country)}
                    </span>
                    {player.country || "Nazionalità non impostata"}
                  </span>
                  {player.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} /> {player.city}
                    </span>
                  )}
                  {age !== null && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} /> {age} anni
                    </span>
                  )}
                  {player.preferredFoot && (
                    <span className="flex items-center gap-1.5">
                      <Footprints size={14} /> {FOOT_LABELS[player.preferredFoot]}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="verde" className="text-xs">
                    {player.primaryRole} · {ROLE_LABELS[player.primaryRole]}
                  </Badge>
                  {player.secondaryRole && (
                    <Badge variant="grigio" className="text-xs">
                      {player.secondaryRole} · {ROLE_LABELS[player.secondaryRole]}
                    </Badge>
                  )}
                  {player.lastPrimaryRoleChangeAt && (() => {
                    const nextAvail = new Date(player.lastPrimaryRoleChangeAt);
                    nextAvail.setDate(nextAvail.getDate() + 30);
                    const now = new Date();
                    if (nextAvail > now) {
                      return (
                        <Badge variant="grigio" className="text-[10px]">
                          <CalendarDays size={10} className="mr-1" />
                          Cambio ruolo disponibile il {format(nextAvail, "dd/MM/yy")}
                        </Badge>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              <div className="md:ml-auto flex md:flex-col gap-2 md:gap-3 items-center md:items-end">
                <div className="flex items-center gap-3 md:gap-4 bg-bgSecondary/60 rounded-2xl p-3 md:px-5 md:py-4 border border-white/5">
                  <StatPill label="LV" value={player.level} icon={<Star size={14} className="text-yellow-400" />} />
                  <div className="w-px h-8 bg-white/10 md:hidden" />
                  <StatPill
                    label="OVR"
                    value={player.overall}
                    icon={<Award size={14} className="text-greenElectric" />}
                    accent
                  />
                  <div className="w-px h-8 bg-white/10 md:hidden" />
                  <StatPill
                    label="CI"
                    value={player.careerIndex}
                    icon={<TrendingUp size={14} className="text-greenPrimary" />}
                    accent
                  />
                </div>
                <EditProfileModalWrapper
                  initial={{
                    nickname: player.nickname,
                    country: player.country,
                    city: player.city,
                    preferredFoot: player.preferredFoot,
                    primaryRole: player.primaryRole,
                    secondaryRole: player.secondaryRole,
                    birthDate: player.birthDate,
                    lastPrimaryRoleChangeAt: player.lastPrimaryRoleChangeAt,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
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

        <Card className="mb-6">
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

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Storico stagioni</CardTitle>
                <p className="text-textMuted text-sm mt-1">
                  {isPro
                    ? `Mostra ${visibleSeasons.length} ${visibleSeasons.length === 1 ? "stagione" : "stagioni"}`
                    : "Solo stagione corrente · Pass a PRO per lo storico completo"}
                </p>
              </div>
              {!isPro && (
                <Badge variant="grigio" className="flex items-center gap-1">
                  <Crown size={12} /> LOCKED
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
                        Pass a PRO
                      </span>{" "}
                      per vedere altre {player.seasons.length - 1} stagioni
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileBottomNav />
    </main>
  );
}

function StatPill({
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
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-bgPrimary rounded-lg px-2 py-1 border border-white/5">
        {icon}
        <span className="text-[10px] font-black text-textMuted uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={`text-xl font-black tabular-nums ${accent ? "text-greenElectric" : ""}`}>
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
