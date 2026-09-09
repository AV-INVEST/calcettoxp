export type MatchXPInput = {
  result: 'WIN' | 'DRAW' | 'LOSS';
  goals: number;
  assists: number;
  role: string;
  cleanSheet?: boolean;
};

export const levelThresholds: number[] = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
  11500, 12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200,
  24750, 26350, 28000, 29700, 31450, 33250, 35100, 37000, 38950, 40950,
  43000, 45100, 47250, 49450, 51700, 54000, 56350, 58750, 61200, 63700, 66250
];

export function calculateXpEarned(input: MatchXPInput): number {
  let xp = 50;

  switch (input.result) {
    case 'WIN':
      xp += 30;
      break;
    case 'DRAW':
      xp += 15;
      break;
  }

  xp += input.goals * 5;
  xp += input.assists * 5;

  if (input.role === 'POR' && input.cleanSheet) {
    xp += 15;
  }

  if (xp > 150) xp = 150;

  return xp;
}

export function levelFromXp(xp: number): number {
  let level = 0;
  for (let i = 0; i < levelThresholds.length; i++) {
    if (xp >= levelThresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}
