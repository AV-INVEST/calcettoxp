import { computePersonalRecords, PersonalRecord, RecordTier } from '@/lib/records';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  ShieldCheck,
  Flame,
  Crown,
  Trophy,
  Target,
  Zap,
  Award,
  Lock,
} from 'lucide-react';

const ICONS: Record<PersonalRecord['icon'], React.ComponentType<{ className?: string }>> = {
  CI: TrendingUp,
  OVR: ShieldCheck,
  W_STREAK: Flame,
  U_STREAK: Trophy,
  GOALS_MATCH: Target,
  ASSISTS_MATCH: Zap,
  BEST_SEASON: Award,
  MOST_GOALS_SEASON: Target,
};

const TIER_LABEL: Record<RecordTier, { label: string; variant: 'primary' | 'outline' }> = {
  FREE: { label: 'FREE', variant: 'outline' },
  PRO: { label: 'PRO', variant: 'primary' },
};

interface Props {
  input: Parameters<typeof computePersonalRecords>[0];
  isPro?: boolean;
}

export function PersonalRecordsCard({ input, isPro = false }: Props) {
  const records = computePersonalRecords(input);
  const hasLocked = input.isPro === false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-2">
            <Trophy className="w-5 h-5 text-greenElectric" aria-hidden />
            Record personali
          </span>
          {hasLocked && (
            <Badge variant="outline" size="xs" className="inline-flex items-center gap-1">
              <Crown className="w-3 h-3" aria-hidden /> Alcuni record sono PRO
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-textMuted text-sm">
            Nessun record disponibile. Registra qualche partita per iniziare a collezionare
            traguardi!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {records.map((r) => {
              const Icon = ICONS[r.icon];
              const locked = r.tier === 'PRO' && !isPro;
              return (
                <div
                  key={r.id}
                  className={`rounded-2xl p-4 border bg-bgSecondary/40 transition ${
                    locked
                      ? 'border-white/5 opacity-80'
                      : 'border-white/10 shadow-sm hover:border-greenPrimary/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                          locked
                            ? 'bg-white/5 border border-white/5 text-textMuted'
                            : 'bg-greenPrimary/10 border border-greenPrimary/20 text-greenElectric'
                        }`}
                      >
                        {locked ? (
                          <Lock className="w-4 h-4" aria-hidden />
                        ) : (
                          <Icon className="w-5 h-5" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-xs font-semibold text-textMuted truncate">{r.label}</p>
                        <p className="text-xl font-black text-textPrimary tabular-nums truncate">
                          {r.value}
                        </p>
                        {r.sublabel && (
                          <p className="text-[11px] text-textMuted truncate">{r.sublabel}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={TIER_LABEL[r.tier].variant} size="xs" className="shrink-0">
                      {r.tier === 'PRO' ? (
                        <span className="inline-flex items-center gap-1">
                          <Crown className="w-3 h-3" aria-hidden /> PRO
                        </span>
                      ) : (
                        TIER_LABEL[r.tier].label
                      )}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PersonalRecordsCard;
