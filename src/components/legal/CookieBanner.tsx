'use client';

import { useEffect, useState, useCallback } from 'react';
import { Cookie, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import {
  CookieConsentPreferences,
  readConsent,
  acceptAll,
  rejectNonNecessary,
  saveCustom,
  loadOptionalScripts,
} from '@/lib/cookie-consent';
import { Button } from '@/components/ui/Button';

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [prefs, setPrefs] = useState<CookieConsentPreferences | null>(null);
  const [customize, setCustomize] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<{ analytics: boolean; marketing: boolean }>({
    analytics: false,
    marketing: false,
  });

  const close = useCallback(() => {
    setShow(false);
    setCustomize(false);
  }, []);

  const refresh = useCallback(() => {
    const c = readConsent();
    setPrefs(c);
    if (c) loadOptionalScripts(c);
  }, []);

  useEffect(() => {
    refresh();
    const t = window.setTimeout(() => {
      const c = readConsent();
      if (!c) {
        setShow(true);
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [refresh]);

  useEffect(() => {
    function onOpenPreferences() {
      const c = readConsent();
      setPrefs(c);
      setLocalPrefs({
        analytics: !!c?.analytics,
        marketing: !!c?.marketing,
      });
      setCustomize(true);
      setShow(true);
    }
    window.addEventListener('calcettoxp:open-cookie-consent', onOpenPreferences);
    window.addEventListener('calcettoxp:open-cookie-preferences', onOpenPreferences);
    return () => {
      window.removeEventListener('calcettoxp:open-cookie-consent', onOpenPreferences);
      window.removeEventListener('calcettoxp:open-cookie-preferences', onOpenPreferences);
    };
  }, []);

  function handleAcceptAll() {
    const newPrefs = acceptAll('banner');
    setPrefs(newPrefs);
    loadOptionalScripts(newPrefs);
    close();
  }

  function handleReject() {
    const newPrefs = rejectNonNecessary('banner');
    setPrefs(newPrefs);
    loadOptionalScripts(newPrefs);
    close();
  }

  function handleSaveCustom() {
    const newPrefs = saveCustom(localPrefs, 'banner');
    setPrefs(newPrefs);
    loadOptionalScripts(newPrefs);
    close();
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-modal={customize}
      aria-labelledby="cookie-title"
      className="fixed bottom-0 inset-x-0 z-[60] px-3 sm:px-6 pb-3 sm:pb-6 pt-2"
    >
      <div
        className={`mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-bgCard/95 backdrop-blur-xl shadow-2xl shadow-black/60 transition-all ${
          customize ? 'p-5 sm:p-6' : 'p-4 sm:p-5'
        }`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-greenPrimary/10 border border-greenPrimary/20 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5 text-greenElectric" aria-hidden />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h3 id="cookie-title" className="text-lg font-black text-textPrimary tracking-tight">
                Cookie &amp; privacy
              </h3>
              <p className="text-sm text-textMuted leading-relaxed">
                Usiamo solo cookie necessari per il funzionamento. Gli strumenti analitici e di
                marketing, se in futuro verranno integrati, saranno caricati <strong>solo</strong>{' '}
                dopo il tuo consenso esplicito.
              </p>
            </div>
          </div>

          {!customize && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
              <Button variant="ghost" size="md" onClick={() => setCustomize(true)}>
                Personalizza
              </Button>
              <div className="flex items-center gap-2 sm:order-none">
                <Button variant="secondary" size="md" onClick={handleReject}>
                  <X className="w-4 h-4" aria-hidden /> Rifiuta non necessari
                </Button>
                <Button variant="primary" size="md" onClick={handleAcceptAll}>
                  <Check className="w-4 h-4" aria-hidden /> Accetta tutti
                </Button>
              </div>
            </div>
          )}

          {customize && (
            <div className="space-y-4 pt-1">
              <CookieRow
                title="Necessari"
                description="Cookie di sessione e preferenze. Sempre attivi, non richiedono consenso."
                checked
                disabled
              />
              <CookieRow
                title="Analitici"
                description={
                  prefs?.analytics
                    ? 'Attualmente nessuno script è attivo. I provider futuri saranno caricati solo dopo il tuo consenso.'
                    : 'Attualmente nessuno script è attivo. Abilitando questa categoria consenti strumenti di analytics aggregata in futuro.'
                }
                checked={localPrefs.analytics}
                onCheckedChange={(v) => setLocalPrefs((p) => ({ ...p, analytics: v }))}
              />
              <CookieRow
                title="Marketing"
                description={
                  prefs?.marketing
                    ? 'Attualmente nessuno script è attivo. I provider futuri saranno caricati solo dopo il tuo consenso.'
                    : 'Attualmente nessuno script è attivo. Abilitando questa categoria consenti pixel e conversioni future.'
                }
                checked={localPrefs.marketing}
                onCheckedChange={(v) => setLocalPrefs((p) => ({ ...p, marketing: v }))}
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-1">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setCustomize(false);
                    const c = readConsent();
                    setLocalPrefs({
                      analytics: !!c?.analytics,
                      marketing: !!c?.marketing,
                    });
                  }}
                >
                  {prefs ? 'Annulla' : 'Indietro'}
                </Button>
                <div className="flex items-center gap-2 sm:order-none">
                  <Button variant="secondary" size="md" onClick={handleReject}>
                    Rifiuta non necessari
                  </Button>
                  <Button variant="primary" size="md" onClick={handleSaveCustom}>
                    Salva preferenze
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-textMuted pt-1">
                <a href="/privacy" className="hover:text-greenElectric transition underline">
                  Privacy
                </a>
                <span aria-hidden>·</span>
                <a href="/cookie-policy" className="hover:text-greenElectric transition underline">
                  Cookie policy
                </a>
              </div>
            </div>
          )}

          {!customize && (
            <button
              type="button"
              onClick={() => setCustomize(true)}
              aria-expanded="false"
              className="sr-only sm:not-sr-only sm:hidden"
            >
              personalizza
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CookieRow({
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-3 rounded-2xl p-3 bg-bgSecondary/60 border border-white/5">
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-bold text-textPrimary">{title}</p>
        <p className="text-xs text-textMuted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={`relative shrink-0 inline-flex h-7 w-12 items-center rounded-full transition border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenElectric ${
          disabled
            ? 'bg-greenPrimary/20 border-greenElectric/40 cursor-not-allowed'
            : checked
              ? 'bg-greenPrimary border-greenElectric/60'
              : 'bg-white/5 border-white/10'
        }`}
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

const _toggleIcons = { ChevronDown, ChevronUp };
export { _toggleIcons };
