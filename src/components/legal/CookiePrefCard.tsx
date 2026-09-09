"use client";

import { Cookie, Settings2, ChevronRight } from "lucide-react";

export function CookiePrefCard() {
  function openPreferences() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("calcettoxp:open-cookie-consent"));
    }
  }

  return (
    <div className="relative rounded-3xl border border-greenElectric/25 bg-gradient-to-br from-greenElectric/8 via-bgCard to-bgSecondary/80 p-5 md:p-6 overflow-hidden">
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-greenElectric/10 blur-3xl pointer-events-none" aria-hidden />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-greenPrimary/15 border border-greenElectric/30 flex items-center justify-center shrink-0 shadow-lg shadow-greenElectric/10">
            <Cookie className="w-5.5 h-5.5 text-greenElectric" strokeWidth={2.1} />
          </div>
          <div className="min-w-0 space-y-1 flex-1">
            <h3 className="font-black text-textPrimary text-[15px] md:text-base tracking-tight flex items-center gap-2 flex-wrap">
              Gestisci le tue preferenze
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-greenElectric/10 border border-greenElectric/20 text-greenElectric text-[10px] font-black tracking-[0.15em]">
                <Settings2 className="w-3 h-3" strokeWidth={2.4} />
                PANNELLO
              </span>
            </h3>
            <p className="text-[13px] md:text-sm text-textMuted leading-relaxed">
              Apri il pannello per vedere lo stato di ogni categoria, leggere le descrizioni e
              confermare le tue scelte. Le preferenze vengono salvate in locale.
            </p>
          </div>
        </div>
        <div className="sm:shrink-0 sm:flex sm:items-center">
          <button
            type="button"
            onClick={openPreferences}
            aria-label="Apri il pannello delle preferenze cookie"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-5 rounded-2xl bg-gradient-to-r from-greenElectric to-greenPrimary text-bgPrimary font-black text-sm md:text-[14px] tracking-wide shadow-lg shadow-greenElectric/20 active:scale-[0.98] transition-transform hover:shadow-greenElectric/35"
          >
            APRI PREFERENZE
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookiePrefCard;
