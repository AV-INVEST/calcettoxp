export type MatchXPInput = {
  result: 'WIN' | 'DRAW' | 'LOSS';
  goals: number;
  assists: number;
  role: string;
  cleanSheet?: boolean;
};

export const MAX_LEVEL = 50;

export const levelThresholds: number[] = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
  11500, 12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200,
  24750, 26350, 28000, 29700, 31450, 33250, 35100, 37000, 38950, 40950,
  43000, 45100, 47250, 49450, 51700, 54000, 56350, 58750, 61200, 63700,
];

export type PlayerStatus = 'NOVIZIO' | 'EMERGENTE' | 'AFFERMATO' | 'VETERANO' | 'LEGGENDA';

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
  return Math.min(level, MAX_LEVEL);
}

export type LevelProgress = {
  currentLevel: number;
  currentThreshold: number;
  nextThreshold: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  progressPct: number;
};

export function getLevelProgress(xp: number): LevelProgress {
  const currentLevel = levelFromXp(xp);
  const clampedLevel = Math.min(currentLevel, MAX_LEVEL);
  const currentThreshold = levelThresholds[clampedLevel - 1] ?? 0;
  const nextThreshold =
    clampedLevel >= MAX_LEVEL
      ? levelThresholds[MAX_LEVEL - 1]
      : levelThresholds[clampedLevel] ?? levelThresholds[MAX_LEVEL - 1];
  const xpInCurrentLevel = Math.max(0, xp - currentThreshold);
  const levelRange = nextThreshold - currentThreshold;
  const progressPct =
    clampedLevel >= MAX_LEVEL
      ? 100
      : levelRange > 0
      ? Math.min(100, Math.max(0, (xpInCurrentLevel / levelRange) * 100))
      : 100;
  const xpToNextLevel =
    clampedLevel >= MAX_LEVEL ? 0 : Math.max(0, nextThreshold - xp);
  return {
    currentLevel: clampedLevel,
    currentThreshold,
    nextThreshold,
    xpInCurrentLevel,
    xpToNextLevel,
    progressPct,
  };
}

export function getStatusFromLevel(level: number): PlayerStatus {
  const lv = Math.max(1, Math.min(MAX_LEVEL, level));
  if (lv >= 50) return 'LEGGENDA';
  if (lv >= 30) return 'VETERANO';
  if (lv >= 15) return 'AFFERMATO';
  if (lv >= 5) return 'EMERGENTE';
  return 'NOVIZIO';
}
