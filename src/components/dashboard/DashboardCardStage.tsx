"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Crown, Lock, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import PlayerCard, { type PlayerCardProps } from "@/components/player/PlayerCard";
import type { CardTheme } from "@/lib/username-config";

type Role = "POR" | "DIF" | "CEN" | "ATT";

export interface DashboardCardStageProps {
  nickname: string;
  role: Role;
  overall: number;
  level: number;
  careerIndex: number;
  careerIndexChange?: number;
  attributes: PlayerCardProps["attributes"];
  avatarImage: string | null;
  isPro: boolean;
  effectiveCardTheme: CardTheme;
}

type TabMode = "free" | "pro";

const PREMIUM_THEME_PREVIEWS: Array<{ key: CardTheme; label: string; gradient: string }> = [
  {
    key: "NIGHT",
    label: "NIGHT",
    gradient: "from-sky-500 via-sky-700 to-slate-900",
  },
  {
    key: "ELITE",
    label: "ELITE",
    gradient: "from-amber-500 via-yellow-500 to-amber-900",
  },
  {
    key: "NEON",
    label: "NEON",
    gradient: "from-emerald-400 via-cyan-400 to-fuchsia-500",
  },
];

export default function DashboardCardStage(props: DashboardCardStageProps) {
  const {
    nickname,
    role,
    overall,
    level,
    careerIndex,
    careerIndexChange,
    attributes,
    avatarImage,
    isPro,
    effectiveCardTheme,
  } = props;

  const [tab, setTab] = useState<TabMode>("free");
  const touchStartX = useRef<number | null>(null);
  const lastDelta = useRef<number>(0);

  const showSwitch = !isPro;
  const showLockedPro = showSwitch && tab === "pro";

  function onPointerDown(e: React.PointerEvent) {
    if (!showSwitch) return;
    touchStartX.current = e.clientX;
    lastDelta.current = 0;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (touchStartX.current == null) return;
    lastDelta.current = e.clientX - touchStartX.current;
  }
  function onPointerUp() {
    if (!showSwitch || touchStartX.current == null) return;
    const delta = lastDelta.current;
    if (delta > 50 && tab === "free") setTab("pro");
    else if (delta < -50 && tab === "pro") setTab("free");
    touchStartX.current = null;
    lastDelta.current = 0;
  }

  const cardProps = useMemo(
    () => ({
      nickname,
      role,
      overall,
      level,
      careerIndex,
      careerIndexChange,
      attributes,
      avatarImage,
    }),
    [nickname, role, overall, level, careerIndex, careerIndexChange, attributes, avatarImage]
  );

  return (
    <div className="w-full">
      {showSwitch ? (
        <div className="w-full flex items-center justify-between gap-3 mb-4 px-1">
          <button
            type="button"
            onClick={() => setTab("free")}
            aria-label="Mostra card FREE"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider transition-all ${
              tab === "free"
                ? "bg-greenPrimary text-bgPrimary border-greenPrimary shadow-[0_0_18px_rgba(34,197,94,0.25)]"
                : "bg-white/5 text-textMuted border-white/10 hover:text-textPrimary hover:bg-white/[0.07]"
            }`}
          >
            FREE
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="FREE"
              onClick={() => setTab("free")}
              className={`w-8 h-8 rounded-lg border border-white/10 hover:border-white/20 transition-all flex items-center justify-center ${
                tab === "pro" ? "text-textMuted" : "text-greenElectric"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setTab("pro")}
              aria-label="Mostra anteprima PRO"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider transition-all ${
                tab === "pro"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-amber-950 border-amber-400/70 shadow-[0_0_18px_rgba(250,204,21,0.25)]"
                  : "bg-white/5 text-textMuted border-white/10 hover:text-amber-300 hover:bg-amber-500/10 hover:border-amber-400/30"
              }`}
            >
              <Crown size={12} /> PRO
            </button>
            <button
              type="button"
              aria-label="PRO"
              onClick={() => setTab("pro")}
              className={`w-8 h-8 rounded-lg border border-white/10 hover:border-white/20 transition-all flex items-center justify-center ${
                tab === "free" ? "text-textMuted" : "text-amber-400"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative w-full touch-pan-y select-none"
      >
        {/* Free card (always rendered to avoid re-mount on switch) */}
        <div
          className={`w-full transition-[opacity,transform] duration-300 ease-out ${
            !showSwitch || tab === "free"
              ? "opacity-100 relative"
              : "opacity-0 pointer-events-none absolute inset-0 -translate-x-6"
          }`}
          aria-hidden={showSwitch && tab !== "free"}
        >
          <div className="relative mx-auto w-full max-w-sm">
            <PlayerCard
              {...cardProps}
              premiumBadge={isPro}
              size="lg"
              highlighted
              theme={isPro ? effectiveCardTheme : "CLASSIC"}
            />
          </div>
        </div>

        {/* Pro locked preview (only rendered when FREE user + PRO tab) */}
        {showSwitch && (
          <div
            className={`w-full transition-[opacity,transform] duration-300 ease-out ${
              tab === "pro"
                ? "opacity-100 relative"
                : "opacity-0 pointer-events-none absolute inset-0 translate-x-6"
            }`}
            aria-hidden={tab !== "pro"}
          >
            <div className="relative mx-auto w-full max-w-sm">
              {/* Gold glow rim (silhouette / bordo dorato) */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-1.5 rounded-[28px] rounded-b-[32px] opacity-90 blur-[2px]"
                style={{
                  background:
                    "conic-gradient(from 140deg, rgba(250,204,21,0.55), rgba(234,179,8,0.08), rgba(250,204,21,0.5), rgba(180,83,9,0.05), rgba(250,204,21,0.55))",
                }}
              />
              {/* Scan / fascia che attraversa rivelando dettagli premium */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px] rounded-b-[28px] z-20"
              >
                <div
                  className="absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(250,204,21,0.10) 35%, rgba(253,224,71,0.22) 50%, rgba(250,204,21,0.10) 65%, transparent 100%)",
                    animation:
                      "cxp-proscan 3.6s cubic-bezier(0.22, 0.61, 0.36, 1) infinite",
                  }}
                />
              </div>

              <div className="relative z-10">
                <PlayerCard
                  {...cardProps}
                  premiumBadge={false}
                  size="lg"
                  highlighted
                  theme="ELITE"
                />

                {/* Subtle frosted overlay - ONLY cosmetic, NO stats hidden */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[24px] rounded-b-[28px]"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(234,179,8,0.06) 0%, rgba(120,53,15,0.0) 35%, rgba(250,204,21,0.07) 100%)",
                    backdropFilter:
                      "saturate(1.08) blur(0.3px)",
                  }}
                />
                {/* Elegant gold top spotlight */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[24px] rounded-b-[28px] mix-blend-screen"
                  style={{
                    background:
                      "radial-gradient(120% 60% at 50% 0%, rgba(250,204,21,0.16), transparent 60%)",
                  }}
                />
                {/* Premium gold border */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[24px] rounded-b-[28px] border border-amber-400/38"
                  style={{
                    boxShadow:
                      "inset 0 0 0 1px rgba(253,224,71,0.10)",
                  }}
                />
                {/* Small elegant crown/lock badge corner */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-2 right-2 z-30"
                >
                  <div className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-gradient-to-br from-amber-950/80 to-amber-950/60 backdrop-blur-sm px-2 py-1 shadow-[0_0_15px_rgba(250,204,21,0.12)]">
                    <Crown size={10} className="text-amber-300" />
                    <Lock size={8} className="text-amber-400/70" />
                  </div>
                </div>
              </div>
            </div>

            {/* THEMES PILLS + CTA — SOTTO LA CARD (NON sopra!) */}
            <div className="mt-5 md:mt-6 flex flex-col items-center text-center space-y-4">
              {/* Temi premium locked */}
              <div className="flex flex-col items-center gap-2">
                <div className="inline-flex items-center gap-2">
                  {PREMIUM_THEME_PREVIEWS.map((t) => (
                    <div
                      key={t.key}
                      className="group relative inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-white/[0.03] px-2.5 py-1"
                    >
                      <div
                        aria-hidden
                        className={`w-4 h-4 rounded-full bg-gradient-to-br ${t.gradient} border border-white/20`}
                      />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-200/90">
                        {t.label}
                      </span>
                      <Lock
                        size={8}
                        className="text-amber-400/60"
                        aria-hidden
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Headline premium */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1">
                  <Sparkles size={11} className="text-amber-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">
                    SBLOCCA IL TUO STILE PRO
                  </span>
                </div>
                <p className="text-xs md:text-sm text-textMuted max-w-xs mx-auto leading-relaxed">
                  Temi esclusivi · Analytics avanzate · Storico completo · Record avanzati · Obiettivi extra
                </p>
              </div>

              {/* CTA gold */}
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-amber-950 shadow-[0_0_25px_rgba(250,204,21,0.22)] transition-all hover:shadow-[0_0_42px_rgba(250,204,21,0.38)] hover:scale-[1.01] active:scale-[0.99]"
              >
                <Crown size={14} />
                <span>Scopri PRO</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {showSwitch && (
        <p className="mt-4 text-center text-[11px] text-textMuted">
          {tab === "free"
            ? "La tua card CLASSIC · Dati reali"
            : "Anteprima PRO · I tuoi numeri reali · Design esclusivo"}
        </p>
      )}

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .pointer-events-none.absolute.inset-0.overflow-hidden.rounded-\\[24px\\].rounded-b-\\[28px\\] > div {
            animation: none !important;
          }
        }
        @keyframes cxp-proscan {
          0% {
          transform: translate3d(0%, 0, 0) skewX(-12deg);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          82% {
            opacity: 1;
          }
          100% {
          transform: translate3d(500%, 0, 0) skewX(-12deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
