type MatchLite = {
  result: "WIN" | "DRAW" | "LOSS";
  playedAt: Date | string;
};

export type ActiveStreaks = {
  winStreak: number;
  unbeatenStreak: number;
  lossStreak: number;
};

export function computeActiveStreaks(
  matchesOrderedNewestFirst: MatchLite[]
): ActiveStreaks {
  let winStreak = 0;
  for (const m of matchesOrderedNewestFirst) {
    if (m.result === "WIN") {
      winStreak++;
      continue;
    }
    break;
  }

  let unbeatenStreak = 0;
  for (const m of matchesOrderedNewestFirst) {
    if (m.result === "WIN" || m.result === "DRAW") {
      unbeatenStreak++;
      continue;
    }
    break;
  }

  let lossStreak = 0;
  for (const m of matchesOrderedNewestFirst) {
    if (m.result === "LOSS") {
      lossStreak++;
      continue;
    }
    break;
  }

  return { winStreak, unbeatenStreak, lossStreak };
}

export function getStartOfIsoWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function getEndOfIsoWeek(date: Date): Date {
  const start = getStartOfIsoWeek(date);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

export function countMatchesThisWeek<T extends { playedAt: Date | string }>(
  matches: T[],
  now: Date = new Date()
): number {
  const start = getStartOfIsoWeek(now).getTime();
  const end = getEndOfIsoWeek(now).getTime();
  let c = 0;
  for (const m of matches) {
    const t = new Date(m.playedAt).getTime();
    if (t >= start && t <= end) c++;
  }
  return c;
}

type CiPointLite = {
  valueAfter?: number | null;
  valueBefore?: number | null;
  matchId?: string | null;
};

export function getBestCareerIndex(
  currentCi: number,
  history: CiPointLite[]
): number {
  let best = currentCi;
  for (const p of history) {
    if (typeof p.valueAfter === "number" && p.valueAfter > best) {
      best = p.valueAfter;
    }
    if (typeof p.valueBefore === "number" && p.valueBefore > best) {
      best = p.valueBefore;
    }
  }
  return best;
}
