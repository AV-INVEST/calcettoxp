"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Star,
  ArrowRight,
  Target,
  Zap,
  Award,
  Home,
  Sparkles,
  Flame,
  Crown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  getLevelProgress,
  getStatusFromLevel,
  type PlayerStatus,
} from "@/lib/xp-levels";

type Role = "POR" | "DIF" | "CEN" | "ATT";
type MatchResult = "WIN" | "DRAW" | "LOSS";

type MatchData = {
  id: string;
  playedAt: string;
  result: MatchResult;
  goalsFor: number;
  goalsAgainst: number;
  role: Role;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  notes: string | null;
  careerIndexBefore: number;
  careerIndexAfter: number;
  careerIndexChange: number;
  xpEarned: number;
  seasonKey: string | null;
};

type UnlockedAchievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string | null;
  tier: "FREE" | "PRO";
  unlockedAt: Date | null;
};

type Props = {
  match: MatchData;
  xpEarned: number;
  oldXp: number;
  newXp: number;
  oldCI: number;
  newCI: number;
  oldOverall: number;
  newOverall: number;
  oldLevel: number;
  newLevel: number;
  oldStatus?: PlayerStatus;
  newStatus?: PlayerStatus;
  unlockedAchievements: UnlockedAchievement[];
  onClose?: () => void;
  onReset?: () => void;
};

const STATUS_LABEL: Record<PlayerStatus, string> = {
  NOVIZIO: "Novizio",
  EMERGENTE: "Emergente",
  AFFERMATO: "Affermato",
  VETERANO: "Veterano",
  LEGGENDA: "Leggenda",
};

const RESULT_INFO: Record<
  MatchResult,
  {
    label: string;
    badgeVariant: "verde" | "rosso" | "grigio";
    bannerCls: string;
    bannerText: string;
  }
> = {
  WIN: {
    label: "VITTORIA",
    badgeVariant: "verde",
    bannerCls:
      "bg-gradient-to-r from-greenPrimary/30 via-greenElectric/30 to-greenPrimary/30 border-greenElectric/40",
    bannerText: "text-greenElectric",
  },
  DRAW: {
    label: "PAREGGIO",
    badgeVariant: "grigio",
    bannerCls:
      "bg-gradient-to-r from-white/10 via-white/5 to-white/10 border-white/20",
    bannerText: "text-textMuted",
  },
  LOSS: {
    label: "SCONFITTA",
    badgeVariant: "rosso",
    bannerCls:
      "bg-gradient-to-r from-danger/20 via-danger/10 to-danger/20 border-danger/40",
    bannerText: "text-danger",
  },
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = () => setReduced(mq.matches);
    mq.addEventListener?.("change", listener);
    return () => mq.removeEventListener?.("change", listener);
  }, []);
  return reduced;
}

function useCountUp(
  target: number,
  duration: number,
  start: boolean,
  initial: number = 0,
) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    if (!start) return;
    if (target === initial) {
      setValue(target);
      return;
    }
    let raf: number;
    const t0 = performance.now();
    const tick = (t: number) => {
      const elapsed = t - t0;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(initial + (target - initial) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start, initial]);
  return value;
}

export default function MatchResultScreen({
  match,
  xpEarned,
  oldXp,
  newXp,
  oldCI,
  newCI,
  oldOverall,
  newOverall,
  oldLevel,
  newLevel,
  oldStatus: oldStatusProp,
  newStatus: newStatusProp,
  unlockedAchievements,
  onClose,
  onReset,
}: Props) {
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();

  const leveledUp = newLevel > oldLevel;
  const oldStatus = oldStatusProp ?? getStatusFromLevel(oldLevel);
  const newStatus = newStatusProp ?? getStatusFromLevel(newLevel);
  const statusChanged = newStatus !== oldStatus;

  const ciDelta = newCI - oldCI;
  const ovrDelta = newOverall - oldOverall;

  const oldProgress = useMemo(() => getLevelProgress(oldXp), [oldXp]);
  const newProgress = useMemo(() => getLevelProgress(newXp), [newXp]);

  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const showFinal = phase >= 5;

  useEffect(() => {
    if (reducedMotion) {
      setPhase(5);
      return;
    }
    const timers = [
      setTimeout(() => setPhase(1), 650),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2900),
      setTimeout(() => setPhase(4), 4200),
      setTimeout(() => setPhase(5), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion, leveledUp, statusChanged]);

  const xpCount = useCountUp(xpEarned, 1000, phase >= 1, 0);
  const ciDisplay = useCountUp(newCI, 1200, phase >= 3, oldCI);
  const overallDisplay = useCountUp(newOverall, 1000, phase >= 3, oldOverall);

  const levelUpAnim = phase >= 4 && leveledUp;
  const newStatusAnim = phase >= 4 && statusChanged;

  type XpBarState = {
    levelLabel: string;
    xpInLevel: number;
    xpThreshold: number;
    progressPct: number;
  };

  const initialXpDisplay: XpBarState = {
    levelLabel: `LV ${oldProgress.currentLevel}`,
    xpInLevel: oldProgress.xpInCurrentLevel,
    xpThreshold: Math.max(
      1,
      oldProgress.nextThreshold - oldProgress.currentThreshold,
    ),
    progressPct: oldProgress.progressPct,
  };

  const [xpAnimDisplay, setXpAnimDisplay] =
    useState<XpBarState>(initialXpDisplay);

  useEffect(() => {
    if (reducedMotion) {
      const thr = Math.max(
        1,
        newProgress.nextThreshold - newProgress.currentThreshold,
      );
      setXpAnimDisplay({
        levelLabel: leveledUp
          ? `LV ${newLevel}`
          : `LV ${newProgress.currentLevel}`,
        xpInLevel: newProgress.xpInCurrentLevel,
        xpThreshold: thr,
        progressPct: newProgress.progressPct,
      });
      return;
    }

    if (phase < 2) {
      setXpAnimDisplay({
        levelLabel: `LV ${oldProgress.currentLevel}`,
        xpInLevel: oldProgress.xpInCurrentLevel,
        xpThreshold: Math.max(
          1,
          oldProgress.nextThreshold - oldProgress.currentThreshold,
        ),
        progressPct: oldProgress.progressPct,
      });
      return;
    }

    if (phase >= 5) {
      const thr = Math.max(
        1,
        newProgress.nextThreshold - newProgress.currentThreshold,
      );
      setXpAnimDisplay({
        levelLabel: leveledUp
          ? `LV ${newLevel}`
          : `LV ${newProgress.currentLevel}`,
        xpInLevel: newProgress.xpInCurrentLevel,
        xpThreshold: thr,
        progressPct: newProgress.progressPct,
      });
      return;
    }

    const oldThr = Math.max(
      1,
      oldProgress.nextThreshold - oldProgress.currentThreshold,
    );
    const newThr = Math.max(
      1,
      newProgress.nextThreshold - newProgress.currentThreshold,
    );
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);

    let rafId = 0;
    const tPhaseStart = performance.now();

    if (!leveledUp) {
      const totalDur = 1300;
      const startPct = oldProgress.progressPct;
      const endPct = newProgress.progressPct;
      const startXp = oldProgress.xpInCurrentLevel;
      const endXp = newProgress.xpInCurrentLevel;
      const tick = (t: number) => {
        const p = Math.min(1, (t - tPhaseStart) / totalDur);
        const e = ease(p);
        setXpAnimDisplay({
          levelLabel: `LV ${newProgress.currentLevel}`,
          xpInLevel: Math.round(startXp + (endXp - startXp) * e),
          xpThreshold: newThr,
          progressPct: startPct + (endPct - startPct) * e,
        });
        if (p < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    } else {
      const dur1 = 1000;
      const gapMs = 250;
      const dur2 = 1100;

      const step1EndPct = 100;
      const step1StartPct = oldProgress.progressPct;
      const step1StartXp = oldProgress.xpInCurrentLevel;
      const step1EndXp = oldThr;

      const step2StartPct = 0;
      const step2EndPct = newProgress.progressPct;
      const step2StartXp = 0;
      const step2EndXp = newProgress.xpInCurrentLevel;

      const tick = (t: number) => {
        const elapsed = t - tPhaseStart;
        if (elapsed < dur1) {
          const p = elapsed / dur1;
          const e = ease(p);
          setXpAnimDisplay({
            levelLabel: `LV ${oldProgress.currentLevel}`,
            xpInLevel: Math.round(
              step1StartXp + (step1EndXp - step1StartXp) * e,
            ),
            xpThreshold: oldThr,
            progressPct: step1StartPct + (step1EndPct - step1StartPct) * e,
          });
        } else if (elapsed < dur1 + gapMs) {
          setXpAnimDisplay({
            levelLabel: `LV ${oldProgress.currentLevel}`,
            xpInLevel: step1EndXp,
            xpThreshold: oldThr,
            progressPct: 100,
          });
        } else if (elapsed < dur1 + gapMs + dur2) {
          const p = (elapsed - dur1 - gapMs) / dur2;
          const e = ease(p);
          setXpAnimDisplay({
            levelLabel: `LV ${newLevel}`,
            xpInLevel: Math.round(
              step2StartXp + (step2EndXp - step2StartXp) * e,
            ),
            xpThreshold: newThr,
            progressPct: step2StartPct + (step2EndPct - step2StartPct) * e,
          });
        } else {
          setXpAnimDisplay({
            levelLabel: `LV ${newLevel}`,
            xpInLevel: step2EndXp,
            xpThreshold: newThr,
            progressPct: step2EndPct,
          });
          return;
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(rafId);
  }, [
    phase,
    reducedMotion,
    leveledUp,
    oldProgress,
    newProgress,
    newLevel,
  ]);

  const info = RESULT_INFO[match.result];

  return (
    <div className="space-y-5 animate-[fadeIn_0.4s_ease-out] max-w-2xl mx-auto">
      {/* FASE 0: Risultato e punteggio */}
      <div
        className={`relative overflow-hidden rounded-2xl border ${info.bannerCls} p-5`}
      >
        <div className="absolute -right-8 -top-8 opacity-20">
          <Trophy size={140} className={info.bannerText} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <Badge variant={info.badgeVariant} className="mb-2">
              {info.label}
            </Badge>
            <h2 className="text-lg font-bold text-textPrimary">
              PARTITA REGISTRATA
            </h2>
          </div>
          {match.result === "WIN" && !reducedMotion && (
            <div className="hidden sm:flex items-center gap-1 animate-[bounce_1.4s_ease-in-out_infinite]">
              {[0, 1, 2].map((i) => (
                <Star
                  key={i}
                  size={22}
                  className="text-yellow-400 fill-yellow-400/60"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 mt-5 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-black text-textPrimary tabular-nums">
              {match.goalsFor}
            </div>
          </div>
          <div className="text-2xl font-bold text-textMuted">-</div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-black text-textPrimary tabular-nums">
              {match.goalsAgainst}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-4 flex items-center justify-center gap-3">
          <Badge variant="grigio" className="uppercase tracking-wider text-[10px]">
            {match.role}
          </Badge>
          {match.goals > 0 && (
            <Badge variant="verde" className="text-[10px]">
              Gol {match.goals}
            </Badge>
          )}
          {match.assists > 0 && (
            <Badge variant="elettrico" className="text-[10px]">
              Ass {match.assists}
            </Badge>
          )}
          {match.cleanSheet && (
            <Badge variant="verde" className="text-[10px]">
              Clean Sheet
            </Badge>
          )}
        </div>
      </div>

      {/* FASE 1: XP guadagnati */}
      {(phase >= 1 || reducedMotion) && (
        <Card className="animate-[fadeInUp_0.5s_ease-out] border-blue-400/20">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center">
                  <Flame size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-textMuted uppercase tracking-widest">
                    Esperienza
                  </p>
                  <p className="text-sm font-bold text-textPrimary">
                    XP Guadagnati
                  </p>
                </div>
              </div>
              <Badge variant="elettrico">+{xpEarned} XP</Badge>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl md:text-6xl font-black tabular-nums text-greenElectric drop-shadow-[0_0_20px_rgba(124,255,107,0.25)]">
                +{xpCount}
              </span>
              <span className="mb-2 text-xl font-bold text-textMuted">XP</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FASE 2: Barra XP CUMULATIVA pre → post */}
      {(phase >= 2 || reducedMotion) && (
        <Card className="animate-[fadeInUp_0.5s_ease-out]">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-[0.18em] mb-1">
                  Progresso carriera
                </div>
                <div className="text-xl md:text-2xl font-black tabular-nums">
                  <span className="text-blue-400">
                    {xpAnimDisplay.levelLabel}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.18em] mb-1">
                  Livello
                </div>
                <div className="text-sm md:text-base font-bold tabular-nums">
                  <span className="text-textPrimary">
                    {xpAnimDisplay.xpInLevel.toLocaleString("it-IT")}
                  </span>
                  <span className="text-textMuted font-semibold mx-0.5">
                    /
                  </span>
                  <span className="text-textMuted font-semibold">
                    {xpAnimDisplay.xpThreshold.toLocaleString("it-IT")}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] font-black tabular-nums text-greenElectric">
                  {xpAnimDisplay.progressPct.toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="relative h-5 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
              <div
                className="h-full rounded-full transition-[width] duration-1500 ease-out bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                style={{ width: `${xpAnimDisplay.progressPct}%` }}
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-full mix-blend-overlay opacity-60"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.15) 100%)",
                }}
              />
            </div>

            {newProgress.currentLevel >= 50 ? (
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] md:text-xs font-black text-yellow-400">
                  ✦ LIVELLO MASSIMO RAGGIUNTO
                </p>
                <p className="text-[11px] md:text-xs text-textMuted font-medium tabular-nums">
                  Totale: {newXp.toLocaleString("it-IT")} XP
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] md:text-xs text-textMuted font-semibold">
                  {newProgress.xpToNextLevel.toLocaleString(
                    "it-IT",
                  )}{" "}
                  XP al prossimo livello
                </p>
                <p className="text-[11px] md:text-xs text-textMuted font-medium tabular-nums">
                  Totale: {newXp.toLocaleString("it-IT")} XP
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* FASE 3: CI + OVR OLD → NEW */}
      {(phase >= 3 || reducedMotion) && (
        <div className="grid grid-cols-2 gap-3 animate-[fadeInUp_0.5s_ease-out]">
          <Card>
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-greenPrimary" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-textMuted">
                    Career Index
                  </p>
                </div>
                <Badge
                  variant={ciDelta >= 0 ? "verde" : "rosso"}
                  className="text-xs"
                >
                  {ciDelta >= 0 ? "+" : ""}
                  {ciDelta}
                </Badge>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-textMuted line-through tabular-nums">
                    {oldCI}
                  </p>
                  <p
                    className="text-2xl md:text-3xl font-black tabular-nums"
                    style={{ color: "#7CFF6B" }}
                  >
                    {ciDisplay}
                  </p>
                </div>
                {ciDelta >= 0 ? (
                  match.result !== "LOSS" ? (
                    <Sparkles size={20} className="text-greenPrimary" />
                  ) : (
                    <span className="text-[10px] font-bold text-greenPrimary uppercase bg-greenPrimary/10 border border-greenPrimary/20 rounded-full px-2 py-0.5">
                      Hai tenuto bene
                    </span>
                  )
                ) : (
                  <span className="text-[10px] font-bold text-danger/90 uppercase bg-danger/10 border border-danger/20 rounded-full px-2 py-0.5">
                    La prossima andrà meglio
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-yellow-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-textMuted">
                    OVR
                  </p>
                </div>
                <Badge
                  variant={ovrDelta >= 0 ? "verde" : "rosso"}
                  className="text-xs"
                >
                  {ovrDelta >= 0 ? "+" : ""}
                  {ovrDelta}
                </Badge>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-textMuted line-through tabular-nums">
                    {oldOverall}
                  </p>
                  <p className="text-2xl md:text-3xl font-black tabular-nums text-textPrimary bg-gradient-to-br from-greenElectric via-greenPrimary to-emerald-500 bg-clip-text text-transparent">
                    {overallDisplay}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FASE 4: LEVEL UP reveal */}
      {levelUpAnim && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-greenElectric/60 bg-gradient-to-br from-greenPrimary/25 via-greenElectric/20 to-greenPrimary/25 p-6 md:p-7 shadow-2xl shadow-greenElectric/25 animate-[fadeInUp_0.5s_ease-out]">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Star
              size={200}
              className="text-greenElectric fill-greenElectric/30 animate-[spin_16s_linear_infinite]"
            />
          </div>
          <div className="relative z-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  size={reducedMotion ? 18 : 26}
                  className={`text-yellow-400 fill-yellow-400 ${
                    reducedMotion ? "" : "animate-[bounce_1s_ease-in-out_infinite]"
                  }`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-[0.22em] text-greenElectric drop-shadow-[0_0_18px_rgba(124,255,107,0.45)]">
              LEVEL UP
            </h3>
            <div className="mt-4 flex items-center justify-center gap-4 md:gap-6 text-3xl md:text-5xl font-black text-textPrimary tabular-nums">
              <span className="text-textMuted">LV {oldLevel}</span>
              <ArrowRight
                size={reducedMotion ? 22 : 30}
                className="text-greenElectric shrink-0"
              />
              <span className="text-greenElectric drop-shadow-[0_0_20px_rgba(124,255,107,0.4)]">
                LV {newLevel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FASE 4b: NUOVO STATUS reveal */}
      {newStatusAnim && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-violet-500/50 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-violet-500/20 p-5 md:p-6 shadow-2xl shadow-violet-500/20 animate-[fadeInUp_0.5s_ease-out]">
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
            <Award size={180} className="text-violet-300" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-300 mb-1.5">
                NUOVO STATUS RAGGIUNTO
              </p>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Badge variant="elettrico" className="uppercase tracking-wider text-xs bg-violet-500/20 text-violet-200 border-violet-400/40">
                  {STATUS_LABEL[newStatus]}
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-textMuted mt-2 font-medium">
                {STATUS_LABEL[oldStatus]} →{" "}
                <span className="font-bold text-violet-200">
                  {STATUS_LABEL[newStatus]}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles
                size={34}
                className="text-violet-300 animate-[pulse_2s_ease-in-out_infinite]"
              />
            </div>
          </div>
        </div>
      )}

      {/* FASE 5: Achievement sbloccati */}
      {showFinal && unlockedAchievements.length > 0 && (
        <Card className="animate-[fadeInUp_0.5s_ease-out] border-white/[0.06] bg-gradient-to-br from-[#0b0c11] to-[#0a0b10]">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-greenElectric" />
              <h3 className="font-black tracking-tight text-textPrimary">
                Trofei sbloccati ({unlockedAchievements.length})
              </h3>
            </div>
            <div className="space-y-2.5">
              {unlockedAchievements.map((a) => {
                const isPro = a.tier === "PRO";
                return (
                  <div
                    key={a.id}
                    className={`relative overflow-hidden flex items-center gap-3 rounded-xl border p-3 ${
                      isPro
                        ? "bg-gradient-to-br from-[#18130a] via-[#120f0a] to-[#0b0906] border-amber-400/30 shadow-[0_0_24px_rgba(251,191,36,0.08)]"
                        : "bg-gradient-to-br from-[#111914] via-[#0e1513] to-[#0a0e0c] border-[#7dff6b]/25 shadow-[0_0_22px_rgba(124,255,107,0.07)]"
                    }`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 mix-blend-overlay opacity-20 ${
                        isPro
                          ? "bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.4),transparent_55%)]"
                          : "bg-[radial-gradient(circle_at_0%_0%,rgba(124,255,107,0.45),transparent_55%)]"
                      }`}
                      aria-hidden
                    />
                    <div
                      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                        isPro
                          ? "bg-gradient-to-br from-amber-400/25 via-amber-300/15 to-transparent border-amber-300/40 text-amber-300"
                          : "bg-gradient-to-br from-greenPrimary/25 via-greenElectric/20 to-transparent border-greenElectric/35 text-greenElectric"
                      }`}
                    >
                      <Award size={20} />
                    </div>
                    <div className="relative min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-black tracking-tight text-textPrimary break-words min-w-0">
                          {a.name}
                        </p>
                        {isPro ? (
                          <Badge className="h-5 text-[9.5px] uppercase tracking-[0.1em] border-amber-400/35 bg-amber-400/5 text-amber-300">
                            <Crown size={8} className="mr-1" /> PRO
                          </Badge>
                        ) : (
                          <Badge className="h-5 text-[9.5px] uppercase tracking-[0.1em] border-greenElectric/40 bg-greenElectric/5 text-greenElectric">
                            <Check size={8} className="mr-1" /> FREE
                          </Badge>
                        )}
                      </div>
                      {a.description && (
                        <p className="text-[11.5px] text-[#8a8f9c] leading-snug mt-0.5 line-clamp-2">
                          {a.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FASE 5: Messaggio di progresso anche per sconfitte */}
      {showFinal && match.result === "LOSS" && (
        <Card className="animate-[fadeInUp_0.5s_ease-out] border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
          <CardContent className="p-4 md:p-5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-400/25 flex items-center justify-center shrink-0">
              <Sparkles size={17} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-textPrimary">
                Hai comunque guadagnato {xpEarned} XP.
              </p>
              <p className="text-xs text-textMuted mt-1 leading-relaxed">
                La carriera è una maratona. Ogni partita conta: il Career Index
                ricalcola la tua forma e tornerai a vincere la prossima.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA FINALE UNICA: Torna alla Dashboard */}
      {showFinal && (
        <div className="pt-1 animate-[fadeInUp_0.5s_ease-out]">
          <Button
            variant="primary"
            size="md"
            onClick={() =>
              onClose ? onClose() : router.push("/dashboard")
            }
            className="w-full"
          >
            <Home size={18} />
            Torna alla Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
