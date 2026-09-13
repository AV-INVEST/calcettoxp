'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Smartphone, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }
}

const DISMISS_KEY = 'calcettoxp-pwa-dismissed';
const STRONG_SHOWN_KEY = 'calcettoxp-pwa-strong-shown';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

type BannerVariant = 'soft' | 'strong';

interface Props {
  className?: string;
  variant?: BannerVariant;
  forceStrong?: boolean;
}

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  const isMacLike = /Macintosh|MacIntel|MacPPC|Mac68K/.test(ua);
  const hasTouch = navigator.maxTouchPoints != null && navigator.maxTouchPoints > 1;
  const isIPadOS = !!isMacLike && !!hasTouch;
  return !!(isIOS || isIPadOS);
}

export function InstallPWAButton({
  className,
  variant = 'soft',
  forceStrong = false,
}: Props) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const actualVariant: BannerVariant = forceStrong ? 'strong' : variant;

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
    try {
      if (forceStrong) {
        window.localStorage.setItem(STRONG_SHOWN_KEY, '1');
      }
    } catch {
      /* ignore */
    }
  }, [forceStrong]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any)?.standalone === true ||
      (window.navigator as any)?.standalone === 'yes'
    ) {
      setInstalled(true);
      return;
    }

    try {
      const dismissedRaw = window.localStorage.getItem(DISMISS_KEY);
      if (dismissedRaw) {
        const dismissedAt = parseInt(dismissedRaw, 10);
        if (!Number.isNaN(dismissedAt)) {
          const elapsed = Date.now() - dismissedAt;
          if (elapsed < DISMISS_COOLDOWN_MS) {
            return;
          }
        }
      }
      if (forceStrong) {
        const strongShown = window.localStorage.getItem(STRONG_SHOWN_KEY);
        if (strongShown === '1') {
          return;
        }
      }
    } catch {
      /* ignore */
    }

    const onBeforePrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferred(e);
      setShowIOSInstructions(false);
      setVisible(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
      try {
        if (forceStrong) {
          window.localStorage.setItem(STRONG_SHOWN_KEY, '1');
        }
      } catch {
        /* ignore */
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforePrompt as any);
    window.addEventListener('appinstalled', onInstalled);

    const ios = isIOSSafari();
    const idTimeout = window.setTimeout(() => {
      if (ios && !deferred) {
        setShowIOSInstructions(true);
        setVisible(true);
      }
    }, 1800);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforePrompt as any);
      window.removeEventListener('appinstalled', onInstalled);
      window.clearTimeout(idTimeout);
    };
  }, [forceStrong, deferred]);

  async function handleInstall() {
    if (showIOSInstructions) {
      try {
        if (forceStrong) {
          window.localStorage.setItem(STRONG_SHOWN_KEY, '1');
        }
      } catch {
        /* ignore */
      }
      setVisible(false);
      return;
    }
    if (!deferred) return;
    setLoading(true);
    try {
      await deferred.prompt();
      try {
        const choice = await (deferred as any).userChoice;
        if (forceStrong && choice?.outcome) {
          window.localStorage.setItem(STRONG_SHOWN_KEY, '1');
        }
      } catch {
        /* ignore */
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setVisible(false);
    }
  }

  if (installed || !visible) return null;

  const titles: Record<BannerVariant, string> = {
    soft: 'Aggiungi CalcettoXP alla Home',
    strong: 'La tua carriera è iniziata.',
  };
  const subtitles: Record<BannerVariant, string> = {
    soft: 'Aprila in un tap, come un\'app.',
    strong: 'Tieni CalcettoXP sempre a portata di tap.',
  };
  const ctaLabel = showIOSInstructions ? 'HO CAPITO' : 'AGGIUNGI ALLA HOME';
  const IconCTA = showIOSInstructions ? Plus : Smartphone;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-labelledby="pwa-title"
      className={`fixed z-[55] left-1/2 -translate-x-1/2 bottom-24 sm:bottom-6 w-[calc(100%-1.5rem)] sm:w-auto max-w-md rounded-2xl border border-greenPrimary/20 bg-bgCard/95 backdrop-blur-xl shadow-2xl px-4 py-3 sm:px-5 sm:py-4 ${
        className || ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-greenPrimary/10 border border-greenPrimary/20 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-greenElectric" aria-hidden />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p id="pwa-title" className="text-sm sm:text-base font-bold text-textPrimary">
            {titles[actualVariant]}
          </p>
          <p className="text-xs sm:text-sm text-textMuted">
            {subtitles[actualVariant]}
          </p>
          {showIOSInstructions && (
            <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-3 space-y-1.5 text-xs text-textMuted">
              <p className="font-semibold text-textPrimary mb-1.5">
                Come aggiungere a Home:
              </p>
              <div className="flex items-center gap-2">
                <Share className="w-3.5 h-3.5 text-greenElectric shrink-0" aria-hidden />
                <span>1. Tocca il pulsante <b className="text-textPrimary">Condividi</b> in basso</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-greenElectric shrink-0" aria-hidden />
                <span>2. Scorri e tocca <b className="text-textPrimary">Aggiungi a Home</b></span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-greenElectric shrink-0" aria-hidden />
                <span>3. Infine tocca <b className="text-textPrimary">Aggiungi</b></span>
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Chiudi suggerimento aggiungi a home"
          className="shrink-0 w-8 h-8 rounded-lg hover:bg-white/5 text-textMuted hover:text-textPrimary flex items-center justify-center transition"
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={dismiss}>
          Più tardi
        </Button>
        <Button variant="primary" size="sm" onClick={handleInstall} disabled={loading}>
          <IconCTA className="w-4 h-4 mr-1.5" aria-hidden />
          {loading ? 'In corso...' : ctaLabel}
        </Button>
      </div>
    </div>
  );
}
