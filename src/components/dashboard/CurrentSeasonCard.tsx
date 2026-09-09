import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Minus,
  Mountain,
  Calendar,
} from "lucide-react";

interface CurrentSeasonCardProps {
  season: {
    name: string;
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    startCareerIndex: number;
    endCareerIndex: number;
    peakCareerIndex: number;
    startOverall: number;
    endOverall: number;
  };
}

export default function CurrentSeasonCard({ season }: CurrentSeasonCardProps) {
  const ciDelta = season.endCareerIndex - season.startCareerIndex;
  const ciPositive = ciDelta >= 0;
  const ovrDelta = season.endOverall - season.startOverall;
  const ovrPositive = ovrDelta >= 0;
  const winRate =
    season.matches > 0
      ? Math.round((season.wins / season.matches) * 100)
      : 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-greenPrimary/15 border border-greenPrimary/30 flex items-center justify-center">
              <Calendar size={20} className="text-greenPrimary" />
            </div>
            <div>
              <CardTitle className="text-lg">{season.name}</CardTitle>
              <p className="text-xs text-textMuted mt-0.5">
                Stagione corrente
              </p>
            </div>
          </div>
          <Badge
            variant={winRate >= 50 ? "verde" : winRate === 0 ? "grigio" : "elettrico"}
            className="shrink-0 text-[10px] font-bold uppercase tracking-wider"
          >
            {winRate}% WR
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-1.5">
              Partite
            </div>
            <div className="text-xl font-black text-textPrimary tabular-nums">
              {season.matches}
            </div>
          </div>
          <div className="rounded-xl bg-greenPrimary/10 p-3 text-center border border-greenPrimary/15">
            <div className="text-[10px] font-semibold text-greenPrimary uppercase tracking-wider mb-1.5">
              V
            </div>
            <div className="text-xl font-black text-greenPrimary tabular-nums">
              {season.wins}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-xl bg-white/5 p-2 text-center">
              <div className="text-[9px] font-semibold text-textMuted uppercase mb-1">
                P
              </div>
              <div className="text-sm font-black text-textMuted tabular-nums">
                {season.draws}
              </div>
            </div>
            <div className="rounded-xl bg-danger/10 p-2 text-center border border-danger/15">
              <div className="text-[9px] font-semibold text-danger uppercase mb-1">
                S
              </div>
              <div className="text-sm font-black text-danger tabular-nums">
                {season.losses}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center gap-1 mb-2">
              {ciPositive ? (
                <TrendingUp size={12} className="text-greenPrimary" />
              ) : (
                <TrendingDown size={12} className="text-danger" />
              )}
              <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
                Career Index
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-textPrimary tabular-nums">
                {season.endCareerIndex}
              </span>
              <span
                className={`text-[11px] font-bold tabular-nums ${
                  ciPositive ? "text-greenPrimary" : "text-danger"
                }`}
              >
                {ciPositive ? "+" : ""}
                {ciDelta}
              </span>
            </div>
            <div className="text-[10px] text-textMuted mt-0.5">
              Inizio: {season.startCareerIndex}
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center gap-1 mb-2">
              <Mountain size={12} className="text-greenElectric" />
              <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
                Picco CI
              </span>
            </div>
            <div className="text-lg font-black text-greenElectric tabular-nums">
              {season.peakCareerIndex}
            </div>
            <div className="text-[10px] text-textMuted mt-0.5">
              Il migliore della stagione
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center gap-1 mb-2">
              <Trophy size={12} className="text-yellow-400" />
              <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
                OVR
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-textPrimary tabular-nums">
                {season.endOverall}
              </span>
              <span
                className={`text-[11px] font-bold tabular-nums ${
                  ovrPositive ? "text-greenPrimary" : "text-danger"
                }`}
              >
                {ovrPositive ? "+" : ""}
                {ovrDelta}
              </span>
            </div>
            <div className="text-[10px] text-textMuted mt-0.5">
              Inizio: {season.startOverall}
            </div>
          </div>
        </div>

        {season.matches === 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3">
            <Minus size={16} className="text-textMuted shrink-0" />
            <p className="text-xs text-textMuted">
              Nessuna partita giocata in questa stagione. Inizia subito!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
