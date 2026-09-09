export type PlayerSummary = {
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  goals: number;
  assists: number;
  level: number;
  xp: number;
  role: string;
  recentMatches: Array<{
    careerIndexChange: number;
    result: string;
    goals: number;
    assists: number;
    playedAt: Date | string;
  }>;
};

function clampInt(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

function getRoleWeights(role: string): { goalWeight: number; assistWeight: number; scoringFactor: number } {
  const r = role.toUpperCase();
  switch (r) {
    case 'ATT':
      return { goalWeight: 3, assistWeight: 2, scoringFactor: 1.0 };
    case 'CEN':
      return { goalWeight: 2, assistWeight: 3, scoringFactor: 1.2 };
    case 'DIF':
      return { goalWeight: 2, assistWeight: 2, scoringFactor: 1.8 };
    case 'POR':
      return { goalWeight: 1, assistWeight: 1, scoringFactor: 2.5 };
    default:
      return { goalWeight: 2, assistWeight: 2, scoringFactor: 1.3 };
  }
}

function calculateForm(recentMatches: PlayerSummary['recentMatches']): number {
  if (!recentMatches || recentMatches.length === 0) return 50;
  const last5 = recentMatches.slice(0, 5);
  const avg = last5.reduce((sum, m) => sum + m.careerIndexChange, 0) / last5.length;
  const mapped = ((avg + 20) / 60) * 99;
  return clampInt(mapped, 0, 99);
}

function calculateResults(matchesPlayed: number, wins: number): number {
  if (matchesPlayed === 0) return 50;
  const winRate = (wins / matchesPlayed) * 100;
  return clampInt(winRate, 0, 99);
}

function calculateImpact(matchesPlayed: number, goals: number, assists: number, role: string): number {
  if (matchesPlayed === 0) return 50;
  const weights = getRoleWeights(role);
  const impactScore = (goals * weights.goalWeight + assists * weights.assistWeight) / matchesPlayed;
  const maxReference = 3.0;
  const mapped = (impactScore / maxReference) * 99;
  return clampInt(mapped, 0, 99);
}

function calculateScoring(matchesPlayed: number, goals: number, role: string): number {
  if (matchesPlayed === 0) return 50;
  const weights = getRoleWeights(role);
  const goalsPerMatch = (goals / matchesPlayed) * weights.scoringFactor;
  const mapped = (goalsPerMatch / 2) * 95;
  return clampInt(mapped, 0, 99);
}

function calculateExperience(matchesPlayed: number, level: number): number {
  const matchesPart = Math.min(matchesPlayed / 100, 1) * 70;
  const levelPart = Math.min(level / 50, 1) * 30;
  return clampInt(matchesPart + levelPart, 0, 99);
}

function calculateConsistency(recentMatches: PlayerSummary['recentMatches']): number {
  if (!recentMatches || recentMatches.length < 2) return 50;
  const last10 = recentMatches.slice(0, 10);
  const n = last10.length;
  const avg = last10.reduce((sum, m) => sum + m.careerIndexChange, 0) / n;
  const variance = last10.reduce((sum, m) => sum + Math.pow(m.careerIndexChange - avg, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const maxPossibleStdDev = 30;
  const consistency = 100 - (stdDev / maxPossibleStdDev) * 100;
  return clampInt(consistency, 0, 99);
}

export function calculateCardAttributes(summary: PlayerSummary): {
  form: number;
  impact: number;
  results: number;
  scoring: number;
  experience: number;
  consistency: number;
} {
  return {
    form: calculateForm(summary.recentMatches),
    impact: calculateImpact(summary.matchesPlayed, summary.goals, summary.assists, summary.role),
    results: calculateResults(summary.matchesPlayed, summary.wins),
    scoring: calculateScoring(summary.matchesPlayed, summary.goals, summary.role),
    experience: calculateExperience(summary.matchesPlayed, summary.level),
    consistency: calculateConsistency(summary.recentMatches),
  };
}
