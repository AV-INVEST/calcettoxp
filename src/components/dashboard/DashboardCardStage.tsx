"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Crown,
  Lock,
  TrendingUp,
  TrendingDown,
  Flame,
  Zap,
  Shield,
  Target,
  Award,
} from "lucide-react";
import PlayerCard, { type PlayerCardProps } from "@/components/player/PlayerCard";
import { getStatusFromLevel, type PlayerStatus } from "@/lib/xp-levels";
import type { CardTheme } from "@/lib/username-config";
import { formatCI } from "@/lib/career-index";

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
  { key: "NIGHT", label: "NIGHT", gradient: "from-sky-500 via-sky-700 to-slate-900" },
  { key: "ELITE", label: "ELITE", gradient: "from-amber-500 via-yellow-500 to-amber-900" },
  { key: "NEON", label: "NEON", gradient: "from-emerald-400 via-cyan-400 to-fuchsia-500" },
];

const roleColors: Record<Role, { bg: string; border: string; text: string }> = {
  POR: { bg: "rgba(59, 130, 246, 0.18)", border: "rgba(96,165,250,0.45)", text: "#93C5FD" },
  DIF: { bg: "rgba(239, 68, 68, 0.18)", border: "rgba(248,113,113,0.45)", text: "#FCA5A5" },
  CEN: { bg: "rgba(234, 179, 8, 0.20)", border: "rgba(250,204,21,0.45)", text: "#FDE68A" },
  ATT: { bg: "rgba(34, 197, 94, 0.18)", border: "rgba(74,222,128,0.45)", text: "#86EFAC" },
};

const attributeLabels: Record<string, string> = {
  form: "FORM",
  impact: "IMPACT",
  results: "RESULTS",
  scoring: "SCORING",
  experience: "EXPERIENCE",
  consistency: "CONSISTENCY",
};

const attributeIcons = {
  form: Flame,
  impact: Zap,
  results: Shield,
  scoring: Target,
  experience: Award,
  consistency: Crown,
};

const STATUS_BADGE: Record<
  PlayerStatus,
  { bg: string; border: string; text: string }
> = {
  NOVIZIO: { bg: "rgba(148, 163, 184, 0.18)", border: "rgba(148,163,184,0.35)", text: "#CBD5E1" },
  EMERGENTE: { bg: "rgba(34,197,94,0.20)", border: "rgba(74,222,128,0.45)", text: "#86EFAC" },
  AFFERMATO: { bg: "rgba(56, 189, 248, 0.22)", border: "rgba(56,189,248,0.5)", text: "#7DD3FC" },
  VETERANO: { bg: "rgba(234, 179, 8, 0.25)", border: "rgba(250,204,21,0.55)", text: "#FDE68A" },
  LEGGENDA: {
    bg: "linear-gradient(90deg, rgba(234,179,8,0.28), rgba(250,204,21,0.35), rgba(234,179,8,0.28))",
    border: "rgba(250,204,21,0.65)",
    text: "#FDE047",
  },
};

/* ===========================================================
 * LOCKED PRO CARD PREVIEW — Design PRO VAULT
 * Nero ossidiana + oro champagne, censura mistero
 * NON è PlayerCard ricolorata: struttura propria.
 * Stesse footprint esterne di PlayerCard size=lg:
 *  max-w-sm | rounded-2xl | p-6 | ~ stesso aspect ratio
 * =========================================================== */
function LockedProCardPreview(props: {
  nickname: string;
  role: Role;
  overall: number;
  level: number;
  careerIndex: number;
  careerIndexChange?: number;
  attributes: PlayerCardProps["attributes"];
  avatarImage: string | null;
}) {
  const {
    nickname,
    role,
    overall,
    level,
    careerIndex,
    careerIndexChange,
    attributes,
    avatarImage,
  } = props;
  const status = getStatusFromLevel(level);
  const statusBadge = STATUS_BADGE[status];
  const roleStyle = roleColors[role];
  const hasPositive = (careerIndexChange ?? 0) >= 0;

  const gold = "#D4AF37";
  const champagne = "#F2D27A";
  const bronze = "#8A6418";
  const ivory = "#F4F0E6";

  return (
    <div
      className="relative w-full max-w-sm rounded-2xl overflow-hidden p-6"
      style={{
        aspectRatio: "unset",
        background:
          "radial-gradient(140% 90% at 50% -10%, rgba(212,175,55,0.09) 0%, rgba(8,9,7,1) 45%, rgba(10,10,8,1) 100%), linear-gradient(160deg, #090907 0%, #11100D 45%, #0A0A08 100%)",
        boxShadow:
          "0 18px 42px -14px rgba(212,175,55,0.25), 0 0 0 1px rgba(242,210,122,0.16) inset, 0 2px 0 rgba(242,210,122,0.06) inset, 0 -2px 0 rgba(138,100,24,0.25) inset",
      }}
    >
      {/* Subtle engraving texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.35'/></svg>\")",
          mixBlendMode: "overlay",
        }}
      />

      {/* Metallic corner brackets — gold/champagne */}
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <div
          key={c}
          aria-hidden
          className="pointer-events-none absolute w-10 h-10"
          style={{
            top: c.startsWith("t") ? 6 : undefined,
            bottom: c.startsWith("b") ? 6 : undefined,
            left: c.endsWith("l") ? 6 : undefined,
            right: c.endsWith("r") ? 6 : undefined,
            borderTop: c.startsWith("t") ? `2px solid ${champagne}88` : undefined,
            borderBottom: c.startsWith("b") ? `2px solid ${gold}88` : undefined,
            borderLeft: c.endsWith("l") ? `2px solid ${champagne}88` : undefined,
            borderRight: c.endsWith("r") ? `2px solid ${gold}88` : undefined,
            borderTopLeftRadius: c === "tl" ? "14px" : undefined,
            borderTopRightRadius: c === "tr" ? "14px" : undefined,
            borderBottomLeftRadius: c === "bl" ? "14px" : undefined,
            borderBottomRightRadius: c === "br" ? "14px" : undefined,
            opacity: 0.85,
          }}
        />
      ))}
      {/* Inner micro-corner bronze */}
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <div
          key={"in-" + c}
          aria-hidden
          className="pointer-events-none absolute w-3.5 h-3.5"
          style={{
            top: c.startsWith("t") ? 14 : undefined,
            bottom: c.startsWith("b") ? 14 : undefined,
            left: c.endsWith("l") ? 14 : undefined,
            right: c.endsWith("r") ? 14 : undefined,
            borderTop: c.startsWith("t") ? `1.5px solid ${bronze}99` : undefined,
            borderBottom: c.startsWith("b") ? `1.5px solid ${bronze}99` : undefined,
            borderLeft: c.endsWith("l") ? `1.5px solid ${bronze}99` : undefined,
            borderRight: c.endsWith("r") ? `1.5px solid ${bronze}99` : undefined,
            borderTopLeftRadius: c === "tl" ? "6px" : undefined,
            borderTopRightRadius: c === "tr" ? "6px" : undefined,
            borderBottomLeftRadius: c === "bl" ? "6px" : undefined,
            borderBottomRightRadius: c === "br" ? "6px" : undefined,
          }}
        />
      ))}

      {/* Gold champagne shimmer rim — elegant, non neon */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          boxShadow:
            "0 0 0 1px rgba(242,210,122,0.08) inset, 0 0 28px rgba(212,175,55,0.05) inset",
        }}
      />

      {/* Lock status bar — piccolo, parte del design */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30"
      >
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 border"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,15,6,0.75), rgba(8,7,4,0.85))",
            borderColor: `${gold}55`,
            backdropFilter: "blur(6px)",
            boxShadow: `0 0 18px ${gold}18`,
          }}
        >
          <Crown size={9} style={{ color: champagne }} />
          <span
            className="text-[9px] font-black uppercase tracking-[0.18em]"
            style={{ color: champagne }}
          >
            PRO
          </span>
          <span
            className="text-[9px] font-black uppercase tracking-[0.18em]"
            style={{ color: `${ivory}66` }}
          >
            ·
          </span>
          <Lock size={8} style={{ color: `${champagne}99` }} />
          <span
            className="text-[9px] font-black uppercase tracking-[0.18em]"
            style={{ color: `${ivory}AA` }}
          >
            Anteprima
          </span>
        </div>
      </div>

      {/* ===============================
       * TOP SECTION (stessa footprint)
       * =============================== */}
      <div className="relative flex items-start justify-between mb-3 pt-2">
        {/* OVR + Level */}
        <div className="flex flex-col items-center gap-1.5">
          {/* OVR circle (dati reali leggibili) */}
          <div
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center relative"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #3A2E10 0%, #211807 45%, #0F0B03 100%)",
              boxShadow: `inset 0 0 0 2px ${bronze}55, 0 0 0 1px ${gold}33, 0 6px 20px rgba(212,175,55,0.10)`,
            }}
          >
            <div
              aria-hidden
              className="absolute inset-1 rounded-full opacity-50"
              style={{
                background:
                  "linear-gradient(140deg, rgba(242,210,122,0.15), transparent 45%, rgba(138,100,24,0.30))",
              }}
            />
            <span
              className="relative text-3xl font-black text-white leading-none tracking-tight tabular-nums"
              style={{ color: ivory, textShadow: `0 0 12px ${gold}22` }}
            >
              {overall}
            </span>
          </div>
          {/* Level badge */}
          <div
            className="px-2.5 py-1 rounded-md font-bold text-[11px] uppercase tracking-wider"
            style={{
              background: "rgba(8,7,4,0.6)",
              backdropFilter: "blur(4px)",
              border: `1px solid ${gold}44`,
              color: champagne,
            }}
          >
            LV. {level}
          </div>
        </div>

        {/* Role + Status */}
        <div className="flex flex-col items-end gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-black text-xs tracking-wider"
            style={{
              background: roleStyle.bg,
              border: `1px solid ${roleStyle.border}`,
              color: roleStyle.text,
            }}
          >
            {role}
          </div>
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
            style={{
              background: statusBadge.bg,
              border: `1px solid ${statusBadge.border}`,
              color: statusBadge.text,
            }}
          >
            {status}
          </div>
        </div>
      </div>

      {/* ===============================
       * AVATAR (stessa dimensione)
       * =============================== */}
      <div className="relative flex justify-center -mt-1 mb-3 z-10">
        <div
          className="relative rounded-full h-[76px] w-[76px] md:h-[96px] md:w-[96px] shrink-0"
          style={{
            padding: "3px",
            background:
              "linear-gradient(135deg, rgba(212,175,55,0.85) 0%, rgba(138,100,24,0.75) 50%, rgba(242,210,122,0.9) 100%)",
            boxShadow: `0 0 0 2px ${gold}33, 0 10px 28px -6px ${gold}30`,
          }}
        >
          <div className="h-full w-full rounded-full overflow-hidden bg-black">
            {avatarImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarImage}
                alt=""
                className="h-full w-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(212,175,55,0.12), rgba(138,100,24,0.08))",
                  color: champagne,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-1/2 h-1/2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===============================
       * NICKNAME — DATO UTENTE
       * =============================== */}
      <div className="relative mb-4">
        <h2
          className="text-xl font-black uppercase tracking-wider text-center leading-tight"
          style={{ color: ivory, textShadow: `0 0 14px ${gold}18` }}
        >
          {nickname}
        </h2>
        <div
          className="mt-2 mx-auto rounded-full"
          style={{
            height: "1px",
            width: "60%",
            background: `linear-gradient(90deg, transparent 0%, ${gold}77 50%, transparent 100%)`,
          }}
        />
      </div>

      {/* ===============================
       * CAREER INDEX — DATO UTENTE
       * =============================== */}
      <div
        className="relative mb-4 px-3 py-2 rounded-xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,15,6,0.55), rgba(8,7,4,0.55))",
          border: `1px solid ${gold}22`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-textMuted">
            Career Index
          </span>
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-black tabular-nums"
              style={{ color: champagne }}
            >
              {formatCI(careerIndex)}
            </span>
            {careerIndexChange !== undefined && (
              <div
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums"
                style={{
                  background: hasPositive
                    ? "rgba(74,222,128,0.15)"
                    : "rgba(248,113,113,0.15)",
                  color: hasPositive ? "#86EFAC" : "#FCA5A5",
                }}
              >
                {hasPositive ? (
                  <TrendingUp size={11} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={11} strokeWidth={2.5} />
                )}
                <span>
                  {hasPositive ? "+" : ""}
                  {careerIndexChange > 0
                    ? careerIndexChange.toFixed(1)
                    : Math.abs(careerIndexChange).toFixed(1)}
                  %
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
       *   ATTRIBUTI BASE — solo 3, ACCENNATI (non il focus)
       *   Più sotto PRO INSIGHTS sezione dedicata.
       * ============================================================ */}
      <div className="relative flex flex-col gap-y-2.5 mb-3.5 z-[18]">
        {(
          ["form", "impact", "results"] as Array<keyof typeof attributes>
        ).map((key, i) => {
          const Icon = attributeIcons[key];
          const value = attributes[key];
          return (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-5 h-5 flex items-center justify-center shrink-0"
                style={{ color: `${champagne}CC`, opacity: 0.8 }}
              >
                <Icon size={12} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[10px] font-semibold tracking-wider uppercase"
                    style={{ color: `${ivory}88` }}
                  >
                    {attributeLabels[key]}
                  </span>
                  <span
                    className="text-[11px] font-bold tabular-nums"
                    style={{ color: `${ivory}CC`, opacity: 0.75 }}
                  >
                    {value}
                  </span>
                </div>
                <div
                  className="h-1.5 w-full rounded-full overflow-hidden opacity-75"
                  style={{ background: "rgba(242,210,122,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${value}%`,
                      background: `linear-gradient(90deg, ${bronze}99 0%, ${gold}88 60%, ${champagne}99 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================
       *   PRO INSIGHTS — sezione dedicata, il vero level-up premium
       *   Label vere da metriche esistenti del progetto.
       *   Valori SOLO placeholder/censurati:
       *   NESSUN dato reale PRO passato a FREE user.
       * ============================================================ */}
      <div
        className="relative rounded-xl px-3 py-2.5 z-[35]"
        style={{
          background:
            "linear-gradient(180deg, rgba(12,9,4,0.95), rgba(9,7,3,0.92))",
          border: `1px solid ${gold}45`,
          boxShadow: `inset 0 0 0 1px ${champagne}14, 0 0 22px ${gold}12, 0 2px 0 ${champagne}0A inset, 0 -2px 0 ${gold}0C inset`,
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      >
        {/* Header sezione PRO INSIGHTS */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="inline-flex items-center gap-1.5">
            <Crown size={10} style={{ color: champagne }} />
            <span
              className="text-[9.5px] font-black uppercase tracking-[0.18em]"
              style={{ color: champagne }}
            >
              PRO Insights
            </span>
          </div>
          <div
            aria-hidden
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5"
            style={{
              background: "rgba(8,7,4,0.55)",
              border: `1px solid ${gold}25`,
            }}
          >
            <Lock size={8} style={{ color: `${champagne}99` }} />
            <span
              className="text-[8.5px] font-black uppercase tracking-widest"
              style={{ color: `${ivory}88` }}
            >
              Solo PRO
            </span>
          </div>
        </div>

        {/* Righe metriche locked — label vere, NO valori reali */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {/* 1 — Forma 30G (analisi 30 giorni) */}
          <LockedRow
            label="Forma 30G"
            placeholder="•••"
            gold={gold}
            champagne={champagne}
            ivory={ivory}
          />
          {/* 2 — Δ CI 90G (delta CI 90 giorni) */}
          <LockedRow
            label="Δ CI 90G"
            placeholder="+••"
            gold={gold}
            champagne={champagne}
            ivory={ivory}
          />
          {/* 3 — Win rate ruolo */}
          <LockedRow
            label="Win rate ruolo"
            placeholder="••%"
            gold={gold}
            champagne={champagne}
            ivory={ivory}
          />
          {/* 4 — Streak vittorie (streak esiste) */}
          <LockedRow
            label="Streak vittorie"
            placeholder="••"
            gold={gold}
            champagne={champagne}
            ivory={ivory}
          />
          {/* 5 — Media gol (media partite) */}
          <LockedRow
            label="Media gol"
            placeholder="•.••"
            gold={gold}
            champagne={champagne}
            ivory={ivory}
          />
          {/* 6 — Record CI (record esiste) */}
          <LockedRow
            label="Record CI"
            placeholder="+••"
            gold={gold}
            champagne={champagne}
            ivory={ivory}
          />
        </div>
      </div>

      {/* ============================================================
       *   CENSURA: frost + dark sui layer INFERIORI
       *   (stanno DENTRO la cornice, z < cornice finale)
       * ============================================================ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] rounded-b-2xl z-[26]"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,8,5,0.0) 0%, rgba(10,8,5,0.38) 25%, rgba(8,7,4,0.58) 60%, rgba(8,7,4,0.68) 100%)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
        }}
      />
      {/* Pattern filigrana nascosta */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[11] opacity-[0.10]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 22% 82%, rgba(242,210,122,0.26) 0%, transparent 38%), radial-gradient(circle at 88% 78%, rgba(212,175,55,0.28) 0%, transparent 36%)",
        }}
      />
      {/* Small engraving Crown (velata) */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-4 z-[12] opacity-[0.18]"
        style={{ filter: "blur(3.5px)" }}
      >
        <Crown size={52} style={{ color: champagne }} />
      </div>
      {/* Locks mini discreti */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-24 left-4 z-[12] opacity-[0.32]"
      >
        <Lock size={11} style={{ color: gold }} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-20 right-10 z-[12] opacity-[0.28]"
      >
        <Lock size={9} style={{ color: bronze }} />
      </div>

      {/* ==========================================================
       *   GOLD SCANNER — rivela DESIGN, NON numeri
       *   (z < cornice finale)
       * ========================================================== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-[40]"
      >
        <div className="cxp-vaultscan" />
      </div>

      {/* ==========================================================
       *   ✅ CORNICE DORATA FINALE — layer più alto
       *   absolute inset-0, pointer-events-none
       *   copre TUTTI e 4 lati, non viene mai coperta da frost/blur
       * ========================================================== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl z-[60]"
        style={{
          border: `1.5px solid ${gold}55`,
          boxShadow:
            `inset 0 1px 0 ${champagne}33, inset 0 -1px 0 ${bronze}55, inset 1px 0 0 ${champagne}14, inset -1px 0 0 ${champagne}14, 0 0 28px ${gold}0B`,
        }}
      />
      {/* Corner brackets — sopra la cornice gold, uguale design */}
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <div
          key={"brkt-" + c}
          aria-hidden
          className="pointer-events-none absolute w-10 h-10 z-[61]"
          style={{
            top: c.startsWith("t") ? 5 : undefined,
            bottom: c.startsWith("b") ? 5 : undefined,
            left: c.endsWith("l") ? 5 : undefined,
            right: c.endsWith("r") ? 5 : undefined,
            borderTop: c.startsWith("t")
              ? `2px solid ${champagne}88`
              : undefined,
            borderBottom: c.startsWith("b")
              ? `2px solid ${gold}88`
              : undefined,
            borderLeft: c.endsWith("l")
              ? `2px solid ${champagne}88`
              : undefined,
            borderRight: c.endsWith("r")
              ? `2px solid ${gold}88`
              : undefined,
            borderTopLeftRadius: c === "tl" ? "14px" : undefined,
            borderTopRightRadius: c === "tr" ? "14px" : undefined,
            borderBottomLeftRadius: c === "bl" ? "14px" : undefined,
            borderBottomRightRadius: c === "br" ? "14px" : undefined,
          }}
        />
      ))}
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <div
          key={"in-" + c}
          aria-hidden
          className="pointer-events-none absolute w-3.5 h-3.5 z-[62]"
          style={{
            top: c.startsWith("t") ? 13 : undefined,
            bottom: c.startsWith("b") ? 13 : undefined,
            left: c.endsWith("l") ? 13 : undefined,
            right: c.endsWith("r") ? 13 : undefined,
            borderTop: c.startsWith("t")
              ? `1.5px solid ${bronze}AA`
              : undefined,
            borderBottom: c.startsWith("b")
              ? `1.5px solid ${bronze}AA`
              : undefined,
            borderLeft: c.endsWith("l")
              ? `1.5px solid ${bronze}AA`
              : undefined,
            borderRight: c.endsWith("r")
              ? `1.5px solid ${bronze}AA`
              : undefined,
            borderTopLeftRadius: c === "tl" ? "6px" : undefined,
            borderTopRightRadius: c === "tr" ? "6px" : undefined,
            borderBottomLeftRadius: c === "bl" ? "6px" : undefined,
            borderBottomRightRadius: c === "br" ? "6px" : undefined,
          }}
        />
      ))}
    </div>
  );
}

/* Helper riga lockata PRO INSIGHTS — Label VISIBILE, Valore LOCKATO */
function LockedRow(props: {
  label: string;
  placeholder: string;
  gold: string;
  champagne: string;
  ivory: string;
}) {
  const { label, placeholder, gold, champagne, ivory } = props;
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className="text-[9.5px] font-semibold tracking-wider uppercase truncate"
        style={{
          color: ivory,
          textShadow: `0 0 6px ${champagne}18`,
        }}
      >
        {label}
      </span>
      <div
        aria-hidden
        className="inline-flex items-center gap-1 h-5 px-2 rounded-md"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,7,4,0.75), rgba(14,11,5,0.68))",
          border: `1px solid ${gold}30`,
        }}
      >
        <Lock
          size={7}
          aria-hidden
          style={{ color: `${champagne}80`, flexShrink: 0 }}
        />
        <span
          className="text-[10px] font-black tabular-nums tracking-wider"
          style={{
            color: `${ivory}33`,
            textShadow: `0 0 4px ${champagne}12`,
            userSelect: "none",
          }}
        >
          {placeholder}
        </span>
      </div>
    </div>
  );
}

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
    [
      nickname,
      role,
      overall,
      level,
      careerIndex,
      careerIndexChange,
      attributes,
      avatarImage,
    ]
  );

  return (
    <div className="w-full">
      {/* Segmented control — singolo, compatto, CENTRATO */}
      {showSwitch && (
        <div className="w-full flex items-center justify-center mb-4">
          <div
            role="tablist"
            aria-label="Card FREE / Anteprima PRO"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-sm"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "free"}
              onClick={() => setTab("free")}
              className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                tab === "free"
                  ? "bg-greenPrimary text-bgPrimary shadow-[0_0_20px_rgba(34,197,94,0.28)]"
                  : "text-textMuted hover:text-textPrimary"
              }`}
            >
              FREE
            </button>
            <span
              aria-hidden
              className="w-px h-4 bg-white/10 mx-0.5"
            />
            <button
              type="button"
              role="tab"
              aria-selected={tab === "pro"}
              onClick={() => setTab("pro")}
              className={`inline-flex items-center gap-1.5 justify-center rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                tab === "pro"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-amber-950 shadow-[0_0_22px_rgba(250,204,21,0.28)]"
                  : "text-textMuted hover:text-amber-300"
              }`}
            >
              <Crown size={12} /> PRO
            </button>
          </div>
        </div>
      )}

      {/* Card Stage con swipe (stessa footprint FREE ↔ PRO) */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative w-full touch-pan-y select-none"
      >
        {/* FREE / PRO REAL user card (FREE tab o utente PRO vero) */}
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

        {/* PRO VAULT — solo FREE user in tab PRO */}
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
              <LockedProCardPreview {...cardProps} />
            </div>

            {/* SOTTO LA CARD — Valore PRO (solo tab PRO FREE user) */}
            <div className="mt-6 md:mt-7 flex flex-col items-center text-center space-y-4">
              {/* Temi locked pill */}
              <div className="inline-flex flex-wrap items-center justify-center gap-2">
                {PREMIUM_THEME_PREVIEWS.map((t) => (
                  <div
                    key={t.key}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-white/[0.03] px-2.5 py-1"
                  >
                    <Lock size={8} className="text-amber-400" />
                    <div
                      aria-hidden
                      className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${t.gradient} border border-white/25`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-200/90">
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Headline — valore e profondità */}
              <div className="space-y-2">
                <p className="text-sm md:text-base font-bold text-textPrimary max-w-sm mx-auto leading-snug">
                  Scopri cosa raccontano davvero le tue partite.
                </p>
                <p className="text-[11px] md:text-xs text-textMuted max-w-xs mx-auto leading-relaxed">
                  Temi esclusivi · Analytics avanzate · Storico completo · Record
                </p>
              </div>

              {/* CTA gold premium */}
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-amber-950 shadow-[0_0_26px_rgba(250,204,21,0.24)] transition-all hover:shadow-[0_0_48px_rgba(250,204,21,0.42)] hover:scale-[1.01] active:scale-[0.99]"
              >
                <Crown size={14} />
                <span>Scopri PRO</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Helper line FREE tab */}
      {showSwitch && tab === "free" && (
        <p className="mt-4 text-center text-[11px] text-textMuted">
          La tua card CLASSIC
        </p>
      )}

      {/* Scanner + reveal animation */}
      <style jsx global>{`
        .cxp-vaultscan {
          position: absolute;
          top: 0;
          left: -40%;
          width: 10%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(242, 210, 122, 0.0) 20%,
            rgba(242, 210, 122, 0.42) 45%,
            rgba(255, 244, 214, 0.55) 50%,
            rgba(242, 210, 122, 0.42) 55%,
            rgba(242, 210, 122, 0.0) 80%,
            transparent 100%
          );
          box-shadow:
            0 0 24px rgba(242, 210, 122, 0.32),
            0 0 6px rgba(255, 244, 214, 0.6);
          transform: skewX(-18deg);
          mix-blend-mode: screen;
          animation: cxp-vaultscan 5.5s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
          pointer-events: none;
        }
        @keyframes cxp-vaultscan {
          0% {
            transform: translate3d(0%, 0, 0) skewX(-18deg);
            opacity: 0;
          }
          6% {
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            transform: translate3d(1400%, 0, 0) skewX(-18deg);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cxp-vaultscan {
            animation: none !important;
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
