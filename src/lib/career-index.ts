export type MatchCareerIndexInput = {
  result: 'WIN' | 'DRAW' | 'LOSS';
  role: 'POR' | 'DIF' | 'CEN' | 'ATT';
  goals: number;
  assists: number;
  cleanSheet?: boolean;
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
    case 'POR':
      if (input.result === 'WIN') change += 5;
      if (input.result === 'DRAW') change += 2;
      if (input.cleanSheet) change += 8;
      break;
  }

  if (change < -20) change = -20;
  if (change > 40) change = 40;

  return change;
}
