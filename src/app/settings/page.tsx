import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { auth, signOut } from '@/auth';
import prisma from '@/lib/prisma';
import { hasActivePro } from '@/lib/entitlements';
import { format, differenceInDays, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SettingsClientWrapper } from './SettingsClientWrapper';
import { CookiePreferencesButton } from '@/components/legal/CookiePreferencesButton';
import { DeleteAccountTriggerButton } from './DeleteAccountTriggerButton';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

export const metadata: Metadata = {
  title: 'Impostazioni | CalcettoXP',
  description: 'Gestisci account, profilo, abbonamento, privacy e dati CalcettoXP.',
  robots: { index: false, follow: false },
};

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

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.userId || session?.user?.id;

  if (!userId) redirect('/api/auth/signin?callbackUrl=/settings');

  const [profileRes, user, subscription] = await Promise.all([
    prisma.playerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        nickname: true,
        username: true,
        isPublic: true,
        showCity: true,
        cardTheme: true,
        primaryRole: true,
        secondaryRole: true,
        preferredFoot: true,
        country: true,
        city: true,
        lastPrimaryRoleChangeAt: true,
        lastUsernameChangeAt: true,
        createdAt: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, image: true, createdAt: true },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: {
        id: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
      },
    }),
  ]);

  if (!profileRes || !user) redirect('/onboarding');

  const isPro = hasActivePro({
    subscriptionStatus: subscription?.subscriptionStatus as any,
    currentPeriodEnd: subscription?.currentPeriodEnd,
  });

  const now = new Date();
  const nextUsernameChange = profileRes.lastUsernameChangeAt
    ? addDays(new Date(profileRes.lastUsernameChangeAt), 30)
    : null;
  const canChangeUsername =
    !nextUsernameChange || now >= nextUsernameChange;
  const daysLeftUsername =
    nextUsernameChange && !canChangeUsername
      ? Math.max(1, differenceInDays(nextUsernameChange, now))
      : 0;

  const nextRoleChange = profileRes.lastPrimaryRoleChangeAt
    ? addDays(new Date(profileRes.lastPrimaryRoleChangeAt), 30)
    : null;
  const canChangeRole = !nextRoleChange || now >= nextRoleChange;
  const daysLeftRole =
    nextRoleChange && !canChangeRole
      ? Math.max(1, differenceInDays(nextRoleChange, now))
      : 0;

  const nextRoleChangeISO = nextRoleChange ? nextRoleChange.toISOString() : null;
  const nextUsernameChangeISO = nextUsernameChange ? nextUsernameChange.toISOString() : null;

  return (
    <div className="min-h-[100dvh] bg-bgPrimary pb-28 relative">
      <div className="absolute inset-0 pitch-wrapper opacity-20 pointer-events-none" aria-hidden />
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
            Impostazioni
          </h1>
          <p className="text-textMuted text-sm">
            Personalizza la tua esperienza CalcettoXP.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={`Foto profilo di ${user.name || 'utente'}`}
                    className="w-14 h-14 rounded-full border-2 border-greenPrimary/40 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-bgSecondary text-textPrimary flex items-center justify-center text-xl font-bold border border-white/10">
                    {String(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-textPrimary truncate">
                  {user.name || 'Account Google'}
                </p>
                <p className="text-sm text-textMuted truncate">{user.email}</p>
                <Badge variant="outline" size="xs" className="mt-1">
                  Accesso con Google
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <SettingsClientWrapper
          initialProfile={{
            username: profileRes.username,
            nickname: profileRes.nickname,
            isPublic: profileRes.isPublic,
            showCity: profileRes.showCity,
            cardTheme: (profileRes.cardTheme as any) || 'CLASSIC',
            primaryRole: profileRes.primaryRole,
            secondaryRole: profileRes.secondaryRole,
            preferredFoot: profileRes.preferredFoot,
            country: profileRes.country,
            city: profileRes.city,
            canChangeUsername,
            daysLeftUsername,
            nextUsernameChangeISO,
            canChangeRole,
            daysLeftRole,
            nextRoleChangeISO,
          }}
          initialRoleLabels={ROLE_LABELS}
          initialFootLabels={FOOT_LABELS}
        />

        <Card>
          <CardHeader>
            <CardTitle>Abbonamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {isPro ? (
                    <>
                      <Badge variant="primary" size="md">
                        PRO
                      </Badge>
                      <span className="text-textPrimary font-semibold">
                        Statistiche avanzate e personalizzazioni premium
                      </span>
                    </>
                  ) : (
                    <>
                      <Badge variant="outline" size="md">
                        FREE
                      </Badge>
                      <span className="text-textMuted text-sm">
                        Funzionalità core gratuite
                      </span>
                    </>
                  )}
                </div>
                {isPro && subscription?.currentPeriodEnd && (
                  <p className="text-xs text-textMuted">
                    Abbonamento valido fino al{' '}
                    <span className="text-textPrimary font-medium">
                      {format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy')}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {isPro ? (
                  <form action="/api/stripe/portal" method="POST">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 rounded-xl bg-bgSecondary border border-white/10 text-textPrimary font-semibold hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary"
                    >
                      Gestisci abbonamento
                    </button>
                  </form>
                ) : (
                  <>
                    <form action="/api/stripe/checkout" method="POST">
                      <input type="hidden" name="plan" value="monthly" />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 rounded-xl bg-greenPrimary text-bgPrimary font-bold hover:bg-greenElectric transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenElectric"
                      >
                        Passa a PRO
                      </button>
                    </form>
                    <form action="/api/stripe/checkout" method="POST">
                      <input type="hidden" name="plan" value="yearly" />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 rounded-xl bg-bgSecondary border border-white/10 text-textPrimary font-semibold hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary"
                      >
                        Annuale &euro;29,90
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-textMuted">
              Gestisci le preferenze sui cookie per il tuo browser.
            </p>
            <div>
              <CookiePreferencesButton
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 rounded-xl bg-bgSecondary border border-white/10 text-textPrimary font-semibold hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-xs text-textMuted">
              <a href="/privacy" className="hover:text-greenElectric transition">
                Privacy Policy
              </a>
              <span aria-hidden>·</span>
              <a href="/cookie-policy" className="hover:text-greenElectric transition">
                Cookie Policy
              </a>
              <span aria-hidden>·</span>
              <a href="/termini" className="hover:text-greenElectric transition">
                Termini
              </a>
              <span aria-hidden>·</span>
              <a href="/disclaimer" className="hover:text-greenElectric transition">
                Disclaimer
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <a
                href="/api/data/export"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 rounded-xl bg-bgSecondary border border-white/10 text-textPrimary font-semibold hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary"
              >
                Scarica i miei dati (JSON)
              </a>
              <DeleteAccountTriggerButton />
            </div>
            <p className="text-xs text-textMuted">
              L&apos;esportazione contiene profilo, partite, storico Career Index, stagioni,
              achievement e preferenze. L&apos;eliminazione è irreversibile: cancelleremo
              definitivamente tutti i tuoi dati CalcettoXP.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 rounded-xl bg-bgSecondary border border-white/10 text-textPrimary font-semibold hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary"
              >
                Esci dall&apos;account
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav />
    </div>
  );
}
