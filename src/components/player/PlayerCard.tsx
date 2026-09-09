"use client";

import { TrendingUp, TrendingDown, Shield, Crown, Zap, Target, Award, Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CardTheme, CARD_THEMES } from "@/lib/username-config";

type Role = "POR" | "DIF" | "CEN" | "ATT";

const THEME_CONFIG: Record<
  CardTheme,
  {
    cardBg: string;
    accent: string;
    accentSoft: string;
    cornerColor: string;
    attributeGradient: string;
    ovrGradient: string;
    boxShadow: string;
    textGlow?: string;
    glowFilter?: string;
  }
> = {
  CLASSIC: {
    cardBg:
      "linear-gradient(145deg, rgba(17, 23, 19, 0.98) 0%, rgba(10, 14, 11, 1) 50%, rgba(14, 20, 16, 0.98) 100%)",
    accent: "#22C55E",
    accentSoft: "#7CFF6B",
    cornerColor: "rgba(124, 255, 107, 0.5)",
    attributeGradient: "linear-gradient(90deg, #22C55E 0%, #7CFF6B 100%)",
    ovrGradient: "linear-gradient(145deg, #22C55E 0%, #16A34A 40%, #7CFF6B 100%)",
    boxShadow:
      "0 12px 32px -8px rgba(34, 197, 94, 0.10), 0 0 0 1px rgba(255, 255, 255, 0.04) inset",
  },
  NIGHT: {
    cardBg:
      "linear-gradient(145deg, rgba(8, 18, 28, 0.98) 0%, rgba(5, 11, 19, 1) 50%, rgba(9, 20, 32, 0.98) 100%)",
    accent: "#0EA5E9",
    accentSoft: "#7DD3FC",
    cornerColor: "rgba(56, 189, 248, 0.55)",
    attributeGradient: "linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)",
    ovrGradient: "linear-gradient(145deg, #0284C7 0%, #0369A1 40%, #7DD3FC 100%)",
    boxShadow:
      "0 14px 34px -10px rgba(14, 165, 233, 0.22), 0 0 0 1px rgba(56, 189, 248, 0.10) inset",
  },
  ELITE: {
    cardBg:
      "linear-gradient(145deg, rgba(26, 18, 8, 0.98) 0%, rgba(12, 8, 4, 1) 50%, rgba(28, 22, 10, 0.98) 100%)",
    accent: "#EAB308",
    accentSoft: "#FDE68A",
    cornerColor: "rgba(250, 204, 21, 0.6)",
    attributeGradient: "linear-gradient(90deg, #CA8A04 0%, #FACC15 100%)",
    ovrGradient: "linear-gradient(145deg, #CA8A04 0%, #A16207 40%, #FACC15 100%)",
    boxShadow:
      "0 16px 36px -10px rgba(234, 179, 8, 0.28), 0 0 0 1px rgba(250, 204, 21, 0.14) inset",
    textGlow: "0 0 20px rgba(250, 204, 21, 0.25)",
  },
  NEON: {
    cardBg:
      "linear-gradient(145deg, rgba(15, 8, 24, 0.98) 0%, rgba(8, 4, 14, 1) 50%, rgba(20, 8, 24, 0.98) 100%)",
    accent: "#34D399",
    accentSoft: "#A78BFA",
    cornerColor: "rgba(167, 139, 250, 0.65)",
    attributeGradient:
      "linear-gradient(90deg, #10B981 0%, #06B6D4 50%, #A855F7 100%)",
    ovrGradient:
      "linear-gradient(145deg, #8B5CF6 0%, #EC4899 40%, #34D399 100%)",
    boxShadow:
      "0 18px 40px -12px rgba(168, 85, 247, 0.35), 0 0 0 1px rgba(52, 211, 153, 0.15) inset",
    textGlow: "0 0 22px rgba(34, 211, 238, 0.28)",
    glowFilter: "drop-shadow(0 0 10px rgba(167, 139, 250, 0.25))",
  },
};

interface AttributeProps {
  label: string;
  value: number;
  icon: LucideIcon;
}

function Attribute({
  label,
  value,
  icon: Icon,
  accent,
  gradient,
}: AttributeProps & { accent: string; gradient: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 flex items-center justify-center shrink-0" style={{ color: accent }}>
        <Icon size={12} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-textMuted tracking-wider uppercase">
            {label}
          </span>
          <span className="text-[11px] font-bold text-textPrimary tabular-nums">
            {value}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-bgSecondary overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${value}%`,
              background: gradient,
            }}
          />
        </div>
      </div>
    </div>
  );
}

const roleColors: Record<Role, { bg: string; border: string; text: string }> = {
  POR: {
    bg: "rgba(59, 130, 246, 0.15)",
    border: "rgba(59, 130, 246, 0.4)",
    text: "#60A5FA",
  },
  DIF: {
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.4)",
    text: "#F87171",
  },
  CEN: {
    bg: "rgba(234, 179, 8, 0.15)",
    border: "rgba(234, 179, 8, 0.4)",
    text: "#FACC15",
  },
  ATT: {
    bg: "rgba(34, 197, 94, 0.15)",
    border: "rgba(34, 197, 94, 0.4)",
    text: "#4ADE80",
  },
};

const attributeIcons = {
  form: Flame,
  impact: Zap,
  results: Shield,
  scoring: Target,
  experience: Award,
  consistency: Crown,
};

const attributeLabels: Record<string, string> = {
  form: "FORM",
  impact: "IMPACT",
  results: "RESULTS",
  scoring: "SCORING",
  experience: "EXPERIENCE",
  consistency: "CONSISTENCY",
};

const sizeConfig = {
  sm: {
    cardPadding: "p-4",
    ovrCircle: "w-14 h-14",
    ovrText: "text-xl",
    lvBadge: "px-1.5 py-0.5 text-[9px]",
    nickname: "text-base",
    ciLabel: "text-[9px]",
    ciValue: "text-sm",
    attrGap: "gap-y-2",
  },
  md: {
    cardPadding: "p-5",
    ovrCircle: "w-16 h-16",
    ovrText: "text-2xl",
    lvBadge: "px-2 py-0.5 text-[10px]",
    nickname: "text-lg",
    ciLabel: "text-[10px]",
    ciValue: "text-base",
    attrGap: "gap-y-2.5",
  },
  lg: {
    cardPadding: "p-6",
    ovrCircle: "w-20 h-20",
    ovrText: "text-3xl",
    lvBadge: "px-2.5 py-1 text-[11px]",
    nickname: "text-xl",
    ciLabel: "text-xs",
    ciValue: "text-lg",
    attrGap: "gap-y-3",
  },
};

export interface PlayerCardProps {
  nickname: string;
  role: Role;
  overall: number;
  level: number;
  careerIndex?: number;
  careerIndexChange?: number;
  attributes: {
    form: number;
    impact: number;
    results: number;
    scoring: number;
    experience: number;
    consistency: number;
  };
  highlighted?: boolean;
  premiumBadge?: boolean;
  size?: "sm" | "md" | "lg";
  theme?: CardTheme;
}

export default function PlayerCard({
  nickname,
  role,
  overall,
  level,
  careerIndex,
  careerIndexChange,
  attributes,
  highlighted = false,
  premiumBadge = false,
  size = "md",
  theme = "CLASSIC",
}: PlayerCardProps) {
  const safeTheme = (CARD_THEMES as readonly string[]).includes(theme) ? theme : "CLASSIC";
  const cfg = sizeConfig[size];
  const roleStyle = roleColors[role];
  const hasPositiveChange = (careerIndexChange ?? 0) >= 0;
  const t = THEME_CONFIG[safeTheme as CardTheme];

  return (
    <div
      className={`
        relative w-full max-w-sm rounded-2xl overflow-hidden
        ${cfg.cardPadding}
      `}
      style={{
        background: t.cardBg,
        borderLeft: `3px solid ${t.accent}`,
        boxShadow: highlighted
          ? `0 0 0 2px ${t.accentSoft}, ${t.boxShadow}`
          : t.boxShadow,
        filter: t.glowFilter || undefined,
      }}
    >
      {/* Corner decorations top-left */}
      <div
        className="absolute top-0 left-0 w-8 h-8 pointer-events-none"
        style={{
          borderTop: `2px solid ${t.cornerColor}`,
          borderLeft: `2px solid ${t.cornerColor}`,
          borderTopLeftRadius: "1rem",
        }}
      />
      <div
        className="absolute top-1.5 left-1.5 w-3 h-3 pointer-events-none"
        style={{
          borderTop: `1.5px solid ${t.cornerColor}`,
          borderLeft: `1.5px solid ${t.cornerColor}`,
          borderTopLeftRadius: "0.5rem",
          opacity: 0.6,
        }}
      />

      {/* Corner decorations top-right */}
      <div
        className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
        style={{
          borderTop: `2px solid ${t.cornerColor}`,
          borderRight: `2px solid ${t.cornerColor}`,
          borderTopRightRadius: "1rem",
        }}
      />
      <div
        className="absolute top-1.5 right-1.5 w-3 h-3 pointer-events-none"
        style={{
          borderTop: `1.5px solid ${t.cornerColor}`,
          borderRight: `1.5px solid ${t.cornerColor}`,
          borderTopRightRadius: "0.5rem",
          opacity: 0.6,
        }}
      />

      {/* Corner decorations bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none"
        style={{
          borderBottom: `2px solid ${t.cornerColor}`,
          borderLeft: `2px solid ${t.cornerColor}`,
          borderBottomLeftRadius: "1rem",
        }}
      />
      <div
        className="absolute bottom-1.5 left-1.5 w-3 h-3 pointer-events-none"
        style={{
          borderBottom: `1.5px solid ${t.cornerColor}`,
          borderLeft: `1.5px solid ${t.cornerColor}`,
          borderBottomLeftRadius: "0.5rem",
          opacity: 0.6,
        }}
      />

      {/* Corner decorations bottom-right */}
      <div
        className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none"
        style={{
          borderBottom: `2px solid ${t.cornerColor}`,
          borderRight: `2px solid ${t.cornerColor}`,
          borderBottomRightRadius: "1rem",
        }}
      />
      <div
        className="absolute bottom-1.5 right-1.5 w-3 h-3 pointer-events-none"
        style={{
          borderBottom: `1.5px solid ${t.cornerColor}`,
          borderRight: `1.5px solid ${t.cornerColor}`,
          borderBottomRightRadius: "0.5rem",
          opacity: 0.6,
        }}
      />

      {/* Subtle pitch lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div
          className="absolute left-1/2 top-0 bottom-0"
          style={{ borderLeft: `1px dashed ${t.accentSoft}` }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "80px",
            height: "80px",
            border: `1px dashed ${t.accentSoft}`,
          }}
        />
      </div>

      {/* Top section */}
      <div className="relative flex items-start justify-between mb-4">
        {/* OVR + Level */}
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`${cfg.ovrCircle} rounded-full flex flex-col items-center justify-center relative`}
            style={{
              background: t.ovrGradient,
              boxShadow: `0 4px 16px ${t.accent}55, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
            }}
          >
            <span
              className={`${cfg.ovrText} font-black text-white leading-none tracking-tight tabular-nums drop-shadow-sm`}
            >
              {overall}
            </span>
          </div>
          <div
            className={`${cfg.lvBadge} rounded-md font-bold uppercase tracking-wider`}
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              border: `1px solid ${t.accentSoft}55`,
              color: t.accentSoft,
            }}
          >
            LV. {level}
          </div>
        </div>

        {/* Role + Premium */}
        <div className="flex flex-col items-end gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-black text-xs tracking-wider`}
            style={{
              background: roleStyle.bg,
              border: `1px solid ${roleStyle.border}`,
              color: roleStyle.text,
            }}
          >
            {role}
          </div>
          {premiumBadge && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
              style={{
                background: `linear-gradient(90deg, ${t.accentSoft}33, ${t.accent}33)`,
                border: `1px solid ${t.accentSoft}88`,
                color: t.accentSoft,
              }}
            >
              <Crown size={10} />
              PRO
            </div>
          )}
        </div>
      </div>

      {/* Nickname */}
      <div className="relative mb-4">
        <h2
          className={`${cfg.nickname} font-black text-textPrimary uppercase tracking-wider text-center leading-tight`}
          style={{
            textShadow: premiumBadge
              ? t.textGlow || `0 0 20px ${t.accentSoft}44`
              : t.textGlow || "none",
          }}
        >
          {nickname}
        </h2>
        <div
          className="mt-2 mx-auto rounded-full"
          style={{
            height: "1px",
            width: "60%",
            background: `linear-gradient(90deg, transparent 0%, ${t.accentSoft}55 50%, transparent 100%)`,
          }}
        />
      </div>

      {/* Career Index */}
      {careerIndex !== undefined && (
        <div
          className="relative mb-4 px-3 py-2 rounded-xl"
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            border: `1px solid ${t.accentSoft}22`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`${cfg.ciLabel} font-semibold text-textMuted uppercase tracking-widest`}
              >
                Career Index
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`${cfg.ciValue} font-black tabular-nums`}
                style={{ color: t.accentSoft }}
              >
                {careerIndex.toFixed(1)}
              </span>
              {careerIndexChange !== undefined && (
                <div
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums`}
                  style={{
                    background: hasPositiveChange
                      ? `${t.accent}22`
                      : "rgba(239, 68, 68, 0.15)",
                    color: hasPositiveChange ? t.accentSoft : "#F87171",
                  }}
                >
                  {hasPositiveChange ? (
                    <TrendingUp size={11} strokeWidth={2.5} />
                  ) : (
                    <TrendingDown size={11} strokeWidth={2.5} />
                  )}
                  <span>
                    {hasPositiveChange ? "+" : ""}
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
      )}

      {/* Attributes */}
      <div className={`relative flex flex-col ${cfg.attrGap}`}>
        {(Object.keys(attributes) as Array<keyof typeof attributes>).map((key) => (
          <Attribute
            key={key}
            label={attributeLabels[key]}
            value={attributes[key]}
            icon={attributeIcons[key]}
            accent={t.accent}
            gradient={t.attributeGradient}
          />
        ))}
      </div>
    </div>
  );
}
