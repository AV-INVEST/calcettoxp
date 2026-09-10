export type MilestoneCategory =
  | 'matches'
  | 'wins'
  | 'goals'
  | 'assists'
  | 'level'
  | 'careerIndex';

export interface MilestoneGoal {
  id: string;
  label: string;
  target: number;
  current?: number;
  category: MilestoneCategory;
  tier: 'FREE' | 'PRO';
}

export interface ChosenNextGoal {
  goal: MilestoneGoal;
  progressPct: number;
  remaining: number;
}

export interface NextGoalInput {
  matchesPlayed: number;
  wins: number;
  goals: number;
  assists: number;
  level: number;
  careerIndex: number;
  isPro?: boolean;
}

const ALL_MILESTONES: MilestoneGoal[] = [
  { id: 'm10', label: '10 partite', target: 10, category: 'matches', tier: 'FREE' },
  { id: 'm25', label: '25 partite', target: 25, category: 'matches', tier: 'FREE' },
  { id: 'm50', label: '50 partite', target: 50, category: 'matches', tier: 'FREE' },
  { id: 'm100', label: '100 partite', target: 100, category: 'matches', tier: 'FREE' },
  { id: 'm250', label: '250 partite', target: 250, category: 'matches', tier: 'PRO' },
  { id: 'm500', label: '500 partite', target: 500, category: 'matches', tier: 'PRO' },

  { id: 'w5', label: '5 vittorie', target: 5, category: 'wins', tier: 'FREE' },
  { id: 'w10', label: '10 vittorie', target: 10, category: 'wins', tier: 'FREE' },
  { id: 'w25', label: '25 vittorie', target: 25, category: 'wins', tier: 'FREE' },
  { id: 'w50', label: '50 vittorie', target: 50, category: 'wins', tier: 'FREE' },
  { id: 'w100', label: '100 vittorie', target: 100, category: 'wins', tier: 'PRO' },

  { id: 'g10', label: '10 goal', target: 10, category: 'goals', tier: 'FREE' },
  { id: 'g25', label: '25 goal', target: 25, category: 'goals', tier: 'FREE' },
  { id: 'g50', label: '50 goal', target: 50, category: 'goals', tier: 'FREE' },
  { id: 'g100', label: '100 goal', target: 100, category: 'goals', tier: 'FREE' },
  { id: 'g250', label: '250 goal', target: 250, category: 'goals', tier: 'PRO' },

  { id: 'a5', label: '5 assist', target: 5, category: 'assists', tier: 'FREE' },
  { id: 'a15', label: '15 assist', target: 15, category: 'assists', tier: 'FREE' },
  { id: 'a30', label: '30 assist', target: 30, category: 'assists', tier: 'FREE' },

  { id: 'lv5', label: 'Livello 5', target: 5, category: 'level', tier: 'FREE' },
  { id: 'lv10', label: 'Livello 10', target: 10, category: 'level', tier: 'FREE' },
  { id: 'lv25', label: 'Livello 25', target: 25, category: 'level', tier: 'FREE' },
  { id: 'lv50', label: 'Livello 50', target: 50, category: 'level', tier: 'FREE' },

  { id: 'ci900', label: 'Career Index 900', target: 900, category: 'careerIndex', tier: 'FREE' },
  { id: 'ci1000', label: 'Career Index 1000', target: 1000, category: 'careerIndex', tier: 'FREE' },
  { id: 'ci1100', label: 'Career Index 1100', target: 1100, category: 'careerIndex', tier: 'FREE' },
  { id: 'ci1200', label: 'Career Index 1200', target: 1200, category: 'careerIndex', tier: 'FREE' },
  { id: 'ci1500', label: 'Career Index 1500', target: 1500, category: 'careerIndex', tier: 'FREE' },
  { id: 'ci1800', label: 'Career Index 1800', target: 1800, category: 'careerIndex', tier: 'PRO' },
];

export function pickNextGoal(input: NextGoalInput): ChosenNextGoal | null {
  const { matchesPlayed, wins, goals, assists, level, careerIndex, isPro } = input;
  const currentMap: Record<MilestoneCategory, number> = {
    matches: Math.max(0, matchesPlayed || 0),
    wins: Math.max(0, wins || 0),
    goals: Math.max(0, goals || 0),
    assists: Math.max(0, assists || 0),
    level: Math.max(1, level || 1),
    careerIndex: Math.max(0, careerIndex || 0),
  };
  const candidates = ALL_MILESTONES.filter((m) => {
    if (m.tier === 'PRO' && !isPro) return false;
    const curr = currentMap[m.category];
    return curr < m.target;
  });
  if (candidates.length === 0) return null;
  let best: (MilestoneGoal & { ratio: number; pct: number; remaining: number }) | null = null;
  for (const m of candidates) {
    const curr = currentMap[m.category];
    const ratio = m.target > 0 ? curr / m.target : 0;
    const clamped = Math.min(0.99, Math.max(0, ratio));
    const remaining = Math.max(0, m.target - curr);
    const score = clamped + (remaining === 0 ? 1 : 0);
    if (!best || score > best.ratio) {
      best = { ...m, ratio: score, pct: clamped * 100, remaining };
    }
  }
  if (!best) return null;
  return {
    goal: {
      id: best.id,
      label: best.label,
      target: best.target,
      current: currentMap[best.category],
      category: best.category,
      tier: best.tier,
    },
    progressPct: best.pct,
    remaining: best.remaining,
  };
}
