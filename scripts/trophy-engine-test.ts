import { calcStreaks } from "@/lib/achievement-engine";
import { progressForEntry } from "@/lib/achievement-engine";
import type { AggregatorContext } from "@/lib/achievement-engine";
import type { AchievementCatalogEntry } from "@/lib/achievement-catalog";
import { ACHIEVEMENT_CATALOG, countCatalogByTier } from "@/lib/achievement-catalog";

const passed: string[] = [];
const failed: Array<{ name: string; reason: string }> = [];

function assert(name: string, cond: boolean, reason?: string) {
  if (cond) {
    passed.push(name);
    console.log(`  ✅ ${name}`);
  } else {
    failed.push({ name, reason: reason ?? "assertion failed" });
    console.log(`  ❌ ${name}${reason ? `: ${reason}` : ""}`);
  }
}

console.log("=== Catalog Check ===");
const counts = countCatalogByTier();
console.log("FREE:", counts.free, "PRO:", counts.pro, "TOTAL:", counts.total);
assert("FREE count === 20", counts.free === 20, `got ${counts.free}`);
assert("PRO count === 30", counts.pro === 30, `got ${counts.pro}`);
assert("TOTAL === 50", counts.total === 50, `got ${counts.total}`);

console.log("\n=== calcStreaks (array ordinato DAL PIÙ RECENTE AL PIÙ VECCHIO) ===");

// [W W W D L] recenti→vecchi: win=3, unbeaten=4
const r1 = calcStreaks(["WIN","WIN","WIN","DRAW","LOSS"].map(r=>({result:r})));
console.log("  r1 (W W W D L):", r1);
assert("[W W W D L] winStreak=3 (primo non-WIN=D dopo 3W)", r1.winStreak===3, `got ${r1.winStreak}`);
assert("[W W W D L] unbeatenStreak=4 (prima LOSS dopo 3W+1D)", r1.unbeatenStreak===4, `got ${r1.unbeatenStreak}`);

// [W W D D L] recenti→vecchi: win=2, unbeaten=4
const r2 = calcStreaks(["WIN","WIN","DRAW","DRAW","LOSS"].map(r=>({result:r})));
console.log("  r2 (W W D D L):", r2);
assert("[W W D D L] winStreak=2", r2.winStreak===2, `got ${r2.winStreak}`);
assert("[W W D D L] unbeatenStreak=4", r2.unbeatenStreak===4, `got ${r2.unbeatenStreak}`);

// [D W W L] recenti→vecchi: win=0 (primo risultato è D), unbeaten=3
const r3 = calcStreaks([{result:"DRAW"},{result:"WIN"},{result:"WIN"},{result:"LOSS"}]);
console.log("  r3 (D W W L):", r3);
assert("[D W W L] winStreak=0", r3.winStreak===0, `got ${r3.winStreak}`);
assert("[D W W L] unbeatenStreak=3", r3.unbeatenStreak===3, `got ${r3.unbeatenStreak}`);

// [W x10, D, L] recenti→vecchi: win=10
const w10 = Array.from({length:10},()=>({result:"WIN"}));
const r4 = calcStreaks([...w10,{result:"DRAW"},{result:"LOSS"}]);
console.log("  r4 (Wx10 D L):", r4);
assert("[Wx10 D L] winStreak=10", r4.winStreak===10, `got ${r4.winStreak}`);

// [W x15, L] recenti→vecchi: win=15
const w15 = Array.from({length:15},()=>({result:"WIN"}));
const r5 = calcStreaks([...w15,{result:"LOSS"}]);
console.log("  r5 (Wx15 L):", r5);
assert("[Wx15 L] winStreak=15", r5.winStreak===15, `got ${r5.winStreak}`);

console.log("\n=== progressForEntry - principali KIND ===");
const mkCtx = (override: Partial<AggregatorContext> = {}): AggregatorContext => ({
  profileId: "t1",
  isPro: false,
  lifetime: {
    matchesPlayed: 0,
    wins: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    level: 1,
    xp: 0,
    careerIndex: 1000,
  },
  streaks: { winStreak: 0, unbeatenStreak: 0 },
  role: {
    primary: "ATT",
    roleMetrics: { ATT_GOALS: 0, CEN_ASSISTS: 0, DIF_MATCHES_LE1_AGAINST: 0, POR_CLEAN_SHEETS: 0 },
  },
  social: { validShareDays: 0, confirmedReferrals: 0 },
  seasons: { distinctSeasonsPlayed: 0 },
  firstContributionMade: false,
  ...override,
});

function findByKey(key: string): AchievementCatalogEntry {
  const e = ACHIEVEMENT_CATALOG.find((x) => x.key === key);
  if (!e) throw new Error("key not found: " + key);
  return e;
}

// Verifica singoli streaks: MURO_DIFENSIVO 5 unbeaten, INVINCIBILE 10 unbeaten, IMBATTIBILE 20 unbeaten, INARRESTABILE 10 win, MACCHINA_PERFETTA 15 win
console.log("\n=== trophy-engine streaks requirement match ===");
const streakFixtures: Array<{entryKey: string; streaks: {winStreak:number; unbeatenStreak:number}; reqMet: boolean; note: string}> = [
  { entryKey: "MURO_DIFENSIVO", streaks:{winStreak:2, unbeatenStreak:5}, reqMet:true, note:"unbeaten target=5" },
  { entryKey: "MURO_DIFENSIVO", streaks:{winStreak:0, unbeatenStreak:4}, reqMet:false, note:"unbeaten target=5 (manca 1)" },
  { entryKey: "INVINCIBILE",    streaks:{winStreak:3, unbeatenStreak:10}, reqMet:true, note:"unbeaten target=10" },
  { entryKey: "INVINCIBILE",    streaks:{winStreak:9, unbeatenStreak:9}, reqMet:false, note:"unbeaten target=10 (9 non basta)" },
  { entryKey: "IMBATTIBILE",    streaks:{winStreak:0, unbeatenStreak:20}, reqMet:true, note:"unbeaten target=20" },
  { entryKey: "INARRESTABILE",  streaks:{winStreak:10, unbeatenStreak:10}, reqMet:true, note:"win target=10" },
  { entryKey: "INARRESTABILE",  streaks:{winStreak:9,  unbeatenStreak:12}, reqMet:false, note:"win target=10 (9 non basta)" },
  { entryKey: "MACCHINA_PERFETTA", streaks:{winStreak:15, unbeatenStreak:15}, reqMet:true, note:"win target=15" },
  { entryKey: "MACCHINA_PERFETTA", streaks:{winStreak:14, unbeatenStreak:20}, reqMet:false, note:"win target=15 (14 non basta)" },
];
for (const f of streakFixtures) {
  const entry = findByKey(f.entryKey);
  const p = progressForEntry(entry, mkCtx({ streaks: f.streaks, lifetime: { matchesPlayed:f.streaks.unbeatenStreak, wins:f.streaks.winStreak, goals:0, assists:0, cleanSheets:0, level:1, xp:0, careerIndex:1000 } }));
  assert(`${f.entryKey} ${f.note}: reqMet=${f.reqMet} (cur/tgt ${p.current}/${p.target})`, p.requirementMet===f.reqMet, `got requirementMet=${p.requirementMet}`);
}

// 1 partita → Primo Passo deve essere requirementMet === true
{
  const ctx = mkCtx({ lifetime: { matchesPlayed: 1, wins: 0, goals: 0, assists: 0, cleanSheets: 0, level: 1, xp: 50, careerIndex: 1022 } });
  const p = progressForEntry(findByKey("PRIMO_PASSO"), ctx);
  assert("PRIMO_PASSO: matches=1 → target 1 current=1", p.current === 1 && p.target === 1, `${p.current}/${p.target}`);
  assert("PRIMO_PASSO: requirementMet", p.requirementMet === true);
}

// 1 vittoria → PRIMA_VITTORIA
{
  const ctx = mkCtx({ lifetime: { matchesPlayed: 1, wins: 1, goals: 0, assists: 0, cleanSheets: 0, level: 1, xp: 50, careerIndex: 1022 } });
  const p = progressForEntry(findByKey("PRIMA_VITTORIA"), ctx);
  assert("PRIMA_VITTORIA: wins=1 → requirementMet", p.requirementMet === true, `${p.current}/${p.target}`);
}

// distinctSeasons 1 → SEASONS_DISTINCT trophies
{
  const ctx = mkCtx({ seasons: { distinctSeasonsPlayed: 1 } });
  const pSec = progressForEntry(findByKey("SECONDO_CAPITOLO"), ctx);
  const pVet = progressForEntry(findByKey("VETERANO_DELLE_STAGIONI"), ctx);
  const pVita = progressForEntry(findByKey("UNA_VITA_SUL_CAMPO"), ctx);
  assert("SECONDO_CAPITOLO: seasons=1 → 1/2", pSec.current === 1 && pSec.target === 2, `${pSec.current}/${pSec.target}`);
  assert("SECONDO_CAPITOLO: requirementMet=false", pSec.requirementMet === false);
  assert("VETERANO_DELLE_STAGIONI: 1/3", pVet.current === 1 && pVet.target === 3, `${pVet.current}/${pVet.target}`);
  assert("UNA_VITA_SUL_CAMPO: 1/5", pVita.current === 1 && pVita.target === 5, `${pVita.current}/${pVita.target}`);
}

// FIRST_CONTRIBUTION: goals=1
{
  const ctx = mkCtx({ lifetime: { matchesPlayed: 1, wins: 0, goals: 1, assists: 0, cleanSheets: 0, level: 1, xp: 50, careerIndex: 1000 }, firstContributionMade: true });
  const p = progressForEntry(findByKey("PRIMO_CONTRIBUTO"), ctx);
  assert("PRIMO_CONTRIBUTO (gol): requirementMet", p.requirementMet === true, `${p.current}/${p.target}`);
}

// ROLE_AGGREGATE SPECIALISTA: ATT goals >= 10
{
  const entry = findByKey("SPECIALISTA_I");
  console.log("  SPECIALISTA_I requirement:", JSON.stringify(entry.requirement));
  const ctx = mkCtx({
    role: {
      primary: "ATT",
      roleMetrics: { ATT_GOALS: 10, CEN_ASSISTS: 0, DIF_MATCHES_LE1_AGAINST: 0, POR_CLEAN_SHEETS: 0 },
    },
  });
  const p = progressForEntry(entry, ctx);
  assert("SPECIALISTA_I ATT: gol=10 → requirementMet", p.requirementMet === true, `bestPath=${p.bestRolePath?.current}/${p.bestRolePath?.target} completed=${p.completed}`);
}

// ROLE_AGGREGATE SPECIALISTA POR: clean sheets >=10
{
  const entry = findByKey("SPECIALISTA_II");
  console.log("  SPECIALISTA_II requirement:", JSON.stringify(entry.requirement));
  const ctx = mkCtx({
    role: {
      primary: "POR",
      roleMetrics: { ATT_GOALS: 0, CEN_ASSISTS: 0, DIF_MATCHES_LE1_AGAINST: 0, POR_CLEAN_SHEETS: 10 },
    },
  });
  const p = progressForEntry(entry, ctx);
  assert("SPECIALISTA_II POR: CS=10 → requirementMet", p.requirementMet === true, `bestPath=${p.bestRolePath?.current}/${p.bestRolePath?.target} completed=${p.completed}`);
}

// DIF_MATCHES_LE1_AGAINST DIF role 3 matches ≤1 subito
{
  const entry = findByKey("SPECIALISTA_I");
  const ctx = mkCtx({
    role: {
      primary: "DIF",
      roleMetrics: { ATT_GOALS: 0, CEN_ASSISTS: 0, DIF_MATCHES_LE1_AGAINST: 3, POR_CLEAN_SHEETS: 0 },
    },
  });
  const p = progressForEntry(entry, ctx);
  console.log("  SPECIALISTA_I DIF 3 match ≤1 subito:", p.current, p.target, p.completed);
  assert("SPECIALISTA_I DIF 3 ≤1 subito current=3", p.current === 3, `${p.current} (${p.bestRolePath?.current})`);
}

// SHARE_VALID_DAYS 1 e 5
{
  const ctx = mkCtx({ social: { validShareDays: 1, confirmedReferrals: 0 } });
  const p = progressForEntry(findByKey("MOSTRA_LA_CARD"), ctx);
  assert("MOSTRA_LA_CARD shares=1 → reqMet", p.requirementMet === true, `${p.current}/${p.target}`);
  const p5 = progressForEntry(findByKey("PASSAPAROLA"), ctx);
  assert("PASSAPAROLA shares=1 → no", p5.requirementMet === false && p5.current === 1, `${p5.current}/${p5.target}`);
}

// REFERRAL_CONFIRMED 1 e 3
{
  const ctx = mkCtx({ social: { validShareDays: 0, confirmedReferrals: 3 } });
  const p1 = progressForEntry(findByKey("PRIMO_COMPAGNO"), ctx);
  const p3 = progressForEntry(findByKey("SPOGLIATOIO"), ctx);
  assert("PRIMO_COMPAGNO ref=3 reqMet", p1.requirementMet === true, `${p1.current}/${p1.target}`);
  assert("SPOGLIATOIO ref=3 reqMet", p3.requirementMet === true, `${p3.current}/${p3.target}`);
}

// STREAK_UNBEATEN 5 (Muro Difensivo)
{
  const ctx = mkCtx({ streaks: { winStreak: 5, unbeatenStreak: 5 } });
  const entry = ACHIEVEMENT_CATALOG.find((e) => e.requirement.kind === "STREAK_UNBEATEN" && e.requirement.target === 5);
  if (entry) {
    const p = progressForEntry(entry, ctx);
    assert(`STREAK_UNBEATEN 5 ${entry.key}: reqMet`, p.requirementMet === true, `${p.current}/${p.target}`);
  } else {
    console.log("  SKIP STREAK_UNBEATEN 5 non trovato");
  }
}

// LIFETIME_CI 1500 (Top Player)
{
  const ctx = mkCtx({ lifetime: { matchesPlayed: 0, wins: 0, goals: 0, assists: 0, cleanSheets: 0, level: 1, xp: 0, careerIndex: 1500 } });
  const entry = findByKey("TOP_PLAYER");
  const p = progressForEntry(entry, ctx);
  assert("TOP_PLAYER CI=1500 reqMet", p.requirementMet === true, `${p.current}/${p.target}`);
}

// LIFETIME_LEVEL 10 (In Crescita)
{
  const ctx = mkCtx({ lifetime: { matchesPlayed: 0, wins: 0, goals: 0, assists: 0, cleanSheets: 0, level: 10, xp: 0, careerIndex: 1000 } });
  const entry = findByKey("IN_CRESCITA");
  const p = progressForEntry(entry, ctx);
  assert("IN_CRESCITA LV=10 reqMet", p.requirementMet === true, `${p.current}/${p.target}`);
}

// LIFETIME_XP (non ci sono FREE che usano XP, usiamo un PRO)
{
  const entry = ACHIEVEMENT_CATALOG.find((e) => e.requirement.kind === "LIFETIME_XP");
  if (entry) {
    const ctx = mkCtx({ lifetime: { matchesPlayed: 0, wins: 0, goals: 0, assists: 0, cleanSheets: 0, level: 25, xp: entry.requirement.target, careerIndex: 1000 } });
    const p = progressForEntry(entry, ctx);
    assert(`LIFETIME_XP ${entry.key} XP=${entry.requirement.target} → reqMet`, p.requirementMet === true, `${p.current}/${p.target}`);
  }
}

console.log(`\n=== TEST RESULTS: ${passed.length} passed, ${failed.length} failed ===`);
for (const f of failed) {
  console.log(`  ❌ ${f.name}: ${f.reason}`);
}
process.exit(failed.length > 0 ? 1 : 0);
