import { Match, PlayerProfile, Season } from '@prisma/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

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
  profile: Pick<PlayerProfile, 'careerIndex' | 'ovr'>;
  matches: Pick<
    Match,
    | 'id'
    | 'goals'
    | 'assists'
    | 'result'
    | 'matchDate'
    | 'opponentName'
    | 'seasonKey'
  >[];
  seasons: Pick<Season, 'id' | 'key' | 'label' | 'startAt' | 'endAt' | 'matches' | 'wins' | 'goals' | 'careerIndexEnd' | 'careerIndexStart'>[];
  isPro?: boolean;
}

function calcStreaks<T extends { result: 'WIN' | 'DRAW' | 'LOSS'; matchDate: Date | string }>(
  arr: T[],
): { longestWin: number; longestUnbeaten: number } {
  const sorted = [...arr].sort(
    (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
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
  const { longestWin, longestUnbeaten } = calcStreaks(
    matches as { result: any; matchDate: Date | string }[],
  );

  let mostGoalsInMatch: number = 0;
  let mostGoalsMatchInfo: { matchDate?: Date | string; opponent?: string | null } | null = null;
  let mostAssistsInMatch: number = 0;
  let mostAssistsMatchInfo: { matchDate?: Date | string; opponent?: string | null } | null = null;

  for (const m of matches) {
    if ((m.goals ?? 0) > mostGoalsInMatch) {
      mostGoalsInMatch = m.goals ?? 0;
      mostGoalsMatchInfo = { matchDate: m.matchDate, opponent: m.opponentName };
    }
    if ((m.assists ?? 0) > mostAssistsInMatch) {
      mostAssistsInMatch = m.assists ?? 0;
      mostAssistsMatchInfo = { matchDate: m.matchDate, opponent: m.opponentName };
    }
  }

  let bestSeason: (typeof seasons)[number] | null = null;
  let bestSeasonGain = -Infinity;
  let mostGoalsSeason: (typeof seasons)[number] | null = null;
  for (const s of seasons) {
    const start = s.careerIndexStart ?? 1000;
    const end = s.careerIndexEnd ?? start;
    const gain = end - start;
    if (gain > bestSeasonGain) {
      bestSeasonGain = gain;
      bestSeason = s;
    }
    if (!mostGoalsSeason || (s.goals ?? 0) > (mostGoalsSeason.goals ?? 0)) {
      mostGoalsSeason = s;
    }
  }

  function fmtMatchInfo(info: { matchDate?: Date | string; opponent?: string | null } | null): string | null {
    if (!info) return null;
    const parts: string[] = [];
    if (info.matchDate) {
      try {
        parts.push(format(new Date(info.matchDate), 'dd/MM/yyyy', { locale: it }));
      } catch {
        /* ignore */
      }
    }
    if (info.opponent) parts.push(`vs ${info.opponent}`);
    return parts.length ? parts.join(' · ') : null;
  }

  const list: PersonalRecord[] = [
    {
      id: 'highest-ci',
      label: 'Career Index più alto',
      value: Math.max(profile.careerIndex ?? 0, ...seasons.map((s) => s.careerIndexEnd ?? 0)),
      icon: 'CI',
      tier: 'FREE',
    },
    {
      id: 'highest-ovr',
      label: 'OVR più alto',
      value: profile.ovr ?? 40,
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
      value: bestSeason ? bestSeason.label : 'N/D',
      sublabel: bestSeason
        ? bestSeasonGain > 0
          ? `+${bestSeasonGain.toFixed(0)} punti Career Index · ${bestSeason.matches ?? 0} partite`
          : `${bestSeason.label} · ${bestSeason.matches ?? 0} partite`
        : 'Nessuna stagione completata',
      icon: 'BEST_SEASON',
      tier: 'PRO',
    },
    {
      id: 'most-goals-season',
      label: 'Stagione con più goal',
      value: mostGoalsSeason ? mostGoalsSeason.label : 'N/D',
      sublabel: mostGoalsSeason
        ? `${mostGoalsSeason.goals ?? 0} goal · ${mostGoalsSeason.label}`
        : 'Nessun goal ancora',
      icon: 'MOST_GOALS_SEASON',
      tier: 'PRO',
    },
  ];

  return list.filter((r) => isPro || r.tier === 'FREE');
}
