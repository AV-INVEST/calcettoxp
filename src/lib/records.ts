import type { Match, PlayerProfile, PlayerSeason } from '@prisma/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { formatSeasonName } from '@/lib/seasons';

export type RecordTier = 'FREE' | 'PRO';

export interface PersonalRecord {
  id: string;
  label: string;
  value: string | number;
  sublabel?: string | null;
  tier: RecordTier;
  icon: 'CI' | 'OVR' | 'W_STREAK' | 'U_STREAK' | 'GOALS_MATCH' | 'ASSISTS_MATCH' | 'BEST_SEASON' | 'MOST_GOALS_SEASON';
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

  const list: PersonalRecord[] = [
    {
      id: 'highest-ci',
      label: 'Career Index più alto',
      value: Math.max(profile.careerIndex ?? 0, highestSeasonPeak),
      icon: 'CI',
      tier: 'FREE',
    },
    {
      id: 'highest-ovr',
      label: 'OVR più alto',
      value: profile.overall ?? 40,
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
  ];

  return list.filter((r) => isPro || r.tier === 'FREE');
}
