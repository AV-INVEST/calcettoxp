"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Star, ArrowRight, ArrowLeft, Target, Zap, Award, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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
  oldCI: number;
  newCI: number;
  oldOverall: number;
  newOverall: number;
  oldLevel: number;
  newLevel: number;
  unlockedAchievements: UnlockedAchievement[];
  onClose?: () => void;
  onReset?: () => void;
};

const RESULT_INFO: Record<MatchResult, { label: string; badgeVariant: "verde" | "rosso" | "grigio"; bannerCls: string; bannerText: string }> = {
  WIN: {
    label: "VITTORIA",
    badgeVariant: "verde",
    bannerCls: "bg-gradient-to-r from-greenPrimary/30 via-greenElectric/30 to-greenPrimary/30 border-greenElectric/40",
    bannerText: "text-greenElectric",
  },
  DRAW: {
    label: "PAREGGIO",
    badgeVariant: "grigio",
    bannerCls: "bg-gradient-to-r from-white/10 via-white/5 to-white/10 border-white/20",
    bannerText: "text-textMuted",
  },
  LOSS: {
    label: "SCONFITTA",
    badgeVariant: "rosso",
    bannerCls: "bg-gradient-to-r from-danger/20 via-danger/10 to-danger/20 border-danger/40",
    bannerText: "text-danger",
  },
};

function useCountUp(target: number, duration = 1500, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (t: number) => {
      const elapsed = t - t0;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

export default function MatchResultScreen({
  match,
  xpEarned,
  oldCI,
  newCI,
  oldOverall,
  newOverall,
  oldLevel,
  newLevel,
  unlockedAchievements,
  onClose,
  onReset,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const leveledUp = newLevel > oldLevel;
  const ciDelta = newCI - oldCI;
  const ovrDelta = newOverall - oldOverall;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1100),
      setTimeout(() => setPhase(3), 1800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const xpDisplay = useCountUp(xpEarned, 1400, phase >= 1);
  const ciStart = phase >= 2 ? oldCI : oldCI;
  const ciDisplay = phase >= 2 ? useCountUpCI(oldCI, newCI, 1200) : oldCI;

  const info = RESULT_INFO[match.result];

  return (
    <div className="space-y-5 animate-[fadeIn_0.4s_ease-out]">
      <div className={`relative overflow-hidden rounded-2xl border ${info.bannerCls} p-5`}>
        <div className="absolute -right-8 -top-8 opacity-20">
          <Trophy size={140} className={info.bannerText} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <Badge variant={info.badgeVariant} className="mb-2">
              {info.label}
            </Badge>
            <h2 className="text-lg font-bold text-textPrimary">PARTITA REGISTRATA</h2>
          </div>
        </div>

        <div className="relative z-10 mt-5 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-black text-textPrimary tabular-nums">
              {match.goalsFor}
            </div>
          </div>
          <div className="text-2xl font-bold text-textMuted">-</div>
          <div className="text-center">
            <div className="text-5xl font-black text-textPrimary tabular-nums">
              {match.goalsAgainst}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-greenPrimary/15 text-greenPrimary">
              <Target size={20} />
            </div>
            <div>
              <p className="text-xs text-textMuted">Gol</p>
              <p className="text-xl font-bold text-textPrimary tabular-nums">{match.goals}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-greenElectric/15 text-greenElectric">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-xs text-textMuted">Assist</p>
              <p className="text-xl font-bold text-textPrimary tabular-nums">{match.assists}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {phase >= 1 && (
        <Card className="animate-[fadeInUp_0.5s_ease-out]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-textPrimary">XP Guadagnati</p>
              <Badge variant="elettrico">+{xpEarned}</Badge>
            </div>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-4xl font-black tabular-nums text-greenElectric">
                {xpDisplay}
              </span>
              <span className="mb-1 text-lg font-semibold text-textMuted">XP</span>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-bgSecondary">
              <div
                className="h-full bg-gradient-to-r from-greenPrimary to-greenElectric transition-all duration-1500 ease-out"
                style={{
                  width: phase >= 1 ? `${Math.min(100, (xpEarned / 150) * 100)}%` : "0%",
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {phase >= 2 && (
        <div className="grid grid-cols-2 gap-3 animate-[fadeInUp_0.5s_ease-out]">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-textMuted">Career Index</p>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-xs text-textMuted line-through">{oldCI}</p>
                  <p className="text-2xl font-black tabular-nums text-textPrimary">{ciDisplay ?? newCI}</p>
                </div>
                <Badge
                  variant={ciDelta >= 0 ? "verde" : "rosso"}
                  className="text-sm"
                >
                  {ciDelta >= 0 ? "+" : ""}
                  {ciDelta}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <ArrowLeft size={12} className="text-textMuted" />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bgSecondary">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${
                      ciDelta >= 0 ? "bg-greenPrimary" : "bg-danger"
                    }`}
                    style={{ width: `${Math.min(100, Math.abs(ciDelta) / 40 * 100)}%` }}
                  />
                </div>
                <ArrowRight size={12} className="text-textMuted" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-textMuted">Overall</p>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-xs text-textMuted line-through">{oldOverall}</p>
                  <p className="text-2xl font-black tabular-nums text-textPrimary">{newOverall}</p>
                </div>
                <Badge
                  variant={ovrDelta >= 0 ? "verde" : "rosso"}
                  className="text-sm"
                >
                  {ovrDelta >= 0 ? "+" : ""}
                  {ovrDelta}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-textMuted">Liv.</span>
                <span className="font-bold text-textPrimary">
                  Lv. {newLevel}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {phase >= 2 && leveledUp && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-greenElectric/50 bg-gradient-to-br from-greenPrimary/30 via-greenElectric/20 to-greenPrimary/30 p-6 shadow-2xl shadow-greenElectric/20 animate-[pulse_2s_ease-in-out_infinite]">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Star size={200} className="text-greenElectric fill-greenElectric/30" />
          </div>
          <div className="relative z-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <Star
                  key={i}
                  size={28}
                  className="text-yellow-400 fill-yellow-400 animate-[bounce_1s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <h3 className="text-2xl font-black uppercase tracking-wider text-greenElectric drop-shadow-lg">
              LEVEL UP!
            </h3>
            <div className="mt-3 flex items-center justify-center gap-4 text-3xl font-black text-textPrimary tabular-nums">
              <span>Lv. {oldLevel}</span>
              <ArrowRight size={28} className="text-greenElectric" />
              <span className="text-greenElectric">Lv. {newLevel}</span>
            </div>
          </div>
        </div>
      )}

      {phase >= 3 && unlockedAchievements.length > 0 && (
        <Card className="animate-[fadeInUp_0.5s_ease-out]">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Award size={20} className="text-yellow-400" />
              <h3 className="font-bold text-textPrimary">
                Achievement sbloccati ({unlockedAchievements.length})
              </h3>
            </div>
            <div className="space-y-2">
              {unlockedAchievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-400/20 text-yellow-400">
                    <Award size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-textPrimary">{a.name}</p>
                    {a.description && (
                      <p className="truncate text-xs text-textMuted">{a.description}</p>
                    )}
                  </div>
                  <Badge variant={a.tier === "PRO" ? "elettrico" : "verde"}>
                    {a.tier}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          variant="secondary"
          size="md"
          onClick={onReset}
          className="w-full"
        >
          <Trophy size={18} />
          Registra un'altra
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => (onClose ? onClose() : router.push("/dashboard"))}
          className="w-full"
        >
          <Home size={18} />
          Dashboard
        </Button>
      </div>
    </div>
  );
}

function useCountUpCI(from: number, to: number, duration: number) {
  const [v, setV] = useState(from);
  useEffect(() => {
    let raf: number;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, duration]);
  return v;
}
