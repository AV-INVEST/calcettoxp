"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Award, Crown } from "lucide-react";
import { useEffect, useState } from "react";

type AchievementTier = "FREE" | "PRO";

interface NextAchievementProgressProps {
  achievement: {
    name: string;
    description?: string;
    progress: number;
    progressTarget: number;
    tier?: AchievementTier;
  };
}

export default function NextAchievementProgress({
  achievement,
}: NextAchievementProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const pct =
    achievement.progressTarget > 0
      ? Math.min(100, (achievement.progress / achievement.progressTarget) * 100)
      : 0;

  useEffect(() => {
    const t = setTimeout(() => setAnimatedProgress(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  const tierVariant = achievement.tier === "PRO" ? "elettrico" : "grigio";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-greenPrimary/15 border border-greenPrimary/30 flex items-center justify-center shrink-0">
              <Award size={18} className="text-greenPrimary" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-textPrimary truncate">
                {achievement.name}
              </h4>
              {achievement.description && (
                <p className="text-xs text-textMuted truncate mt-0.5">
                  {achievement.description}
                </p>
              )}
            </div>
          </div>
          <Badge variant={tierVariant} className="shrink-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
            {achievement.tier === "PRO" ? (
              <span className="flex items-center gap-1">
                <Crown size={10} /> PRO
              </span>
            ) : (
              achievement.tier ?? "FREE"
            )}
          </Badge>
        </div>
        <Progress value={animatedProgress} className="mb-2.5" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-textMuted">
            Progresso
          </span>
          <span className="text-[11px] font-bold text-textPrimary tabular-nums">
            {achievement.progress}
            <span className="text-textMuted font-medium"> / </span>
            {achievement.progressTarget}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
