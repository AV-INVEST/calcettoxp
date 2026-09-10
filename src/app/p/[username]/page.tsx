import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { calculateCardAttributes } from '@/lib/card-attributes';
import PlayerCard from '@/components/player/PlayerCard';
import CareerIndexChart from '@/components/charts/CareerIndexChart';
import Link from 'next/link';
import { Trophy, TrendingUp, Target, Users, Zap, Sparkles, ArrowRight, Crown, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { format } from 'date-fns';
import { formatCI } from '@/lib/career-index';
import { getAppBaseUrl } from '@/lib/app-url';
import { hasActivePro } from '@/lib/entitlements';
import { CARD_THEMES, type CardTheme } from '@/lib/username-config';

const APP_URL = getAppBaseUrl();

export const revalidate = 300;

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername || '').trim().toLowerCase();

  try {
    const profile = await prisma.playerProfile.findUnique({
      where: { username },
      select: {
        nickname: true,
        overall: true,
        level: true,
        isPublic: true,
        country: true,
      },
    });

    if (!profile) {
      return {
        title: 'Profilo non trovato | CalcettoXP',
        robots: { index: false, follow: false },
      };
    }

    if (!profile.isPublic) {
      return {
        title: 'Profilo privato | CalcettoXP',
        description: 'Questo profilo CalcettoXP è privato.',
        robots: { index: false, follow: false },
      };
    }

    const title = `${profile.nickname} su CalcettoXP | OVR ${profile.overall} - LV. ${profile.level}`;
    const description = `${profile.nickname}${profile.country ? ` (${profile.country})` : ''} - OVR ${profile.overall}, Livello ${profile.level}. La carriera calcistica amatoriale su CalcettoXP.`;
    const canonical = `${APP_URL.replace(/\/$/, '')}/p/${encodeURIComponent(username)}`;

    return {
      title,
      description,
      alternates: { canonical },
      robots: { index: true, follow: true },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'profile',
        siteName: 'CalcettoXP',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return { title: 'Profilo | CalcettoXP', robots: { index: false } };
  }
}

const WIN_RATE_BASE_STATS = [
  { key: 'matchesPlayed', label: 'Partite', icon: Target },
  { key: 'wins', label: 'Vittorie', icon: Trophy },
  { key: 'goals', label: 'Gol', icon: Zap },
  { key: 'assists', label: 'Assist', icon: Users },
];

function flagEmoji(country: string | null | undefined): string | null {
  if (!country || country.length !== 2) return null;
  try {
    const code = country.toUpperCase();
    const res = String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
    return res;
  } catch {
    return null;
  }
}

const ROLE_LABELS: Record<string, string> = {
  POR: 'Portiere',
  DIF: 'Difensore',
  CEN: 'Centrocampista',
  ATT: 'Attaccante',
};

const FOOT_LABELS: Record<string, string> = {
  RIGHT: 'Destro',
  LEFT: 'Mancino',
  BOTH: 'Ambipede',
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername || '').trim().toLowerCase();
  const viewerSession = await auth();

  if (!username) return notFound();

  const profileRaw = await prisma.playerProfile.findUnique({
    where: { username },
    include: {
      user: {
        select: {
          image: true,
          subscription: {
            select: {
              subscriptionStatus: true,
              currentPeriodEnd: true,
            },
          },
        },
      },
      achievements: {
        where: { unlockedAt: { not: null } },
        orderBy: { unlockedAt: 'desc' },
        take: 24,
        include: { achievement: { select: { name: true, description: true, icon: true, tier: true } } },
      },
      seasons: {
        orderBy: { startDate: 'desc' },
        take: 1,
        select: { seasonKey: true, name: true, matches: true, startCareerIndex: true, endCareerIndex: true, peakCareerIndex: true },
      },
      careerIndexHistories: {
        orderBy: { createdAt: 'asc' },
        take: 12,
        select: { valueBefore: true, valueAfter: true, changeValue: true, createdAt: true, match: { select: { id: true, result: true } } },
      },
      matches: {
        orderBy: { playedAt: 'desc' },
        take: 6,
        select: {
          careerIndexChange: true,
          result: true,
          goals: true,
          assists: true,
          playedAt: true,
          role: true,
        },
      },
    },
  });

  if (!profileRaw) return notFound();

  const avatarImage = profileRaw.user?.image ?? null;
  const ownerIsPro = hasActivePro(profileRaw.user?.subscription ?? null);
  const FREE_THEMES: readonly CardTheme[] = ['CLASSIC'];
  const rawTheme = (profileRaw.cardTheme ?? 'CLASSIC') as CardTheme;
  const effectiveCardTheme: CardTheme =
    (CARD_THEMES as readonly string[]).includes(rawTheme) &&
    (FREE_THEMES.includes(rawTheme) || ownerIsPro)
      ? rawTheme
      : 'CLASSIC';

  const profile = {
    nickname: profileRaw.nickname,
    username: profileRaw.username,
    country: profileRaw.country,
    city: profileRaw.city,
    showCity: profileRaw.showCity,
    isPublic: profileRaw.isPublic,
    preferredFoot: profileRaw.preferredFoot,
    primaryRole: profileRaw.primaryRole,
    level: profileRaw.level,
    overall: profileRaw.overall,
    careerIndex: profileRaw.careerIndex,
    matchesPlayed: profileRaw.matchesPlayed,
    wins: profileRaw.wins,
    draws: profileRaw.draws,
    losses: profileRaw.losses,
    goals: profileRaw.goals,
    assists: profileRaw.assists,
    cardTheme: profileRaw.cardTheme,
    currentSeasonKey: profileRaw.currentSeasonKey,
    createdAt: profileRaw.createdAt,
    achievements: profileRaw.achievements,
    seasons: profileRaw.seasons,
    careerIndexHistories: profileRaw.careerIndexHistories,
    matches: profileRaw.matches,
  };

  if (!profile.isPublic) {
    return (
      <div className="min-h-[100dvh] w-full bg-bgPrimary flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pitch-wrapper opacity-20 pointer-events-none" aria-hidden />
        <div className="relative z-10 max-w-md mx-auto space-y-8 py-20">
          <h1 className="text-4xl md:text-5xl font-black text-textPrimary tracking-tight">
            Questo profilo è privato.
          </h1>
          <p className="text-textMuted">
            L&apos;utente ha deciso di non condividere pubblicamente la propria carriera.
          </p>
          <Link
            href="/"
            prefetch
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-greenPrimary text-bgPrimary font-bold hover:bg-greenElectric transition"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            TORNA ALLA HOME
          </Link>
        </div>
      </div>
    );
  }

  const summaryRecent = (profile.matches || []).map((m) => ({
    careerIndexChange: m.careerIndexChange,
    result: m.result,
    goals: m.goals,
    assists: m.assists,
    playedAt: m.playedAt,
  }));

  const attributes = calculateCardAttributes({
    matchesPlayed: profile.matchesPlayed,
    wins: profile.wins,
    losses: profile.losses,
    draws: profile.draws,
    goals: profile.goals,
    assists: profile.assists,
    level: profile.level,
    xp: 0,
    careerIndex: profile.careerIndex,
    role: profile.primaryRole,
    recentMatches: summaryRecent,
  });

  const winRate = profile.matchesPlayed > 0 ? Math.round((profile.wins / profile.matchesPlayed) * 100) : 0;

  const chartData = (profile.careerIndexHistories || []).map((h) => ({
    date: h.createdAt,
    value: h.valueAfter,
    result: h.match?.result as 'WIN' | 'DRAW' | 'LOSS' | undefined,
    matchId: h.match?.id,
    before: h.valueBefore,
    after: h.valueAfter,
    delta: h.changeValue,
  }));

  return (
    <div className="min-h-[100dvh] w-full bg-bgPrimary pb-24 relative">
      <div className="absolute inset-0 pitch-wrapper opacity-20 pointer-events-none" aria-hidden />

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-16 space-y-8">
        {!viewerSession?.user?.userId && (
          <section>
            <div className="relative overflow-hidden rounded-2xl border border-greenElectric/20 bg-gradient-to-br from-greenPrimary/10 via-greenElectric/5 to-transparent p-[1px] shadow-[0_0_40px_rgba(124,255,107,0.08)]">
              <div className="rounded-[15px] bg-bgPrimary/80 backdrop-blur-sm p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-greenPrimary/25 to-greenElectric/10 border border-greenElectric/30 flex items-center justify-center">
                    <Sparkles size={20} className="text-greenElectric" />
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-black tracking-tight text-textPrimary">
                      Crea la tua Player Card gratis
                    </p>
                    <p className="text-[11px] md:text-xs text-textMuted mt-0.5">
                      Registra le partite, traccia carriera e OVR, condividi con gli amici.
                    </p>
                  </div>
                </div>
                <Link
                  href="/signin"
                  className="group shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-greenPrimary via-greenElectric to-emerald-400 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-bgPrimary shadow-[0_0_25px_rgba(124,255,107,0.25)] transition hover:shadow-[0_0_40px_rgba(124,255,107,0.4)] active:scale-[0.99]"
                >
                  <span>CREA LA TUA CARD</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-6">
          <div className="grid md:grid-cols-[auto,1fr] gap-6 items-center">
            <div className="mx-auto md:mx-0">
              <PlayerCard
                nickname={profile.nickname}
                role={profile.primaryRole}
                overall={profile.overall}
                level={profile.level}
                careerIndex={profile.careerIndex}
                attributes={attributes}
                size="md"
                highlighted
                premiumBadge={ownerIsPro}
                theme={effectiveCardTheme}
                avatarImage={avatarImage}
              />
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {flagEmoji(profile.country) && (
                    <span className="text-3xl" aria-label={`Nazionalità ${profile.country}`}>
                      {flagEmoji(profile.country)}
                    </span>
                  )}
                  <h1 className="text-3xl md:text-4xl font-black text-textPrimary tracking-tight">
                    {profile.nickname}
                  </h1>
                  {ownerIsPro && (
                    <Badge variant="elettrico" className="text-[10px]">
                      <Crown size={10} className="mr-1" /> PRO
                    </Badge>
                  )}
                </div>
                <p className="text-textMuted font-medium">@{profile.username}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge variant="success" size="sm">
                  OVR {profile.overall}
                </Badge>
                <Badge variant="outline" size="sm">
                  LV. {profile.level}
                </Badge>
                <Badge variant="primary" size="sm">
                  Career Index {formatCI(profile.careerIndex)}
                </Badge>
                {profile.primaryRole && (
                  <Badge variant="secondary" size="sm">
                    {ROLE_LABELS[profile.primaryRole] || profile.primaryRole}
                  </Badge>
                )}
                {profile.preferredFoot && (
                  <Badge variant="outline" size="sm">
                    Piede {FOOT_LABELS[profile.preferredFoot] || profile.preferredFoot}
                  </Badge>
                )}
                {profile.showCity && profile.city && (
                  <Badge variant="outline" size="sm">
                    {profile.city}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {WIN_RATE_BASE_STATS.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="bg-bgCard border border-white/5 rounded-2xl p-3 text-center">
                    <div className="flex justify-center mb-1">
                      <Icon className="w-4 h-4 text-greenElectric" aria-hidden />
                    </div>
                    <p className="text-xl font-bold text-textPrimary">
                      {String(
                        (profile as unknown as Record<string, number | string | null | undefined>)[
                          key
                        ] ?? 0
                      )}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-textMuted">{label}</p>
                  </div>
                ))}
                <div className="bg-bgCard border border-white/5 rounded-2xl p-3 text-center">
                  <div className="flex justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-greenElectric" aria-hidden />
                  </div>
                  <p className="text-xl font-bold text-textPrimary">{winRate}%</p>
                  <p className="text-[11px] uppercase tracking-wider text-textMuted">Win rate</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-greenElectric" aria-hidden />
                  Andamento Career Index
                </h2>
                <span className="text-xs text-textMuted">Ultimi punti</span>
              </div>
              {chartData.length >= 2 ? (
                <div className="w-full h-60">
                  <CareerIndexChart data={chartData} height={240} showTooltip />
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-textMuted text-sm">
                  Andamento disponibile dopo 2 partite registrate.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {profile.seasons && profile.seasons.length > 0 && (
          <section>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold text-textPrimary mb-4">Stagione corrente</h2>
                {profile.seasons.map((s) => (
                  <div key={s.seasonKey} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-textMuted">Stagione</p>
                      <p className="font-bold text-textPrimary">{s.name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-textMuted">Partite</p>
                      <p className="font-bold text-textPrimary">{s.matches}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-textMuted">CI Inizio / Fine</p>
                      <p className="font-bold text-textPrimary">
                        {s.startCareerIndex} → {s.endCareerIndex}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-textMuted">CI Picco</p>
                      <p className="font-bold text-greenElectric">{s.peakCareerIndex}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {profile.achievements && profile.achievements.length > 0 && (
          <section>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-greenElectric" aria-hidden />
                  Traguardi sbloccati
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.achievements.map((pa, i) => (
                    <div key={i} className="flex items-start gap-3 bg-bgSecondary/60 rounded-xl p-3 border border-white/5">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-greenPrimary/15 border border-greenPrimary/30 flex items-center justify-center text-greenElectric text-lg">
                        {pa.achievement.icon || '★'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-textPrimary truncate">{pa.achievement.name}</p>
                          {pa.achievement.tier === 'PRO' && (
                            <Badge size="xs" variant="primary">PRO</Badge>
                          )}
                        </div>
                        <p className="text-xs text-textMuted line-clamp-2">{pa.achievement.description}</p>
                        {pa.unlockedAt && (
                          <p className="text-[11px] text-textMuted/70 mt-1">
                            {format(new Date(pa.unlockedAt), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <footer className="pt-8 flex flex-col items-center gap-3 text-xs text-textMuted">
          <Link
            href="/"
            prefetch
            className="inline-flex items-center gap-1.5 text-[11px] text-textMuted hover:text-greenElectric transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            <span>← Home</span>
          </Link>
          <p>
            <Link href="/" className="hover:text-greenElectric transition">
              CalcettoXP
            </Link>{' '}
            · Gioca → Registra → Evolvi.
          </p>
        </footer>
      </main>
    </div>
  );
}
