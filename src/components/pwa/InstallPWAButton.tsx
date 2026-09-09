'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
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

export function InstallPWAButton({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const dismissed = window.localStorage.getItem(DISMISS_KEY);
      if (dismissed) return;
    } catch {
      /* ignore */
    }
    if (
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any)?.standalone === true
    ) {
      setInstalled(true);
      return;
    }
    const onBeforePrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
    };
    window.addEventListener('beforeinstallprompt', onBeforePrompt as any);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforePrompt as any);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    setLoading(true);
    try {
      await deferred.prompt();
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setVisible(false);
    }
  }

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (installed || !visible || !deferred) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-labelledby="pwa-title"
      className={`fixed z-[55] left-1/2 -translate-x-1/2 bottom-24 sm:bottom-6 w-[calc(100%-1.5rem)] sm:w-auto max-w-md rounded-2xl border border-greenPrimary/20 bg-bgCard/95 backdrop-blur-xl shadow-2xl px-4 py-3 ${
        className || ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-greenPrimary/10 border border-greenPrimary/20 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-greenElectric" aria-hidden />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p id="pwa-title" className="text-sm font-bold text-textPrimary">
            Aggiungi CalcettoXP alla schermata Home
          </p>
          <p className="text-xs text-textMuted">
            Accedi come un&apos;app nativa, senza browser, con supporto offline base.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Chiudi suggerimento installazione"
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
          <Download className="w-4 h-4" aria-hidden />
          {loading ? 'Installazione...' : 'Installa'}
        </Button>
      </div>
    </div>
  );
}
