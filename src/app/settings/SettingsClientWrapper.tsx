'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Loader2, Check, Crown, AlertTriangle, Trash2, Eye, EyeOff, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { canChangeUsername as _ccU, CARD_THEMES, CardTheme } from '@/lib/username-config';

interface InitialProfile {
  username: string;
  nickname: string;
  isPublic: boolean;
  showCity: boolean;
  cardTheme: CardTheme;
  primaryRole: string;
  secondaryRole: string | null;
  preferredFoot: string | null;
  country: string | null;
  city: string | null;
  canChangeUsername: boolean;
  daysLeftUsername: number;
  nextUsernameChangeISO: string | null;
  canChangeRole: boolean;
  daysLeftRole: number;
  nextRoleChangeISO: string | null;
  isPro: boolean;
}

interface Props {
  initialProfile: InitialProfile;
  initialRoleLabels: Record<string, string>;
  initialFootLabels: Record<string, string>;
}

const THEME_LABELS: Record<CardTheme, { name: string; accent: string; desc: string }> = {
  CLASSIC: { name: 'Classic', accent: 'from-greenPrimary to-greenElectric', desc: 'Tema standard CalcettoXP.' },
  NIGHT: { name: 'Night', accent: 'from-sky-500 to-cyan-400', desc: 'Blu navy con accento ciano.' },
  ELITE: { name: 'Elite', accent: 'from-yellow-500 to-amber-300', desc: 'Nero profondo con dettagli oro.' },
  NEON: { name: 'Neon', accent: 'from-emerald-400 via-cyan-400 to-fuchsia-500', desc: 'Glow multicolor elettrico.' },
};

export function SettingsClientWrapper({ initialProfile }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();

  const isPro = initialProfile.isPro;

  const [usernameInput, setUsernameInput] = useState(initialProfile.username);
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'reserved'
  >('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSaved, setUsernameSaved] = useState(false);

  const [isPublic, setIsPublic] = useState<boolean>(initialProfile.isPublic);
  const [showCity, setShowCity] = useState<boolean>(initialProfile.showCity);
  const [cardTheme, setCardTheme] = useState<CardTheme>(initialProfile.cardTheme);

  const [globalMsg, setGlobalMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const checkTimer = useRef<number | null>(null);

  async function checkUsernameAvailability(value: string) {
    const desired = value.trim().toLowerCase();
    if (!desired) {
      setUsernameStatus('invalid');
      return;
    }
    if (desired === initialProfile.username) {
      setUsernameStatus('idle');
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(desired)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    try {
      const res = await fetch(`/api/username-check?username=${encodeURIComponent(desired)}`);
      const data = await res.json().catch(() => ({}));
      if (data.available) {
        setUsernameStatus('available');
      } else {
        setUsernameStatus((data.reason as any) || 'invalid');
      }
    } catch {
      setUsernameStatus('invalid');
    }
  }

  useEffect(() => {
    function onDeleteOpen() {
      setDeleteOpen(true);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('calcettoxp:delete-account-open', onDeleteOpen as any);
      return () =>
        window.removeEventListener('calcettoxp:delete-account-open', onDeleteOpen as any);
    }
  }, []);

  function debounceCheck(v: string) {
    if (checkTimer.current) window.clearTimeout(checkTimer.current);
    checkTimer.current = window.setTimeout(() => {
      checkUsernameAvailability(v);
    }, 350);
  }

  function saveProfile() {
    startTransition(async () => {
      try {
        setGlobalMsg(null);
        setUsernameError(null);
        const body: Partial<{
          isPublic: boolean;
          showCity: boolean;
          cardTheme: CardTheme;
          username: string;
          nickname: string;
          country: string | null;
          city: string | null;
          preferredFoot: string | null;
          primaryRole: string;
          secondaryRole: string | null;
        }> = {
          isPublic,
          showCity,
          cardTheme,
        };
        const desired = usernameInput.trim().toLowerCase();
        if (desired && desired !== initialProfile.username) {
          if (!/^[a-z0-9_]{3,20}$/.test(desired)) {
            setUsernameError('Formato username non valido.');
            return;
          }
          body.username = desired;
        }

        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setGlobalMsg({ type: 'err', text: data?.error || 'Impossibile salvare.' });
          return;
        }
        if (body.username) {
          setUsernameSaved(true);
          setTimeout(() => setUsernameSaved(false), 3000);
        }
        setGlobalMsg({ type: 'ok', text: 'Impostazioni salvate.' });
        router.refresh();
      } catch {
        setGlobalMsg({ type: 'err', text: 'Errore di rete. Riprova.' });
      }
    });
  }

  async function handleDeleteAccountConfirm() {
    if (deleteConfirm.trim() !== 'ELIMINA DEFINITIVAMENTE') {
      setDeleteErr('Scrivi esattamente: ELIMINA DEFINITIVAMENTE');
      return;
    }
    setDeleteLoading(true);
    setDeleteErr(null);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteErr(data?.message || 'Eliminazione fallita.');
        setDeleteLoading(false);
        return;
      }
      await signOut({ redirect: false });
      if (typeof window !== 'undefined') {
        window.location.href = '/?goodbye=1';
      }
    } catch {
      setDeleteErr('Errore di rete. Riprova.');
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profilo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-textPrimary">
              Username pubblico
            </label>
            <div className="relative">
              <Input
                id="username"
                value={usernameInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setUsernameInput(v);
                  setUsernameSaved(false);
                  debounceCheck(v);
                }}
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="es. andreavivace"
                aria-describedby="username-hint username-status"
                disabled={!initialProfile.canChangeUsername}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                {usernameSaved ? (
                  <Check className="w-4 h-4 text-greenPrimary" aria-label="Salvato" />
                ) : usernameStatus === 'checking' ? (
                  <Loader2 className="w-4 h-4 text-textMuted animate-spin" aria-label="Controllo in corso" />
                ) : usernameStatus === 'available' ? (
                  <Check className="w-4 h-4 text-greenPrimary" aria-label="Disponibile" />
                ) : null}
              </div>
            </div>
            <p id="username-status" className="text-xs">
              {!initialProfile.canChangeUsername ? (
                <span className="text-textMuted">
                  Puoi cambiare username tra {initialProfile.daysLeftUsername} giorni.
                </span>
              ) : usernameStatus === 'invalid' ? (
                <span className="text-danger">
                  3-20 caratteri minuscoli, lettere, numeri o underscore.
                </span>
              ) : usernameStatus === 'reserved' ? (
                <span className="text-danger">Questo username non è disponibile.</span>
              ) : usernameStatus === 'taken' ? (
                <span className="text-danger">Questo username è già utilizzato.</span>
              ) : usernameStatus === 'available' ? (
                <span className="text-greenPrimary">Username disponibile.</span>
              ) : (
                <span className="text-textMuted" id="username-hint">
                  Il tuo link pubblico sarà /p/{usernameInput.trim().toLowerCase() || initialProfile.username}
                </span>
              )}
            </p>
            {usernameError && <p className="text-xs text-danger">{usernameError}</p>}
          </div>

          <div className="space-y-3 pt-2">
            <ToggleRow
              id="is-public"
              title="Profilo pubblico"
              description={
                isPublic
                  ? 'Chiunque può vedere la tua scheda, statistiche e achievement su /p/username.'
                  : 'Il tuo profilo risulterà privato agli altri visitatori.'
              }
              checked={isPublic}
              onCheckedChange={setIsPublic}
              iconOn={<Eye className="w-4 h-4" aria-hidden />}
              iconOff={<EyeOff className="w-4 h-4" aria-hidden />}
            />
            <ToggleRow
              id="show-city"
              title="Mostra città nel profilo pubblico"
              description={
                showCity
                  ? `La tua città "${initialProfile.city || 'n.d.'}" sarà visibile nei profili pubblici.`
                  : 'La città non sarà mostrata nel profilo pubblico.'
              }
              checked={showCity}
              onCheckedChange={setShowCity}
              iconOn={<MapPin className="w-4 h-4" aria-hidden />}
              iconOff={<MapPin className="w-4 h-4 opacity-40" aria-hidden />}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm font-medium text-textPrimary flex items-center gap-2">
                  Tema carta giocatore
                  <BadgePro isPro={!!isPro} />
                </p>
                <p className="text-xs text-textMuted">
                  Personalizzazione visiva PRO. I numeri della carta non cambiano.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CARD_THEMES.map((t) => {
                const cfg = THEME_LABELS[t];
                const locked = !isPro && t !== 'CLASSIC';
                const selected = cardTheme === t;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={locked || isPending}
                    onClick={() => setCardTheme(t)}
                    aria-pressed={selected}
                    className={`group relative rounded-2xl p-3 text-left border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary ${
                      selected
                        ? 'border-greenElectric bg-bgCard/80'
                        : 'border-white/10 bg-bgSecondary/40 hover:bg-bgSecondary'
                    } ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div
                      className={`h-14 w-full rounded-xl bg-gradient-to-br ${cfg.accent} opacity-90 mb-2 shadow-inner`}
                      aria-hidden
                    />
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-textPrimary text-sm">{cfg.name}</p>
                      {locked ? (
                        <Crown className="w-4 h-4 text-textMuted" aria-label="Funzione PRO" />
                      ) : selected ? (
                        <Check className="w-4 h-4 text-greenElectric" aria-hidden />
                      ) : null}
                    </div>
                    <p className="text-[11px] text-textMuted mt-0.5 line-clamp-2">{cfg.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {globalMsg && (
            <div
              className={`rounded-xl p-3 text-sm border ${
                globalMsg.type === 'ok'
                  ? 'bg-greenPrimary/10 border-greenPrimary/30 text-greenPrimary'
                  : 'bg-danger/10 border-danger/30 text-danger'
              }`}
              role="status"
            >
              {globalMsg.text}
            </div>
          )}

          <div className="pt-2">
            <Button onClick={saveProfile} variant="primary" size="md" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Salvataggio...
                </>
              ) : (
                'Salva modifiche'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="max-w-md w-full rounded-3xl bg-bgCard border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-danger" aria-hidden />
              </div>
              <div className="space-y-1">
                <h3 id="delete-title" className="text-xl font-black text-textPrimary">
                  Eliminare l&apos;account?
                </h3>
                <p className="text-sm text-textMuted">
                  Questa azione è irreversibile. Cancelliamo tutti i tuoi dati CalcettoXP e, se
                  presente, disattiviamo l&apos;abbonamento Stripe attivo.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="delete-confirm" className="block text-xs font-medium text-textPrimary">
                Scrivi <span className="text-danger font-bold">ELIMINA DEFINITIVAMENTE</span> per
                confermare:
              </label>
              <Input
                id="delete-confirm"
                value={deleteConfirm}
                onChange={(e) => {
                  setDeleteConfirm(e.target.value);
                  setDeleteErr(null);
                }}
                placeholder="ELIMINA DEFINITIVAMENTE"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                disabled={deleteLoading}
              />
              {deleteErr && <p className="text-xs text-danger">{deleteErr}</p>}
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteConfirm('');
                  setDeleteErr(null);
                }}
                disabled={deleteLoading}
              >
                Annulla
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccountConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Eliminazione...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" aria-hidden /> Elimina per sempre
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  iconOn,
  iconOff,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  iconOn: React.ReactNode;
  iconOff: React.ReactNode;
}) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-3 rounded-2xl p-3 bg-bgSecondary/60 border border-white/5">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-bgCard border border-white/5 flex items-center justify-center text-greenElectric">
          {checked ? iconOn : iconOff}
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <label htmlFor={id} className="block text-sm font-semibold text-textPrimary cursor-pointer">
            {title}
          </label>
          <p className="text-xs text-textMuted">{description}</p>
        </div>
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={`relative shrink-0 inline-flex h-7 w-12 items-center rounded-full transition border ${
          checked ? 'bg-greenPrimary border-greenElectric/60' : 'bg-white/5 border-white/10'
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenElectric`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-bgPrimary transition shadow-sm ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
          aria-hidden
        />
      </button>
    </div>
  );
}

function BadgePro({ isPro }: { isPro: boolean }) {
  if (isPro) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-greenPrimary/10 border border-greenPrimary/30 text-greenPrimary font-bold">
      <Crown className="w-3 h-3" aria-hidden /> PRO
    </span>
  );
}
