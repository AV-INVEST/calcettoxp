import { pickNextGoal, ChosenNextGoal } from '@/lib/next-goal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Target, Trophy, Flame, Zap, Crown, TrendingUp, Footprints } from 'lucide-react';

const CATEGORY_META: Record<
  string,
  { Icon: React.ComponentType<{ className?: string; size?: number }>; tint: string }
> = {
  matches: { Icon: Footprints, tint: 'text-greenElectric' },
  wins: { Icon: Trophy, tint: 'text-greenElectric' },
  goals: { Icon: Target, tint: 'text-greenElectric' },
  assists: { Icon: Zap, tint: 'text-greenElectric' },
  level: { Icon: Flame, tint: 'text-greenElectric' },
  careerIndex: { Icon: TrendingUp, tint: 'text-greenElectric' },
};

interface Props {
  input: Parameters<typeof pickNextGoal>[0];
  isPro?: boolean;
}

export function NextGoalModule({ input, isPro = false }: Props) {
  const chosen: ChosenNextGoal | null = pickNextGoal(input);

  if (!chosen) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-greenElectric" aria-hidden />
            Prossimo obiettivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-textMuted text-sm">
            Tutti gli obiettivi disponibili sono stati raggiunti. Continua a giocare: nuove
            sfide arriveranno con i prossimi aggiornamenti.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { goal, progressPct, remaining } = chosen;
  const meta = CATEGORY_META[goal.category] ?? CATEGORY_META.matches;
  const Icon = meta.Icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-2">
            <Target className="w-5 h-5 text-greenElectric" aria-hidden />
            Prossimo obiettivo
          </span>
          {goal.tier === 'PRO' && (
            <Badge variant="primary" size="xs" className="inline-flex items-center gap-1">
              <Crown className="w-3 h-3" aria-hidden /> PRO
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-greenPrimary/10 border border-greenPrimary/20 flex items-center justify-center">
            <Icon className={`w-6 h-6 ${meta.tint}`} aria-hidden />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="font-bold text-lg text-textPrimary">{goal.label}</p>
            <p className="text-xs text-textMuted">
              Attualmente a <span className="font-semibold text-textPrimary tabular-nums">{goal.current}</span>
              {' / '}
              <span className="font-semibold text-textPrimary tabular-nums">{goal.target}</span>
              {remaining > 0 && (
                <>
                  {' · '}
                  <span className="text-greenElectric font-semibold">Mancano {remaining}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-textMuted">
            <span>Progresso</span>
            <span className="font-bold text-textPrimary tabular-nums">{progressPct.toFixed(0)}%</span>
          </div>
          <Progress value={progressPct} />
        </div>
      </CardContent>
    </Card>
  );
}

export default NextGoalModule;
