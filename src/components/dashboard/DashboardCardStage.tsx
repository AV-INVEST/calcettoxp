"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Crown, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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
          <PlayerCard
            {...cardProps}
            premiumBadge={isPro}
            size="lg"
            highlighted
            theme={isPro ? effectiveCardTheme : "CLASSIC"}
          />
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
            <div className="relative mx-auto w-fit">
              {/* Gold glow rim (silhouette / bordo dorato) */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-1.5 rounded-[28px] rounded-b-[32px] opacity-80 blur-[2px] opacity-90"
                style={{
                  background:
                    "conic-gradient(from 140deg, rgba(250,204,21,0.55), rgba(234,179,8,0.08), rgba(250,204,21,0.5), rgba(180,83,9,0.05), rgba(250,204,21,0.55))",
                }}
              />
              {/* Scan / fascia che attraversa rivelando dettagli premium */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px] rounded-b-[28px]"
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

              <div className="relative">
                <PlayerCard
                  {...cardProps}
                  premiumBadge={false}
                  size="lg"
                  highlighted
                  theme="ELITE"
                />

                {/* Overlay blur e lock - SOLO estetica: statistiche e numeri NON censurati */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[24px] rounded-b-[28px]"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(234,179,8,0.05) 0%, rgba(120,53,15,0.0) 30%, rgba(250,204,21,0.06) 100%)",
                    backdropFilter:
                      "saturate(1.05) blur(0.4px)",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[24px] rounded-b-[28px] mix-blend-screen"
                  style={{
                    background:
                      "radial-gradient(120% 60% at 50% 0%, rgba(250,204,21,0.14), transparent 60%)",
                  }}
                />
                {/* Bordo elegante premium */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[24px] rounded-b-[28px] border border-amber-400/35"
                  style={{
                    boxShadow:
                      "inset 0 0 0 1px rgba(253,224,71,0.08)",
                  }}
                />

                {/* Overlay centrale mistero + CTA */}
                <div className="absolute inset-0 rounded-[24px] rounded-b-[28px] flex flex-col items-center justify-end pb-9 md:pb-10">
                  <div className="w-[86%] md:w-[82%] rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-950/70 via-amber-950/85 to-black/85 backdrop-blur-sm shadow-[0_0_35px_rgba(250,204,21,0.10)] px-4 py-4 md:px-5 md:py-5 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 mb-2">
                      <Crown size={12} className="text-amber-300" />
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
                        Il tuo look PRO
                      </span>
                    </div>
                    <div className="text-base md:text-lg font-black tracking-tight text-amber-100">
                      Sblocca la card completa
                    </div>
                    <p className="text-[11px] md:text-xs text-amber-200/80 mt-1 max-w-[240px]">
                      Temi esclusivi · Zero pay-to-win · Solo estetica e analytics
                    </p>
                    <div className="mt-3">
                      <Badge
                        variant="grigio"
                        className="text-[10px] flex items-center gap-1"
                      >
                        <Lock size={10} /> Anteprima
                      </Badge>
                    </div>
                    <Link
                      href="/pricing"
                      className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-amber-950 shadow-[0_0_22px_rgba(250,204,21,0.22)] transition-all hover:shadow-[0_0_36px_rgba(250,204,21,0.36)] active:scale-[0.99]"
                    >
                      <Crown size={14} />
                      Scopri PRO
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSwitch && (
        <p className="mt-3 text-center text-[11px] text-textMuted">
          {tab === "free"
            ? "La tua card CLASSIC · Dati reali"
            : "Anteprima PRO bloccata · I tuoi dati restano invariati"}
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
