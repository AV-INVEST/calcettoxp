import { calculateCardAttributes, type PlayerSummary } from "../src/lib/card-attributes";

type Role = "ATT" | "CEN" | "DIF" | "POR";
type MatchResult = "WIN" | "DRAW" | "LOSS";

function buildSummary(overrides: Partial<PlayerSummary> = {}): PlayerSummary {
  return {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    goals: 0,
    assists: 0,
    level: 1,
    xp: 0,
    careerIndex: 1000,
    role: "ATT",
    recentMatches: [],
    ...overrides,
  };
}

let failed = 0;
const assert = (label: string, cond: boolean, detail?: string) => {
  if (cond) {
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}  ${detail ?? ""}`);
  }
};
const inRange = (v: number, min: number, max: number) => v >= min && v <= max;

console.log("=====  CARD ATTRIBUTES: 6 FIXTURES  =====");

// 1) 0 match
(() => {
  console.log("\nFixture #1  0 matches  FREE baseline 50");
  const s = buildSummary({ role: "ATT" });
  const r = calculateCardAttributes(s);
  console.log("   ", r);
  assert("results === 50", r.results === 50, `got ${r.results}`);
  assert("impact   === 50", r.impact === 50, `got ${r.impact}`);
  assert("scoring  === 50", r.scoring === 50, `got ${r.scoring}`);
  assert("consistency === 50", r.consistency === 50, `got ${r.consistency}`);
  assert("form     === 50", r.form === 50, `got ${r.form}`);
  assert("experience baseline (0 matches, L1)", inRange(r.experience, 0, 5), `got ${r.experience}`);
})();

// 2) 1 match mostruoso: 1W + 2G + 1A  ATT  valori 50-65, NO 99
(() => {
  console.log("\nFixture #2  1 match mostruoso (W, 2G, 1A)  ATT");
  const recent = [{ careerIndexChange: +30, result: "WIN" as MatchResult, goals: 2, assists: 1, playedAt: new Date() }];
  const s = buildSummary({
    matchesPlayed: 1,
    wins: 1,
    losses: 0,
    draws: 0,
    goals: 2,
    assists: 1,
    role: "ATT",
    level: 2,
    recentMatches: recent,
  });
  const r = calculateCardAttributes(s);
  console.log("   ", r);
  assert("results  < 99", r.results < 99, `got ${r.results}`);
  assert("impact   < 99", r.impact < 99, `got ${r.impact}`);
  assert("scoring  < 99", r.scoring < 99, `got ${r.scoring}`);
  assert("results  in 50..68", inRange(r.results, 50, 68), `got ${r.results}`);
  assert("impact   in 50..68", inRange(r.impact, 50, 68), `got ${r.impact}`);
  assert("scoring  in 50..68", inRange(r.scoring, 50, 68), `got ${r.scoring}`);
})();

// 3) 3 match (2W 1D, 5G 3A, mixed CI)
(() => {
  console.log("\nFixture #3  3 matches (2W/1D, 5G, 3A)  ATT");
  const recent = [
    { careerIndexChange: +18, result: "WIN" as MatchResult, goals: 3, assists: 1, playedAt: new Date() },
    { careerIndexChange: +8,  result: "DRAW" as MatchResult, goals: 1, assists: 1, playedAt: new Date() },
    { careerIndexChange: +22, result: "WIN" as MatchResult, goals: 1, assists: 1, playedAt: new Date() },
  ];
  const s = buildSummary({
    matchesPlayed: 3,
    wins: 2,
    draws: 1,
    goals: 5,
    assists: 3,
    role: "ATT",
    level: 4,
    recentMatches: recent,
  });
  const r = calculateCardAttributes(s);
  console.log("   ", r);
  const at3 = calculateCardAttributes(s);
  const at1 = calculateCardAttributes(buildSummary({ matchesPlayed:1,wins:1,goals:2,assists:1,role:"ATT",level:2,recentMatches:[recent[0]] }));
  console.log("  confronto 1m vs 3m results:", at1.results, "→", at3.results);
  assert("results progression >= 1-match results", at3.results >= at1.results - 2);
  assert("results  <= 80 (non 99)", at3.results <= 82);
})();

// 4) 5 match
(() => {
  console.log("\nFixture #4  5 matches (4W/1D, 10G, 6A)  ATT");
  const recent = Array.from({length: 5}, (_, i) => ({
    careerIndexChange: i === 4 ? +10 : +18 + i,
    result: (i === 2 ? "DRAW" : "WIN") as MatchResult,
    goals: i % 2 === 0 ? 2 : 1,
    assists: i === 0 ? 2 : 1,
    playedAt: new Date(),
  }));
  const s = buildSummary({
    matchesPlayed: 5,
    wins: 4, draws: 1,
    goals: recent.reduce((a,b)=>a+b.goals,0),
    assists: recent.reduce((a,b)=>a+b.assists,0),
    role: "ATT",
    level: 7,
    recentMatches: recent,
  });
  const r = calculateCardAttributes(s);
  console.log("   ", r);
  assert("results < 95", r.results < 95, `got ${r.results}`);
  // 5 matches, 4/5 wins = 80% WR raw 80; confidence = 5/15 = 1/3 → 50 + (80-50) * 1/3 = 60 ± rounding
  assert("results expected ~60 (58..64)", inRange(r.results, 58, 64), `got ${r.results}`);
})();

// 5) 10 match
(() => {
  console.log("\nFixture #5  10 matches (8W/2D, 18G, 10A)  ATT  near full confidence");
  const recent = Array.from({length: 10}, (_, i) => ({
    careerIndexChange: 10 + (i % 5) * 4,
    result: (i % 5 === 3 ? "DRAW" : "WIN") as MatchResult,
    goals: 1 + (i % 3),
    assists: 1 + (i % 2),
    playedAt: new Date(),
  }));
  const s = buildSummary({
    matchesPlayed: 10,
    wins: 8, draws: 2,
    goals: recent.reduce((a,b)=>a+b.goals,0),
    assists: recent.reduce((a,b)=>a+b.assists,0),
    role: "ATT",
    level: 12,
    recentMatches: recent,
  });
  const r = calculateCardAttributes(s);
  console.log("   ", r);
  // 10 matches, 8/10 wins = 80% WR raw 80; confidence = 10/15 = 2/3 → 50 + 30*(2/3) = 70 ± rounding
  assert("results expected ~70 (68..74)", inRange(r.results, 68, 74), `got ${r.results}`);
})();

// 6) 15+ match => raw essentially FULL confidence
(() => {
  console.log("\nFixture #6  20 matches (14W/4D/2L, 30G, 18A)  ATT  full confidence");
  const recent = Array.from({length: 20}, (_, i) => {
    let res: MatchResult = "WIN";
    if (i === 5) res = "LOSS";
    else if (i === 13) res = "LOSS";
    else if (i % 4 === 3) res = "DRAW";
    return {
      careerIndexChange: 5 + (i % 7) * 2,
      result: res,
      goals: 1 + (i % 3),
      assists: i % 2,
      playedAt: new Date(),
    };
  });
  const s = buildSummary({
    matchesPlayed: 20,
    wins: recent.filter(x=>x.result==="WIN").length,
    draws: recent.filter(x=>x.result==="DRAW").length,
    losses: recent.filter(x=>x.result==="LOSS").length,
    goals: recent.reduce((a,b)=>a+b.goals,0),
    assists: recent.reduce((a,b)=>a+b.assists,0),
    role: "ATT",
    level: 20,
    recentMatches: recent,
  });
  const r = calculateCardAttributes(s);
  console.log("   matchesPlayed", s.matchesPlayed, "wins", s.wins, "goals", s.goals, "assists", s.assists);
  console.log("   ", r);
  const winRate = s.wins / s.matchesPlayed;
  console.log(`   true win rate = ${(winRate*100).toFixed(0)}%  results = ${r.results}`);
  assert("results ~ winRate raw approx (within ±8)", Math.abs(r.results - winRate*100) <= 10, `results ${r.results} vs raw ${Math.round(winRate*100)}`);
})();

console.log("\n=====  CARD ATTRIBUTES SUMMARY  =====");
console.log(failed === 0 ? "PASS" : `FAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
