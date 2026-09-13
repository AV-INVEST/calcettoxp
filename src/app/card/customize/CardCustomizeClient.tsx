"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, Check, Lock, Loader2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import DashboardCardStage from "@/components/dashboard/DashboardCardStage";
import { CARD_THEMES, CardTheme } from "@/lib/username-config";
import type { PlayerCardProps } from "@/components/player/PlayerCard";

type Role = "POR" | "DIF" | "CEN" | "ATT";

const THEME_LABELS: Record<CardTheme, { name: string; accent: string; desc: string }> = {
  CLASSIC: { name: "Classic", accent: "from-greenPrimary to-greenElectric", desc: "Tema standard CalcettoXP." },
  NIGHT: { name: "Night", accent: "from-sky-500 to-cyan-400", desc: "Blu navy con accento ciano." },
  ELITE: { name: "Elite", accent: "from-yellow-500 to-amber-300", desc: "Nero profondo con dettagli oro." },
  NEON: { name: "Neon", accent: "from-emerald-400 via-cyan-400 to-fuchsia-500", desc: "Glow multicolor elettrico." },
};

interface CardCustomizeClientProps {
  nickname: string;
  role: Role;
  overall: number;
  level: number;
  careerIndex: number;
  careerIndexChange?: number;
  attributes: PlayerCardProps["attributes"];
  avatarImage: string | null;
  isPro: boolean;
  savedCardTheme: CardTheme;
}

export function CardCustomizeClient({
  nickname,
  role,
  overall,
  level,
  careerIndex,
  careerIndexChange,
  attributes,
  avatarImage,
  isPro,
  savedCardTheme,
}: CardCustomizeClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(savedCardTheme);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  const effectiveSelectedTheme: CardTheme =
    CARD_THEMES.includes(selectedTheme) &&
    (selectedTheme === "CLASSIC" || isPro)
      ? selectedTheme
      : "CLASSIC";

  function onThemePick(t: CardTheme) {
    const locked = !isPro && t !== "CLASSIC";
    if (locked) return;
    setSelectedTheme(t);
    setSavedOk(false);
    setError(null);
  }

  function onSave() {
    const locked = !isPro && selectedTheme !== "CLASSIC";
    if (locked) {
      setError("Tema riservato agli utenti PRO.");
      return;
    }
    startTransition(async () => {
      try {
        setError(null);
        setSavedOk(false);
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardTheme: selectedTheme }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || "Impossibile salvare la card. Riprova.");
          return;
        }
        setSavedOk(true);
        router.refresh();
        setTimeout(() => {
          router.push("/dashboard?card=updated#player-card");
        }, 250);
      } catch {
        setError("Errore di rete. Riprova.");
      }
    });
  }

  return (
    <main className="w-full max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-10 pb-28 sm:pb-16">
      <header className="mb-6 sm:mb-8">
        <Link
          href="/dashboard"
          aria-label="Torna alla dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-textMuted hover:text-textPrimary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary rounded-lg px-1 py-1 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          <span className="font-medium">Torna al profilo</span>
        </Link>

        <div className="mt-4 sm:mt-5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-textPrimary">
            PERSONALIZZA LA TUA CARD
          </h1>
          <p className="text-sm sm:text-[15px] text-textMuted mt-1.5">
            Rendi unica la tua Player Card.
          </p>
        </div>
      </header>

      <section aria-labelledby="preview-heading" className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2
            id="preview-heading"
            className="text-xs sm:text-sm font-black uppercase tracking-wider text-textMuted"
          >
            Anteprima reale
          </h2>
          {savedOk && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-greenPrimary/15 px-3 py-1 text-[11px] font-bold text-greenPrimary border border-greenPrimary/30">
              <Check className="w-3.5 h-3.5" aria-hidden />
              Card aggiornata
            </span>
          )}
        </div>
        <div className="w-full max-w-md mx-auto">
          <DashboardCardStage
            nickname={nickname}
            role={role}
            overall={overall}
            level={level}
            careerIndex={careerIndex}
            careerIndexChange={careerIndexChange}
            attributes={attributes}
            avatarImage={avatarImage}
            isPro={isPro}
            effectiveCardTheme={effectiveSelectedTheme}
          />
        </div>
      </section>

      <section aria-labelledby="themes-heading" className="mb-8 sm:mb-10">
        <h2
          id="themes-heading"
          className="text-xs sm:text-sm font-black uppercase tracking-wider text-textMuted mb-3 sm:mb-4"
        >
          SCEGLI IL TEMA
        </h2>
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3"
          role="radiogroup"
          aria-label="Tema Player Card"
        >
          {CARD_THEMES.map((t) => {
            const cfg = THEME_LABELS[t];
            const locked = !isPro && t !== "CLASSIC";
            const selected = effectiveSelectedTheme === t;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={locked || isPending}
                onClick={() => onThemePick(t)}
                className={`group relative rounded-2xl p-2.5 sm:p-3 text-left border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary ${
                  selected
                    ? "border-greenElectric bg-bgCard/90 ring-2 ring-greenElectric/30"
                    : "border-white/10 bg-bgSecondary/40 hover:bg-bgSecondary"
                } ${locked ? "opacity-65 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div
                  className={`h-12 sm:h-14 w-full rounded-xl bg-gradient-to-br ${cfg.accent} opacity-90 mb-2 shadow-inner`}
                  aria-hidden
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-textPrimary text-xs sm:text-sm">
                    {cfg.name}
                  </p>
                  {locked ? (
                    <div
                      className="inline-flex items-center justify-center rounded-md bg-amber-400/10 px-1.5 py-0.5"
                      title="Tema PRO esclusivo"
                      aria-label="Tema PRO esclusivo"
                    >
                      <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" aria-hidden />
                    </div>
                  ) : selected ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-greenElectric" aria-hidden />
                  ) : null}
                </div>
                <p className="text-[10px] sm:text-[11px] text-textMuted mt-1 line-clamp-2 sm:mt-1.5">
                  {cfg.desc}
                </p>
              </button>
            );
          })}
        </div>
        {!isPro && (
          <div
            className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3.5 py-2.5 text-[12px] sm:text-[13px] text-amber-300/90 flex items-start gap-2.5"
            role="note"
          >
            <Crown className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" aria-hidden />
            <div>
              I temi <strong>Night</strong>, <strong>Elite</strong> e <strong>Neon</strong> sono
              esclusivi CalcettoXP PRO. Passa a PRO per sbloccarli.
            </div>
          </div>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}

      <div className="sticky bottom-20 sm:bottom-6 sm:static z-30 sm:z-auto">
        <Card className="border-white/10 bg-bgCard/70 backdrop-blur-sm sm:border-0 sm:bg-transparent sm:backdrop-blur-0 sm:shadow-none shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.6)] sm:shadow-none !rounded-2xl">
          <CardContent className="p-3 sm:p-0">
            <Button
              onClick={onSave}
              disabled={isPending}
              aria-disabled={isPending}
              size="lg"
              className="w-full h-12 sm:h-13 text-sm sm:text-[15px] font-black uppercase tracking-wider gap-2.5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.95) 0%, rgba(124,255,107,0.95) 100%)",
                color: "#031409",
                boxShadow:
                  "0 10px 30px -8px rgba(34,197,94,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" aria-hidden />
                  Salvataggio…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
                  SALVA E VEDI LA CARD
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
