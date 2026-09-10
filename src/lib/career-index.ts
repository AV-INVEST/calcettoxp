export function formatCI(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "0";
  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(Math.round(num));
  const digits = abs.toString();
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    const j = digits.length - 1 - i;
    if (i > 0 && i % 3 === 0) out = "." + out;
    out = digits[j] + out;
  }
  return sign + out;
}

export type MatchCareerIndexInput = {
  result: 'WIN' | 'DRAW' | 'LOSS';
  role: 'POR' | 'DIF' | 'CEN' | 'ATT';
  goals: number;
  assists: number;
  cleanSheet?: boolean;
  goalsAgainst?: number;
  penaltiesSaved?: number;
  keySaves?: number;
};

export function calculateCareerIndexChange(input: MatchCareerIndexInput): number {
  let change = 0;

  switch (input.result) {
    case 'WIN':
      change += 15;
      break;
    case 'DRAW':
      change += 3;
      break;
    case 'LOSS':
      change -= 10;
      break;
  }

  switch (input.role) {
    case 'ATT':
      change += input.goals * 3;
      change += input.assists * 2;
      break;
    case 'CEN':
      change += input.goals * 2;
      change += input.assists * 3;
      break;
    case 'DIF':
      change += input.goals * 2;
      change += input.assists * 2;
      break;
    case 'POR': {
      if (input.result === 'WIN') change += 5;
      if (input.result === 'DRAW') change += 2;
      if (input.cleanSheet) change += 8;
      const penaltiesSaved = Math.max(0, input.penaltiesSaved ?? 0);
      change += penaltiesSaved * 3;
      const keySaves = Math.max(0, input.keySaves ?? 0);
      change += Math.min(5, keySaves) * 1;
      const ga = Math.max(0, input.goalsAgainst ?? 0);
      if (ga === 0 || ga === 1 || ga === 2) {
        // no malus
      } else if (ga === 3) {
        change -= 2;
      } else if (ga === 4) {
        change -= 4;
      } else {
        change -= 6;
      }
      break;
    }
  }

  if (change < -20) change = -20;
  if (change > 40) change = 40;

  return change;
}
