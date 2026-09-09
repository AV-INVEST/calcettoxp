"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Cookie } from "lucide-react";
import {
  CookieConsentPreferences,
  readConsent,
  rejectNonNecessary,
  loadOptionalScripts,
} from "@/lib/cookie-consent";

function lockBody(id: string) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  if (body.dataset.lockId) return;
  const scrollY = window.scrollY;
  body.style.top = `-${scrollY}px`;
  body.classList.add("body-locked", "body-locked-ios");
  html.dataset.scrollY = String(scrollY);
  body.dataset.lockId = id;
}

function unlockBody(id: string) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  if (body.dataset.lockId !== id) return;
  const scrollY = Number(html.dataset.scrollY || "0");
  body.classList.remove("body-locked", "body-locked-ios");
  body.style.top = "";
  delete body.dataset.lockId;
  if (scrollY) window.scrollTo(0, scrollY);
  delete html.dataset.scrollY;
}

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const [prefs, setPrefs] = useState<CookieConsentPreferences | null>(null);
  const LOCK_ID = "cookie-banner";
  const timerRef = useRef<number | null>(null);

  const close = useCallback(() => {
    setClosing(true);
    unlockBody(LOCK_ID);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setShow(false);
      setClosing(false);
    }, 220);
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
    }, 700);
    return () => window.clearTimeout(t);
  }, [refresh]);

  useEffect(() => {
    if (show && !closing) {
      lockBody(LOCK_ID);
    }
  }, [show, closing]);

  useEffect(() => {
    return () => {
      unlockBody(LOCK_ID);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  function handleContinue() {
    const newPrefs = rejectNonNecessary("banner");
    setPrefs(newPrefs);
    loadOptionalScripts(newPrefs);
    close();
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-modal="true"
      aria-labelledby="cookie-title"
      className="fixed inset-0 z-[75]"
    >
      <div
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm ${
          closing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleContinue}
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 safe-bottom">
        <div
          className={`mx-auto w-full max-w-md ${
            closing ? "animate-sheet-down" : "animate-sheet-up"
          }`}
        >
          <div
            className="mx-2 sm:mx-4 mb-2 sm:mb-4 rounded-t-3xl sm:rounded-3xl border border-greenElectric/20 bg-bgCard/98 backdrop-blur-xl shadow-[0_-4px_0_rgba(124,255,107,0.2),0_-20px_60px_rgba(0,0,0,0.7)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-greenElectric/45 to-transparent" />

            <div className="px-5 pt-5 pb-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-greenPrimary/10 border border-greenPrimary/25 flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5 text-greenElectric" aria-hidden />
                </div>
                <div className="flex-1 min-w-0 space-y-1 pt-0.5">
                  <h3
                    id="cookie-title"
                    className="text-base font-black text-textPrimary tracking-tight"
                  >
                    Cookie su CalcettoXP
                  </h3>
                  <p className="text-sm text-textMuted leading-relaxed">
                    Usiamo solo cookie necessari al funzionamento di CalcettoXP.
                  </p>
                  <p className="text-xs text-textMuted/80 leading-relaxed">
                    Servono per accesso, sicurezza e funzioni essenziali.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full inline-flex items-center justify-center gap-2 h-14 rounded-2xl text-base font-black tracking-wide bg-gradient-to-r from-greenElectric to-greenPrimary text-bgPrimary shadow-lg shadow-greenElectric/25 active:scale-[0.98] transition-transform hover:shadow-greenElectric/40"
                >
                  CONTINUA
                </button>

                <div className="flex items-center justify-center gap-2 pt-1 text-xs">
                  <a
                    href="/privacy"
                    className="text-textMuted hover:text-greenElectric transition-colors underline underline-offset-2"
                  >
                    Privacy
                  </a>
                  <span className="text-textMuted/40">·</span>
                  <a
                    href="/cookie-policy"
                    className="text-textMuted hover:text-greenElectric transition-colors underline underline-offset-2"
                  >
                    Cookie Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
