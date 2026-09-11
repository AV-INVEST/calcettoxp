import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  buildAggregatorContext,
  evaluateAchievementProgress,
  type EntryProgress,
} from "@/lib/achievement-engine";
import {
  ACHIEVEMENT_CATEGORIES_META,
  ACHIEVEMENT_CATALOG,
  findCatalogEntryByKey,
  countCatalogByTier,
  type AchievementCatalogEntry,
  type AchievementCategory,
  formatRoleAggregateForPath,
} from "@/lib/achievement-catalog";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Trophy,
  Crown,
  Lock,
  Check,
  Sparkles,
  Target,
  Users,
  Footprints,
  Swords,
  Shield,
  ShieldCheck,
  TrendingUp,
  Star,
  Zap,
  Award,
  Flame,
  Medal,
  BookOpen,
  BookMarked,
  Infinity,
  Rocket,
  ArrowRight,
  Diamond,
  Globe,
  Gem,
  Search,
  Megaphone,
  MessageCircle,
  UserPlus,
  UsersRound,
  Share2,
  CalendarDays,
  Car,
  BatteryFull,
  Leaf,
  Repeat,
  ShieldAlert,
  Bot,
  ArrowUpRight,
  Milestone,
  Briefcase,
  BadgePlus,
  Goal,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trofei | CalcettoXP",
  description:
    "La tua collezione di trofei CalcettoXP. 50 obiettivi tra FREE e PRO da sbloccare durante la carriera.",
};

const ICON_MAP: Record<string, LucideIcon> = {
  Footprints,
  Trophy,
  Sparkles,
  Share2,
  MessageCircle,
  UserPlus,
  Users,
  UsersRound,
  Crown,
  Search,
  Megaphone,
  Zap,
  Flame,
  CalendarDays,
  Car,
  Medal,
  Target,
  BatteryFull,
  Leaf,
  Swords,
  Award,
  Repeat,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Bot,
  TrendingUp,
  ArrowUpRight,
  Star,
  Milestone,
  Briefcase,
  BadgePlus,
  Gem,
  BookOpen,
  BookMarked,
  Infinity,
  Diamond,
  Globe,
  Rocket,
  Goal,
};

function IconByName({ name, className }: { name: string; className?: string }) {
  const Ic = ICON_MAP[name] ?? Award;
  return <Ic className={className} aria-hidden />;
}

function ProgressBar({
  value,
  variant = "green",
  thickness = "md",
}: {
  value: number;
  variant?: "green" | "gold" | "amber";
  thickness?: "sm" | "md";
}) {
  const v = Math.max(0, Math.min(1, value));
  const track = thickness === "sm" ? "h-[4px]" : "h-2";
  const fill =
    variant === "gold"
      ? "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 shadow-[0_0_12px_rgba(251,191,36,0.35)]"
      : variant === "amber"
        ? "bg-gradient-to-r from-amber-500/90 to-amber-300/90"
        : "bg-gradient-to-r from-greenPrimary via-greenElectric to-emerald-400 shadow-[0_0_12px_rgba(124,255,107,0.3)]";
  return (
    <div
      className={`relative w-full ${track} rounded-full overflow-hidden bg-white/5 border border-white/5`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
    >
      <div
        className={`h-full ${fill} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${Math.round(v * 100)}%` }}
      />
    </div>
  );
}

function CircularProgress({
  value,
  size = 140,
  stroke = 10,
  variant = "green",
}: {
  value: number;
  size?: number;
  stroke?: number;
  variant?: "green" | "gold";
}) {
  const v = Math.max(0, Math.min(1, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - v);
  const gradId = variant === "gold" ? "ring-gold" : "ring-green";
  const trackColor = variant === "gold" ? "rgba(251,191,36,0.08)" : "rgba(124,255,107,0.08)";
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          {variant === "gold" ? (
            <>
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#fde68a" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#7dff6b" />
              <stop offset="60%" stopColor="#47ff5b" />
              <stop offset="100%" stopColor="#a9ff8a" />
            </>
          )}
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 600ms ease-out" }}
      />
    </svg>
  );
}

function formatCompactNum(n: number): string {
  if (!isFinite(n)) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat("it-IT").format(n);
}

function reqLabel(p: EntryProgress, entry: AchievementCatalogEntry | undefined): string {
  if (!entry) return "";
  if (p.bestRolePath) {
    const { roleLabel, metricLabel, target } = formatRoleAggregateForPath({
      role: p.bestRolePath.role,
      metric: p.bestRolePath.metric,
      target: p.bestRolePath.target,
    });
    return `${roleLabel}: ${formatCompactNum(p.current)} / ${target} ${metricLabel}`;
  }
  const k = entry.requirement.kind;
  switch (k) {
    case "LIFETIME_MATCHES":
      return `${formatCompactNum(p.current)} / ${p.target} partite`;
    case "LIFETIME_WINS":
      return `${formatCompactNum(p.current)} / ${p.target} vittorie`;
    case "LIFETIME_LEVEL":
      return `LV ${formatCompactNum(p.current)} / ${p.target}`;
    case "LIFETIME_CI":
      return `CI ${formatCompactNum(p.current)} / ${p.target}`;
    case "LIFETIME_XP":
      return `${formatCompactNum(p.current)} / ${formatCompactNum(p.target)} XP`;
    case "STREAK_UNBEATEN":
      return `${p.current} / ${p.target} partite imbattuto`;
    case "STREAK_WIN":
      return `${p.current} / ${p.target} vittorie consecutive`;
    case "SHARE_VALID_DAYS":
      return `${p.current} / ${p.target} giorni di condivisione`;
    case "REFERRAL_CONFIRMED":
      return `${p.current} / ${p.target} referral confermati`;
    case "SEASONS_DISTINCT":
      return `${p.current} / ${p.target} stagioni giocate`;
    case "FIRST_CONTRIBUTION":
      return p.requirementMet ? "Primo contributo ottenuto" : "Ottieni il primo contributo";
  }
  return `${formatCompactNum(p.current)} / ${p.target}`;
}

function remainLabel(p: EntryProgress, entry: AchievementCatalogEntry | undefined): string | null {
  if (p.requirementMet) return null;
  const remain = Math.max(0, p.target - p.current);
  if (!entry) return `Te ne mancano ${formatCompactNum(remain)}.`;
  if (entry.requirement.kind === "FIRST_CONTRIBUTION") return null;
  if (entry.requirement.kind === "LIFETIME_LEVEL")
    return `Ti manca ${remain} livello per sbloccarlo.`;
  if (entry.requirement.kind === "LIFETIME_CI")
    return `Ti mancano ${formatCompactNum(remain)} punti CI.`;
  if (entry.requirement.kind === "LIFETIME_XP")
    return `Ti mancano ${formatCompactNum(remain)} XP.`;
  if (entry.requirement.kind === "SEASONS_DISTINCT")
    return `Ti mancano ${remain} ${remain === 1 ? "stagione" : "stagioni"}.`;
  if (entry.requirement.kind === "STREAK_UNBEATEN" || entry.requirement.kind === "STREAK_WIN")
    return `Te ne mancano ${remain} ${remain === 1 ? "nella striscia" : "nella striscia"}.`;
  return `Te ne mancano ${formatCompactNum(remain)}.`;
}

function TrophyCard({
  entry,
  progress,
  isPro,
}: {
  entry: AchievementCatalogEntry | undefined;
  progress: EntryProgress;
  isPro: boolean;
}) {
  if (!entry) return null;
  const tier = entry.tier;
  const unlocked = progress.isUnlocked;
  const lockedBySubscription = tier === "PRO" && !isPro;
  const proCompletedButLocked = tier === "PRO" && progress.requirementMet && !unlocked;

  const isFREE = tier === "FREE";

  let shellOuter =
    "relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12141a] via-[#0e1015] to-[#0a0b10] border border-white/5 shadow-[0_1px_0_rgba(255,255,255,0.02)_inset] transition hover:translate-y-[-1px]";
  let shellInner = "p-4 sm:p-5 h-full flex flex-col gap-3";
  let iconWrap =
    "relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0";
  let iconColor = "text-[#8a8f9c]";

  if (isFREE && unlocked) {
    shellOuter =
      "relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#111914] via-[#0e1513] to-[#0a0e0c] border-[#7dff6b]/20 shadow-[0_0_24px_rgba(124,255,107,0.08),0_1px_0_rgba(124,255,107,0.08)_inset] transition hover:shadow-[0_0_40px_rgba(124,255,107,0.14)]";
    iconWrap +=
      " bg-gradient-to-br from-greenPrimary/25 via-greenElectric/20 to-transparent border border-greenElectric/35";
    iconColor = "text-greenElectric drop-shadow-[0_0_6px_rgba(124,255,107,0.5)]";
  } else if (isFREE && !unlocked) {
    shellOuter =
      "relative overflow-hidden rounded-2xl bg-[#0f1116]/80 border border-white/[0.06] backdrop-blur-[1px] shadow-[0_1px_0_rgba(255,255,255,0.02)_inset] transition hover:border-white/10";
    iconWrap += " bg-[#0c0e13]/90 border border-white/[0.05]";
    iconColor = "text-[#7a7f8c]/70";
  } else if (!isFREE && unlocked) {
    shellOuter =
      "relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18130a] via-[#120f09] to-[#0b0906] border border-amber-400/25 shadow-[0_0_24px_rgba(251,191,36,0.1),0_1px_0_rgba(251,191,36,0.08)_inset] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.18)]";
    iconWrap +=
      " bg-gradient-to-br from-amber-400/25 via-amber-300/12 to-transparent border border-amber-300/40";
    iconColor = "text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.45)]";
  } else if (!isFREE && !unlocked) {
    shellOuter =
      "relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e0c0a] via-[#0b0908] to-[#080706] border border-amber-500/15 shadow-[0_1px_0_rgba(251,191,36,0.04)_inset] transition hover:border-amber-500/25";
    iconWrap += " bg-[#120f0a]/90 border border-amber-400/10";
    iconColor = "text-amber-200/45";
  }

  return (
    <div className={shellOuter}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_60%)]" />
      {(unlocked || proCompletedButLocked) && (
        <div
          className={`pointer-events-none absolute inset-0 mix-blend-overlay opacity-20 ${
            isFREE ? "bg-[radial-gradient(circle_at_0%_0%,rgba(124,255,107,0.35),transparent_55%)]" : "bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.3),transparent_55%)]"
          }`}
          aria-hidden
        />
      )}
      <div className={shellInner}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={iconWrap}>
              <IconByName name={entry.icon} className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColor}`} />
              <div
                className={`pointer-events-none absolute inset-0 rounded-xl ${
                  unlocked
                    ? isFREE
                      ? "shadow-[0_0_30px_rgba(124,255,107,0.15)_inset]"
                      : "shadow-[0_0_30px_rgba(251,191,36,0.15)_inset]"
                    : ""
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-[15px] sm:text-base font-black tracking-tight text-textPrimary leading-snug break-words min-w-0">
                  {entry.name}
                </h3>
                {!isFREE && (
                  <Badge
                    variant="outline"
                    className="h-5 text-[9.5px] uppercase tracking-[0.08em] border-amber-400/35 bg-amber-400/5 text-amber-300 shrink-0"
                  >
                    <Crown size={8} className="mr-1" />
                    PRO
                  </Badge>
                )}
                {isFREE && unlocked && (
                  <Badge
                    variant="outline"
                    className="h-5 text-[9.5px] uppercase tracking-[0.08em] border-greenElectric/40 bg-greenElectric/5 text-greenElectric shrink-0"
                  >
                    <Check size={8} className="mr-1" />
                    Sbloccato
                  </Badge>
                )}
                {!isFREE && unlocked && (
                  <Badge
                    variant="outline"
                    className="h-5 text-[9.5px] uppercase tracking-[0.08em] border-amber-300/50 bg-amber-300/5 text-amber-200 shrink-0"
                  >
                    <Check size={8} className="mr-1" />
                    Sbloccato · PRO
                  </Badge>
                )}
              </div>
              {unlocked && progress.unlockedAt ? (
                <p className="mt-1 text-[11px] text-textMuted font-medium">
                  {format(progress.unlockedAt, "d MMM yyyy", { locale: it })}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-[#7a7f8c]/80 line-clamp-2 leading-snug">
                  {entry.description}
                </p>
              )}
            </div>
          </div>
          {!unlocked && lockedBySubscription && (
            <div
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border border-amber-400/25 bg-amber-400/[0.07]"
              aria-label="Contenuto PRO"
            >
              <Lock size={14} className="text-amber-300" />
            </div>
          )}
          {!unlocked && !lockedBySubscription && isFREE && (
            <div
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07] bg-white/[0.02]"
              aria-label="Non sbloccato"
            >
              <Lock size={13} className="text-[#7a7f8c]" />
            </div>
          )}
        </div>

        <div className="space-y-2 mt-1">
          <div className="flex items-center justify-between gap-3 text-[11.5px] font-semibold">
            <span
              className={
                unlocked
                  ? isFREE
                    ? "text-greenElectric/90"
                    : "text-amber-300"
                  : "text-textMuted"
              }
            >
              {reqLabel(progress, entry)}
            </span>
            <span className="shrink-0 text-[10.5px] uppercase tracking-wider text-[#7a7f8c]/90">
              {Math.round(progress.percentage * 100)}%
            </span>
          </div>
          <ProgressBar
            value={progress.percentage}
            variant={
              !isFREE && (unlocked || proCompletedButLocked)
                ? "gold"
                : !isFREE
                  ? "amber"
                  : "green"
            }
            thickness="sm"
          />
        </div>

        {proCompletedButLocked && (
          <div className="mt-0.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-3 py-2 flex items-center gap-2">
            <Crown size={12} className="text-amber-300 shrink-0" />
            <p className="text-[11.5px] font-semibold text-amber-200 leading-snug">
              COMPLETATO · <span className="text-amber-300/90">DISPONIBILE CON PRO</span>
            </p>
          </div>
        )}
        {!unlocked && !proCompletedButLocked && !lockedBySubscription ? (
          <p className="text-[11.5px] text-[#8a8f9c]">
            {remainLabel(progress, entry)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Hero({
  unlockedFree,
  unlockedPro,
  completedButLockedPro,
  totalFree,
  totalPro,
}: {
  unlockedFree: number;
  unlockedPro: number;
  completedButLockedPro: number;
  totalFree: number;
  totalPro: number;
}) {
  const total = totalFree + totalPro;
  const unlocked = unlockedFree + unlockedPro;
  const percent = unlocked / total;

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-gradient-to-br from-[#0c0e14] via-[#0a0b10] to-[#08090d] p-[1px] shadow-[0_0_60px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-greenPrimary/10 blur-[120px] opacity-70" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 w-[420px] h-[420px] rounded-full bg-amber-400/10 blur-[120px] opacity-70" />
      <div className="relative rounded-[21px] bg-[#0a0b10]/85 backdrop-blur px-4 sm:px-6 md:px-8 py-6 sm:py-7 md:py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative shrink-0">
            <CircularProgress value={percent} size={140} stroke={11} variant="green" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center -mt-1">
              <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#7a7f8c] font-bold">
                Collezione
              </p>
              <p className="mt-1 text-3xl font-black text-textPrimary tracking-tight leading-none">
                {unlocked}
                <span className="text-[#7a7f8c] font-bold text-lg mx-1">/</span>
                <span className="text-xl font-bold text-[#8a8f9c]">{total}</span>
              </p>
              <p className="mt-1 text-[10.5px] uppercase tracking-[0.18em] text-greenElectric font-black">
                {Math.round(percent * 100)}%
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center md:items-start gap-4 w-full text-center md:text-left">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#7a7f8c] font-bold">
                Bacheca
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl md:text-[44px] font-black tracking-[-0.03em] text-textPrimary leading-[1.03]">
                Trofei
              </h1>
              <p className="mt-2 text-sm text-textMuted max-w-xl">
                50 obiettivi di carriera. FREE e PRO avanzano insieme: quando passi a PRO,
                sblocchi retroattivamente tutti i traguardi già raggiunti.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
              <div className="rounded-2xl border border-greenElectric/20 bg-gradient-to-br from-greenPrimary/[0.08] to-transparent p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] uppercase tracking-[0.18em] border-greenElectric/30 text-greenElectric bg-greenElectric/5"
                  >
                    FREE
                  </Badge>
                  <Sparkles size={12} className="text-greenElectric/80" />
                </div>
                <p className="mt-2 text-2xl font-black text-textPrimary tracking-tight">
                  {unlockedFree}
                  <span className="text-[#7a7f8c] text-sm font-bold mx-1">/</span>
                  <span className="text-sm font-bold text-[#8a8f9c]">{totalFree}</span>
                </p>
                <div className="mt-3">
                  <ProgressBar value={unlockedFree / Math.max(1, totalFree)} variant="green" />
                </div>
              </div>
              <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.07] to-transparent p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] uppercase tracking-[0.18em] border-amber-400/35 bg-amber-400/5 text-amber-300"
                  >
                    <Crown size={8} className="mr-1" /> PRO
                  </Badge>
                  <Medal size={12} className="text-amber-300/85" />
                </div>
                <p className="mt-2 text-2xl font-black text-textPrimary tracking-tight">
                  {unlockedPro}
                  <span className="text-[#7a7f8c] text-sm font-bold mx-1">/</span>
                  <span className="text-sm font-bold text-[#8a8f9c]">{totalPro}</span>
                </p>
                <div className="mt-3">
                  <ProgressBar
                    value={(unlockedPro + completedButLockedPro) / Math.max(1, totalPro)}
                    variant="gold"
                  />
                </div>
                {completedButLockedPro > 0 && (
                  <p className="mt-2 text-[10.5px] text-amber-300 font-semibold tracking-wide">
                    {completedButLockedPro} completati in attesa di PRO
                  </p>
                )}
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-white/[0.07] bg-[#0e1016] p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#7a7f8c] font-bold">
                    Carriera
                  </span>
                  <Trophy size={12} className="text-[#8a8f9c]" />
                </div>
                <p className="mt-2 text-[11px] text-[#8a8f9c] font-semibold">
                  Completamento
                </p>
                <p className="text-2xl font-black tracking-tight bg-gradient-to-r from-greenElectric via-emerald-300 to-amber-300 bg-clip-text text-transparent">
                  {Math.round(percent * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NextLastRow({
  next,
  last,
}: {
  next: EntryProgress | null;
  last: EntryProgress | null;
}) {
  const nextEntry = next ? findCatalogEntryByKey(next.key) : undefined;
  const lastEntry = last ? findCatalogEntryByKey(last.key) : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      <Card className="overflow-hidden border-white/[0.06] bg-gradient-to-br from-[#0e1016] to-[#0a0b10]">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10.5px] uppercase tracking-[0.24em] font-black text-greenElectric">
              Prossimo trofeo
            </p>
            <Target size={13} className="text-greenElectric/75" />
          </div>
          {nextEntry && next ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br from-greenPrimary/20 via-greenElectric/15 to-transparent border border-greenElectric/30">
                  <IconByName name={nextEntry.icon} className="w-6 h-6 text-greenElectric" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black tracking-tight text-textPrimary leading-tight break-words">
                    {nextEntry.name}
                  </h3>
                  <p className="text-[11.5px] text-[#8a8f9c] mt-0.5 leading-snug line-clamp-2">
                    {nextEntry.description}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-[11.5px] font-semibold">
                  <span className="text-textMuted">{reqLabel(next, nextEntry)}</span>
                  <span className="text-greenElectric uppercase tracking-wider text-[10.5px]">
                    {Math.round(next.percentage * 100)}%
                  </span>
                </div>
                <ProgressBar value={next.percentage} variant="green" />
              </div>
              {!next.requirementMet && (
                <p className="text-[11.5px] text-greenElectric/90 font-semibold">
                  {remainLabel(next, nextEntry)}
                </p>
              )}
              {nextEntry.tier === "PRO" && (
                <Badge
                  variant="outline"
                  className="self-start h-5 text-[9.5px] uppercase tracking-[0.1em] border-amber-400/35 bg-amber-400/5 text-amber-300"
                >
                  <Crown size={8} className="mr-1" /> PRO
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#8a8f9c]">
              Tutti i prossimi traguardi sono stati raggiunti. Ottimo lavoro.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-white/[0.06] bg-gradient-to-br from-[#120f09] to-[#0a0907] border-amber-400/15">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10.5px] uppercase tracking-[0.24em] font-black text-amber-300">
              Ultimo sbloccato
            </p>
            <Sparkles size={13} className="text-amber-300/80" />
          </div>
          {lastEntry && last?.unlockedAt ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-400/25 via-amber-300/12 to-transparent border border-amber-300/40 shadow-[0_0_24px_rgba(251,191,36,0.14)]">
                  <IconByName
                    name={lastEntry.icon}
                    className="w-6 h-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black tracking-tight text-textPrimary leading-tight break-words">
                    {lastEntry.name}
                  </h3>
                  <p className="text-[11.5px] text-amber-300/90 mt-0.5 font-semibold tracking-wide">
                    Sbloccato il {format(last.unlockedAt, "d MMMM yyyy", { locale: it })}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-[#9a9283] leading-snug">
                {lastEntry.description}
              </p>
              {lastEntry.tier === "PRO" ? (
                <Badge
                  variant="outline"
                  className="self-start h-5 text-[9.5px] uppercase tracking-[0.1em] border-amber-400/35 bg-amber-400/5 text-amber-300"
                >
                  <Crown size={8} className="mr-1" /> PRO
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="self-start h-5 text-[9.5px] uppercase tracking-[0.1em] border-greenElectric/35 bg-greenElectric/5 text-greenElectric"
                >
                  FREE
                </Badge>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-amber-400/20 p-4 text-center">
              <Trophy size={18} className="mx-auto mb-2 text-amber-300/70" />
              <p className="text-sm text-[#9a9283]">
                Nessun trofeo ancora sbloccato. Inizia a registrare le tue partite.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategorySection({
  categoryKey,
  entries,
  progressByKey,
  isPro,
}: {
  categoryKey: AchievementCategory;
  entries: AchievementCatalogEntry[];
  progressByKey: Map<string, EntryProgress>;
  isPro: boolean;
}) {
  const meta = ACHIEVEMENT_CATEGORIES_META[categoryKey];
  const total = entries.length;
  let unlocked = 0;
  let bestPercentSum = 0;
  for (const e of entries) {
    const p = progressByKey.get(e.key);
    if (p?.isUnlocked) unlocked++;
    bestPercentSum += p?.percentage ?? 0;
  }
  const avgPct = total > 0 ? bestPercentSum / total : 0;
  const isPrestigePro = categoryKey === "prestige_pro" || categoryKey === "specialista" || categoryKey === "stagioni";
  const accent = isPrestigePro ? "gold" : categoryKey === "career_index" || categoryKey === "livello_xp" ? "amber" : "green";

  return (
    <section
      id={`cat-${categoryKey}`}
      className="scroll-mt-20 relative overflow-hidden rounded-2xl border border-white/[0.05] bg-[#0b0c11]/80 backdrop-blur-sm"
    >
      <header className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 pb-3 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
              accent === "gold"
                ? "bg-amber-400/10 border border-amber-400/25"
                : accent === "amber"
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-greenPrimary/10 border border-greenElectric/20"
            }`}
          >
            {accent === "gold" ? (
              <Crown size={15} className="text-amber-300" />
            ) : accent === "amber" ? (
              <Star size={15} className="text-amber-400" />
            ) : (
              <Trophy size={15} className="text-greenElectric" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-[13px] sm:text-sm font-black tracking-[0.2em] uppercase text-textPrimary">
              {meta.label}
            </h2>
            <p className="mt-0.5 text-[11px] text-[#7a7f8c] max-w-xl">{meta.description}</p>
          </div>
        </div>
        <div className="w-full sm:w-[220px] shrink-0 space-y-1.5">
          <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] font-bold">
            <span className="text-[#8a8f9c]">Sbloccati</span>
            <span
              className={
                accent === "gold"
                  ? "text-amber-300"
                  : accent === "amber"
                    ? "text-amber-400"
                    : "text-greenElectric"
              }
            >
              {unlocked}/{total}
            </span>
          </div>
          <ProgressBar
            value={total > 0 ? unlocked / total : 0}
            variant={accent === "green" ? "green" : "gold"}
            thickness="sm"
          />
          <p className="text-[10.5px] text-[#7a7f8c] text-right font-semibold">
            progresso medio {Math.round(avgPct * 100)}%
          </p>
        </div>
      </header>
      <div className="p-4 sm:p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
        {entries.map((entry) => {
          const p = progressByKey.get(entry.key)!;
          return <TrophyCard key={entry.key} entry={entry} progress={p} isPro={isPro} />;
        })}
      </div>
    </section>
  );
}

export default async function AchievementsPage() {
  const session = await auth();
  const userId = session?.user?.userId ?? session?.user?.id;
  if (!userId) redirect("/signin?next=/achievements");

  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          subscription: {
            select: { subscriptionStatus: true, currentPeriodEnd: true },
          },
        },
      },
    },
  });
  if (!profile) redirect("/onboarding");

  const isPro =
    profile.user?.subscription?.subscriptionStatus === "ACTIVE" ||
    profile.user?.subscription?.subscriptionStatus === "TRIALING" ||
    profile.user?.subscription?.subscriptionStatus === "PAST_DUE";

  const ctx = await buildAggregatorContext(profile.id, { profile });
  const evalRes = await evaluateAchievementProgress(profile.id, {
    context: ctx,
    skipSync: true,
  });

  const counts = countCatalogByTier();
  const progressByKey = new Map(evalRes.all.map((p) => [p.key, p]));

  const categories: AchievementCategory[] = Object.keys(
    ACHIEVEMENT_CATEGORIES_META
  ) as AchievementCategory[];
  categories.sort(
    (a, b) => ACHIEVEMENT_CATEGORIES_META[a].order - ACHIEVEMENT_CATEGORIES_META[b].order
  );

  return (
    <div className="min-h-[100dvh] w-full bg-bgPrimary pb-28 md:pb-16 relative">
      <div className="absolute inset-0 pitch-wrapper opacity-20 pointer-events-none" aria-hidden />
      <main className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 md:px-6 pt-5 sm:pt-6 md:pt-8 space-y-6">
        <Hero
          unlockedFree={evalRes.summary.unlockedFree}
          unlockedPro={evalRes.summary.unlockedPro}
          completedButLockedPro={evalRes.summary.completedButLockedPro}
          totalFree={counts.free}
          totalPro={counts.pro}
        />
        <NextLastRow next={evalRes.nextClosest} last={evalRes.lastUnlocked} />
        <div className="space-y-4 sm:space-y-5">
          {categories.map((cat) => {
            const entries = ACHIEVEMENT_CATALOG.filter((e) => e.category === cat).sort(
              (a, b) => a.order - b.order
            );
            if (entries.length === 0) return null;
            return (
              <CategorySection
                key={cat}
                categoryKey={cat}
                entries={entries}
                progressByKey={progressByKey}
                isPro={isPro}
              />
            );
          })}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
