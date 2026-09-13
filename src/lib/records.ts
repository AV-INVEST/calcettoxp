import type { Match, PlayerProfile, PlayerSeason } from '@prisma/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { formatSeasonName } from '@/lib/seasons';
import { careerIndexToOverall } from '@/lib/ovr';

export type RecordTier = 'FREE' | 'PRO';

export interface PersonalRecord {
  id: string;
  label: string;
  value: string | number;
  sublabel?: string | null;
  tier: RecordTier;
  icon:
    | 'CI'
    | 'OVR'
    | 'W_STREAK'
    | 'U_STREAK'
    | 'GOALS_MATCH'
    | 'ASSISTS_MATCH'
    | 'BEST_SEASON'
    | 'MOST_GOALS_SEASON'
    | 'WINRATE_7D'
    | 'WINRATE_30D'
    | 'WINRATE_90D'
    | 'GOALS_7D'
    | 'GOALS_30D'
    | 'GOALS_90D'
    | 'BEST_SEASON_WINS'
    | 'BEST_SEASON_MATCHES';
}

export interface RecordsInput {
  profile: Pick<PlayerProfile, 'careerIndex' | 'overall'>;
  matches: Pick<
    Match,
    | 'id'
    | 'goals'
    | 'assists'
    | 'result'
    | 'playedAt'
    | 'seasonKey'
  >[];
  seasons: Pick<
    PlayerSeason,
    | 'seasonKey'
    | 'name'
    | 'startDate'
    | 'endDate'
    | 'matches'
    | 'wins'
    | 'goals'
    | 'startCareerIndex'
    | 'endCareerIndex'
    | 'peakCareerIndex'
    | 'startOverall'
    | 'endOverall'
  >[];
  isPro?: boolean;
}

type MatchLike = { result: 'WIN' | 'DRAW' | 'LOSS'; playedAt: Date | string };

function calcStreaks<T extends MatchLike>(
  arr: T[],
): { longestWin: number; longestUnbeaten: number } {
  const sorted = [...arr].sort(
    (a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime(),
  );
  let longestWin = 0;
  let longestUnbeaten = 0;
  let curWin = 0;
  let curUnbeaten = 0;
  for (const m of sorted) {
    if (m.result === 'WIN') {
      curWin += 1;
      curUnbeaten += 1;
    } else if (m.result === 'DRAW') {
      curWin = 0;
      curUnbeaten += 1;
    } else {
      curWin = 0;
      curUnbeaten = 0;
    }
    if (curWin > longestWin) longestWin = curWin;
    if (curUnbeaten > longestUnbeaten) longestUnbeaten = curUnbeaten;
  }
  return { longestWin, longestUnbeaten };
}

export function computePersonalRecords(input: RecordsInput): PersonalRecord[] {
  const { profile, matches, seasons, isPro = false } = input;
  const { longestWin, longestUnbeaten } = calcStreaks(matches);

  let mostGoalsInMatch: number = 0;
  let mostGoalsMatchInfo: { playedAt?: Date | string } | null = null;
  let mostAssistsInMatch: number = 0;
  let mostAssistsMatchInfo: { playedAt?: Date | string } | null = null;

  for (const m of matches) {
    if ((m.goals ?? 0) > mostGoalsInMatch) {
      mostGoalsInMatch = m.goals ?? 0;
      mostGoalsMatchInfo = { playedAt: m.playedAt };
    }
    if ((m.assists ?? 0) > mostAssistsInMatch) {
      mostAssistsInMatch = m.assists ?? 0;
      mostAssistsMatchInfo = { playedAt: m.playedAt };
    }
  }

  let bestSeason: (typeof seasons)[number] | null = null;
  let bestSeasonGain = -Infinity;
  let mostGoalsSeason: (typeof seasons)[number] | null = null;
  let highestSeasonPeak = -Infinity;
  let bestSeasonWins: (typeof seasons)[number] | null = null;
  let bestSeasonMatches: (typeof seasons)[number] | null = null;
  for (const s of seasons) {
    const start = s.startCareerIndex ?? 1000;
    const end = s.endCareerIndex ?? start;
    const gain = end - start;
    if (gain > bestSeasonGain) {
      bestSeasonGain = gain;
      bestSeason = s;
    }
    if ((s.peakCareerIndex ?? 0) > highestSeasonPeak) {
      highestSeasonPeak = s.peakCareerIndex ?? 0;
    }
    if (!mostGoalsSeason || (s.goals ?? 0) > (mostGoalsSeason.goals ?? 0)) {
      mostGoalsSeason = s;
    }
    if (!bestSeasonWins || (s.wins ?? 0) > (bestSeasonWins.wins ?? 0)) {
      bestSeasonWins = s;
    }
    if (!bestSeasonMatches || (s.matches ?? 0) > (bestSeasonMatches.matches ?? 0)) {
      bestSeasonMatches = s;
    }
  }

  function statsForWindow(daysMs: number) {
    const now = Date.now();
    const cutoff = now - daysMs;
    let total = 0;
    let wins = 0;
    let goals = 0;
    for (const m of matches) {
      const t = new Date(m.playedAt).getTime();
      if (t < cutoff) continue;
      total += 1;
      if (m.result === 'WIN') wins += 1;
      goals += m.goals ?? 0;
    }
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    return { total, wins, goals, winRate };
  }
  const w7 = statsForWindow(7 * 24 * 60 * 60 * 1000);
  const w30 = statsForWindow(30 * 24 * 60 * 60 * 1000);
  const w90 = statsForWindow(90 * 24 * 60 * 60 * 1000);

  function fmtWinRate(winRate: number, total: number, days: number): [string, string | null] {
    if (total === 0) return ['N/D', `Nessuna partita negli ultimi ${days} giorni`];
    return [
      `${winRate.toFixed(0)}%`,
      `${total} partite · vinte ${Math.round((winRate / 100) * total)}`,
    ];
  }
  function fmtGoalsWindow(goals: number, matches: number, days: number): [number, string | null] {
    if (matches === 0) return [0, `Nessuna partita negli ultimi ${days} giorni`];
    return [
      goals,
      `${matches} partite · ${(goals / matches).toFixed(1)} goal/partita`,
    ];
  }

  function fmtMatchInfo(info: { playedAt?: Date | string } | null): string | null {
    if (!info) return null;
    if (info.playedAt) {
      try {
        return format(new Date(info.playedAt), 'dd/MM/yyyy', { locale: it });
      } catch {
        return null;
      }
    }
    return null;
  }

  const highestCareerIndex = Math.max(profile.careerIndex ?? 0, highestSeasonPeak);
  const highestOverall = careerIndexToOverall(highestCareerIndex);

  const list: PersonalRecord[] = [
    {
      id: 'highest-ci',
      label: 'Career Index più alto',
      value: highestCareerIndex,
      icon: 'CI',
      tier: 'FREE',
    },
    {
      id: 'highest-ovr',
      label: 'OVR più alto',
      value: highestOverall,
      icon: 'OVR',
      tier: 'FREE',
    },
    {
      id: 'longest-win-streak',
      label: 'Striscia vittorie più lunga',
      value: longestWin,
      sublabel: longestWin > 0 ? `${longestWin} partite consecutive` : 'Nessuna vittoria ancora',
      icon: 'W_STREAK',
      tier: 'FREE',
    },
    {
      id: 'longest-unbeaten',
      label: 'Striscia imbattuta più lunga',
      value: longestUnbeaten,
      sublabel:
        longestUnbeaten > 0
          ? `${longestUnbeaten} partite senza sconfitta`
          : 'Inizia a costruirla',
      icon: 'U_STREAK',
      tier: 'FREE',
    },
    {
      id: 'most-goals-match',
      label: 'Più goal in una partita',
      value: mostGoalsInMatch,
      sublabel: fmtMatchInfo(mostGoalsMatchInfo) || 'Nessun goal registrato',
      icon: 'GOALS_MATCH',
      tier: 'FREE',
    },
    {
      id: 'most-assists-match',
      label: 'Più assist in una partita',
      value: mostAssistsInMatch,
      sublabel: fmtMatchInfo(mostAssistsMatchInfo) || 'Nessun assist registrato',
      icon: 'ASSISTS_MATCH',
      tier: 'FREE',
    },
    {
      id: 'best-season',
      label: 'Stagione migliore (Career Index)',
      value: bestSeason ? formatSeasonName(bestSeason.name) : 'N/D',
      sublabel: bestSeason
        ? bestSeasonGain > 0
          ? `+${bestSeasonGain.toFixed(0)} punti Career Index · ${bestSeason.matches ?? 0} partite`
          : `${formatSeasonName(bestSeason.name)} · ${bestSeason.matches ?? 0} partite`
        : 'Nessuna stagione completata',
      icon: 'BEST_SEASON',
      tier: 'PRO',
    },
    {
      id: 'most-goals-season',
      label: 'Stagione con più goal',
      value: mostGoalsSeason ? formatSeasonName(mostGoalsSeason.name) : 'N/D',
      sublabel: mostGoalsSeason
        ? `${mostGoalsSeason.goals ?? 0} goal · ${formatSeasonName(mostGoalsSeason.name)}`
        : 'Nessun goal ancora',
      icon: 'MOST_GOALS_SEASON',
      tier: 'PRO',
    },
    {
      id: 'best-season-wins',
      label: 'Stagione con più vittorie',
      value: bestSeasonWins ? formatSeasonName(bestSeasonWins.name) : 'N/D',
      sublabel: bestSeasonWins
        ? `${bestSeasonWins.wins ?? 0} vittorie · ${bestSeasonWins.matches ?? 0} partite`
        : 'Nessuna vittoria in stagione',
      icon: 'BEST_SEASON_WINS',
      tier: 'PRO',
    },
    {
      id: 'best-season-matches',
      label: 'Stagione più giocata',
      value: bestSeasonMatches ? formatSeasonName(bestSeasonMatches.name) : 'N/D',
      sublabel: bestSeasonMatches
        ? `${bestSeasonMatches.matches ?? 0} partite · ${formatSeasonName(bestSeasonMatches.name)}`
        : 'Nessuna partita in stagione',
      icon: 'BEST_SEASON_MATCHES',
      tier: 'PRO',
    },
    {
      id: 'winrate-7d',
      label: 'Win rate ultimi 7 giorni',
      value: fmtWinRate(w7.winRate, w7.total, 7)[0],
      sublabel: fmtWinRate(w7.winRate, w7.total, 7)[1],
      icon: 'WINRATE_7D',
      tier: 'PRO',
    },
    {
      id: 'winrate-30d',
      label: 'Win rate ultimi 30 giorni',
      value: fmtWinRate(w30.winRate, w30.total, 30)[0],
      sublabel: fmtWinRate(w30.winRate, w30.total, 30)[1],
      icon: 'WINRATE_30D',
      tier: 'PRO',
    },
    {
      id: 'winrate-90d',
      label: 'Win rate ultimi 90 giorni',
      value: fmtWinRate(w90.winRate, w90.total, 90)[0],
      sublabel: fmtWinRate(w90.winRate, w90.total, 90)[1],
      icon: 'WINRATE_90D',
      tier: 'PRO',
    },
    {
      id: 'goals-7d',
      label: 'Goal ultimi 7 giorni',
      value: fmtGoalsWindow(w7.goals, w7.total, 7)[0],
      sublabel: fmtGoalsWindow(w7.goals, w7.total, 7)[1],
      icon: 'GOALS_7D',
      tier: 'PRO',
    },
    {
      id: 'goals-30d',
      label: 'Goal ultimi 30 giorni',
      value: fmtGoalsWindow(w30.goals, w30.total, 30)[0],
      sublabel: fmtGoalsWindow(w30.goals, w30.total, 30)[1],
      icon: 'GOALS_30D',
      tier: 'PRO',
    },
    {
      id: 'goals-90d',
      label: 'Goal ultimi 90 giorni',
      value: fmtGoalsWindow(w90.goals, w90.total, 90)[0],
      sublabel: fmtGoalsWindow(w90.goals, w90.total, 90)[1],
      icon: 'GOALS_90D',
      tier: 'PRO',
    },
  ];

  return list.filter((r) => isPro || r.tier === 'FREE');
}
