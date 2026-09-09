"use client";

import { Zap } from "lucide-react";
import Link from "next/link";
import CookiePreferencesButton from "@/components/legal/CookiePreferencesButton";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/termini", label: "Termini" },
  { href: "/cookie-policy", label: "Cookie" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export default function AppFooter() {
  const year = 2026;
  return (
    <footer
      className="py-10 md:py-12 border-t border-greenPrimary/10"
      style={{ backgroundColor: "#070A08" }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-greenElectric to-greenPrimary flex items-center justify-center">
              <Zap className="w-4 h-4 text-bgPrimary" strokeWidth={3} />
            </div>
            <span className="font-bold text-greenElectric text-lg tracking-tight">
              CalcettoXP
            </span>
          </div>

          <nav aria-label="Link legali" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {LEGAL_LINKS.map((l, idx) => (
              <div key={l.href} className="flex items-center gap-4">
                <Link
                  href={l.href}
                  className="text-textMuted text-sm hover:text-greenElectric transition-colors"
                >
                  {l.label}
                </Link>
                {idx < LEGAL_LINKS.length - 1 && (
                  <span className="w-1 h-1 rounded-full bg-textMuted/30 hidden md:inline-block" aria-hidden="true" />
                )}
              </div>
            ))}
          </nav>

          <CookiePreferencesButton />

          <p className="text-textMuted/80 text-xs text-center max-w-xl leading-relaxed">
            CalcettoXP © {year}. Le statistiche Solo Career sono auto-dichiarate.
            <br className="hidden sm:block" />
            <Link href="/disclaimer" className="underline decoration-dotted decoration-textMuted/40 underline-offset-2 hover:text-greenElectric transition-colors">
              Scopri di più
            </Link>
          </p>

          <p className="text-textMuted/50 text-[11px] text-center">
            Trasforma ogni calcetto nella tua carriera. ⚽
          </p>
        </div>
      </div>
    </footer>
  );
}
