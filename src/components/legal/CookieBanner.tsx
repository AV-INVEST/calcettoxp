"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Cookie, X, ShieldCheck, BarChart3, Megaphone, Check, ChevronDown } from "lucide-react";
import {
  CookieConsentPreferences,
  readConsent,
  rejectNonNecessary,
  saveCustom,
  acceptAll,
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

type Mode = "banner" | "preferences";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const [prefs, setPrefs] = useState<CookieConsentPreferences | null>(null);
  const [mode, setMode] = useState<Mode>("banner");
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const LOCK_ID = "cookie-banner";
  const timerRef = useRef<number | null>(null);

  const close = useCallback(() => {
    setClosing(true);
    unlockBody(LOCK_ID);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setShow(false);
      setClosing(false);
      setMode("banner");
    }, 220);
  }, []);

  const openPreferences = useCallback(() => {
    const current = readConsent();
    if (current) {
      setPrefs(current);
      setAnalytics(current.analytics);
      setMarketing(current.marketing);
    }
    setMode("preferences");
    setClosing(false);
    setShow(true);
  }, []);

  const refresh = useCallback(() => {
    const c = readConsent();
    setPrefs(c);
    if (c) {
      setAnalytics(c.analytics);
      setMarketing(c.marketing);
      loadOptionalScripts(c);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = window.setTimeout(() => {
      const c = readConsent();
      if (!c) {
        setMode("banner");
        setShow(true);
      }
    }, 700);
    return () => window.clearTimeout(t);
  }, [refresh]);

  useEffect(() => {
    function onOpenRequest() {
      openPreferences();
    }
    window.addEventListener("calcettoxp:open-cookie-consent", onOpenRequest);
    return () => window.removeEventListener("calcettoxp:open-cookie-consent", onOpenRequest);
  }, [openPreferences]);

  useEffect(() => {
    if (show && !closing) {
      lockBody(LOCK_ID);
    }
  }, [show, closing]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && show) close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, close]);

  useEffect(() => {
    return () => {
      unlockBody(LOCK_ID);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  function handleContinue() {
    const newPrefs = rejectNonNecessary("banner");
    setPrefs(newPrefs);
    setAnalytics(false);
    setMarketing(false);
    loadOptionalScripts(newPrefs);
    close();
  }

  function handleSavePreferences() {
    const newPrefs = saveCustom({ analytics, marketing }, "footer");
    setPrefs(newPrefs);
    loadOptionalScripts(newPrefs);
    close();
  }

  function handleAcceptAll() {
    const newPrefs = acceptAll(mode === "banner" ? "banner" : "footer");
    setPrefs(newPrefs);
    setAnalytics(true);
    setMarketing(true);
    loadOptionalScripts(newPrefs);
    close();
  }

  if (!show) return null;

  const categories = [
    {
      id: "necessary",
      title: "Cookie Necessari",
      subtitle: "Sempre attivi · Richiesti dal servizio",
      description:
        "Cookie tecnici indispensabili per il funzionamento base di CalcettoXP. Includono sessione Auth.js, CSRF, cookie Stripe durante i pagamenti e preferenze funzionali come tema o layout. Non possono essere disattivati.",
      Icon: ShieldCheck,
      enabled: true,
      locked: true,
      accent: "green",
    },
    {
      id: "analytics",
      title: "Cookie Analitici",
      subtitle: mode === "preferences" ? (analytics ? "Attivi" : "Disattivi") : "Non attivi",
      description:
        "Strumenti di misurazione aggregata (es. Vercel Analytics, Plausible) per capire come viene usata la piattaforma e migliorare l'esperienza. Attualmente nessun cookie analitico è caricato su CalcettoXP.",
      Icon: BarChart3,
      enabled: analytics,
      locked: false,
      onToggle: () => setAnalytics(v => !v),
      accent: "blue",
    },
    {
      id: "marketing",
      title: "Cookie Marketing",
      subtitle: mode === "preferences" ? (marketing ? "Attivi" : "Disattivi") : "Non attivi",
      description:
        "Cookie di profilazione per campagne promozionali, retargeting o pubblicità comportamentale. Su CalcettoXP non sono presenti e non vengono caricati cookie di marketing.",
      Icon: Megaphone,
      enabled: marketing,
      locked: false,
      onToggle: () => setMarketing(v => !v),
      accent: "amber",
    },
  ];

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-modal="true"
      aria-labelledby="cookie-title"
      className="fixed inset-0 z-[95] isolate"
    >
      <div
        className={`absolute inset-0 bg-black/85 backdrop-blur-md ${
          closing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={mode === "banner" ? handleContinue : close}
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-0" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}>
        <div
          className={`mx-auto w-full max-w-md ${
            closing ? "animate-sheet-down" : "animate-sheet-up"
          }`}
        >
          <div className="mx-2 sm:mx-4 mb-2 sm:mb-4 rounded-t-3xl sm:rounded-3xl border border-greenElectric/25 bg-bgCard/98 backdrop-blur-xl shadow-[0_-4px_0_rgba(124,255,107,0.22),0_-24px_72px_rgba(0,0,0,0.85)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-greenElectric/50 to-transparent" />

            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-greenPrimary/10 border border-greenPrimary/30 flex items-center justify-center shrink-0">
                    <Cookie className="w-5 h-5 text-greenElectric" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1 pt-0.5">
                    <h3
                      id="cookie-title"
                      className="text-base font-black text-textPrimary tracking-tight"
                    >
                      {mode === "banner" ? "Cookie su CalcettoXP" : "Preferenze Cookie"}
                    </h3>
                    <p className="text-sm text-textMuted leading-relaxed">
                      {mode === "banner"
                        ? "Usiamo solo cookie tecnici necessari. Puoi gestire ogni categoria."
                        : prefs
                          ? `Ultimo salvataggio: ${new Date(prefs.updatedAt).toLocaleDateString("it-IT")}`
                          : "Personalizza le categorie di cookie."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Chiudi pannello cookie"
                  className="w-9 h-9 rounded-xl bg-bgSecondary/80 border border-white/10 flex items-center justify-center active:scale-95 transition-transform hover:bg-bgSecondary shrink-0"
                >
                  <X className="w-4.5 h-4.5 text-textMuted" strokeWidth={2.2} />
                </button>
              </div>

              {mode === "banner" && (
                <div className="space-y-4">
                  <p className="text-[13px] text-textMuted/90 leading-relaxed bg-bgSecondary/50 border border-white/5 rounded-2xl p-4">
                    Servono per accesso, sicurezza e funzioni essenziali. Non usiamo cookie analitici
                    o di marketing.
                  </p>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleContinue}
                      className="w-full inline-flex items-center justify-center gap-2 h-14 rounded-2xl text-base font-black tracking-wide bg-gradient-to-r from-greenElectric to-greenPrimary text-bgPrimary shadow-lg shadow-greenElectric/25 active:scale-[0.98] transition-transform hover:shadow-greenElectric/40"
                    >
                      CONTINUA CON I SOLI NECESSARI
                    </button>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={openPreferences}
                        className="inline-flex items-center justify-center gap-2 h-12 rounded-2xl text-sm font-black tracking-wide bg-bgSecondary/70 border border-white/10 text-textPrimary hover:border-greenElectric/30 hover:text-greenElectric transition-all"
                      >
                        PERSONALIZZA
                      </button>
                      <button
                        type="button"
                        onClick={handleAcceptAll}
                        className="inline-flex items-center justify-center gap-2 h-12 rounded-2xl text-sm font-black tracking-wide bg-bgCard/80 border border-greenElectric/25 text-greenElectric hover:bg-greenElectric/10 transition-all"
                      >
                        ACCETTA TUTTI
                      </button>
                    </div>

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
              )}

              {mode === "preferences" && (
                <div className="space-y-4">
                  <ul className="space-y-2">
                    {categories.map(cat => {
                      const expanded = expandedInfo === cat.id;
                      return (
                        <li
                          key={cat.id}
                          className={`rounded-2xl border transition-colors ${
                            cat.locked
                              ? "bg-greenElectric/5 border-greenElectric/20"
                              : cat.enabled
                                ? "bg-bgSecondary/60 border-greenElectric/15"
                                : "bg-bgSecondary/40 border-white/5"
                          }`}
                        >
                          <div className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              cat.accent === "green"
                                ? "bg-greenElectric/10 border border-greenElectric/25"
                                : cat.accent === "blue"
                                  ? "bg-sky-500/10 border border-sky-500/20"
                                  : "bg-amber-500/10 border border-amber-500/20"
                            }`}>
                              <cat.Icon className={`w-[18px] h-[18px] ${
                                cat.accent === "green" ? "text-greenElectric"
                                  : cat.accent === "blue" ? "text-sky-400"
                                  : "text-amber-400"
                              }`} strokeWidth={2.1} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-[14px] tracking-tight text-textPrimary">
                                  {cat.title}
                                </h4>
                              </div>
                              <p className={`text-[11.5px] mt-0.5 font-semibold tracking-wide ${
                                cat.enabled ? "text-greenElectric" : "text-textMuted"
                              }`}>
                                {cat.subtitle}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {cat.locked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bgPrimary/70 border border-greenElectric/20 text-greenElectric text-[10px] font-black tracking-[0.15em]">
                                  <Check className="w-3 h-3" />
                                  SEMPRE ON
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={cat.onToggle}
                                  role="switch"
                                  aria-checked={cat.enabled}
                                  aria-label={`Attiva o disattiva ${cat.title}`}
                                  className={`relative w-12 h-7 rounded-full transition-colors border ${
                                    cat.enabled
                                      ? "bg-greenElectric border-greenElectric/40"
                                      : "bg-bgPrimary border-white/10"
                                  }`}
                                >
                                  <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-bgCard border border-white/10 shadow-md transition-transform ${
                                      cat.enabled ? "translate-x-5 border-greenElectric/30" : ""
                                    }`}
                                  />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setExpandedInfo(expanded ? null : cat.id)}
                                aria-expanded={expanded}
                                aria-label={`Mostra dettagli per ${cat.title}`}
                                className="w-8 h-8 rounded-lg bg-bgPrimary/60 border border-white/5 flex items-center justify-center shrink-0 hover:border-white/10 transition-colors"
                              >
                                <ChevronDown className={`w-4 h-4 text-textMuted transition-transform ${expanded ? "rotate-180" : ""}`} strokeWidth={2.2} />
                              </button>
                            </div>
                          </div>

                          {expanded && (
                            <div className="px-4 pb-4 pt-0 animate-fade-in">
                              <p className="text-[12.5px] text-textMuted leading-relaxed bg-bgPrimary/40 border border-white/5 rounded-xl p-3">
                                {cat.description}
                              </p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAnalytics(false);
                        setMarketing(false);
                      }}
                      className="inline-flex items-center justify-center gap-2 h-12 rounded-2xl text-sm font-black tracking-wide bg-bgSecondary/70 border border-white/10 text-textMuted hover:text-textPrimary hover:border-white/15 transition-all"
                    >
                      RESETTA
                    </button>
                    <button
                      type="button"
                      onClick={handleAcceptAll}
                      className="inline-flex items-center justify-center gap-2 h-12 rounded-2xl text-sm font-black tracking-wide bg-bgCard/80 border border-greenElectric/25 text-greenElectric hover:bg-greenElectric/10 transition-all"
                    >
                      ACCETTA TUTTI
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="w-full inline-flex items-center justify-center gap-2 h-14 rounded-2xl text-base font-black tracking-wide bg-gradient-to-r from-greenElectric to-greenPrimary text-bgPrimary shadow-lg shadow-greenElectric/25 active:scale-[0.98] transition-transform hover:shadow-greenElectric/40"
                  >
                    <Check className="w-4.5 h-4.5" strokeWidth={2.8} />
                    SALVA E CONFERMA
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
