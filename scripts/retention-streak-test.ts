import { computeActiveStreaks } from "../src/lib/retention";
import { calcStreaks } from "../src/lib/achievement-engine";

type R = "WIN" | "DRAW" | "LOSS";

// Matches are fed NEWEST FIRST per convenzione dello user (most recent first).

const mk = (arr: R[]) => arr.map((r) => ({ result: r, playedAt: new Date() }));

let failed = 0;
const assertEq = <T>(label: string, actual: T, expected: T) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) console.log(`  ✓ ${label}`);
  else {
    failed++;
    console.error(`  ✗ ${label}   actual=${JSON.stringify(actual)}  expected=${JSON.stringify(expected)}`);
  }
};

console.log("=====  RETENTION: computeActiveStreaks 7 CASI  =====");

// Case A: [W] newest first
assertEq("[W] => win 1 / unbeaten 1", computeActiveStreaks(mk(["WIN"])), {
  winStreak: 1, unbeatenStreak: 1, lossStreak: 0,
});

// Case B: [W,W]
assertEq("[W,W] => win 2 / unbeaten 2", computeActiveStreaks(mk(["WIN","WIN"])), {
  winStreak: 2, unbeatenStreak: 2, lossStreak: 0,
});

// Case C: [W,W,D] newest first (recent → old: W W D → win 2 / unbeaten 3
assertEq("[W,W,D] (newest→oldest) => win 2 / unbeaten 3", computeActiveStreaks(mk(["WIN","WIN","DRAW"])), {
  winStreak: 2, unbeatenStreak: 3, lossStreak: 0,
});

// Case D: [D,W,W] newest first (D più recente; win: D≠WIN → 0; unbeaten: 3)
assertEq("[D,W,W] (newest→oldest) => win 0 / unbeaten 3", computeActiveStreaks(mk(["DRAW","WIN","WIN"])), {
  winStreak: 0, unbeatenStreak: 3, lossStreak: 0,
});

// Case E: [L,W,W] newest first → win 0, unbeaten 0
assertEq("[L,W,W] (newest→oldest) => win 0 / unbeaten 0 / loss 1", computeActiveStreaks(mk(["LOSS","WIN","WIN"])), {
  winStreak: 0, unbeatenStreak: 0, lossStreak: 1,
});

// Case F: 6 W consecutive prima di 1 L (perdita più recente → L nuovo, quindi crono 6W poi L, newest first [L,W,W,W,W,W,W])
assertEq("[W×6,L] newest-first [L,W^6] => win 0 / unbeaten 0 / loss 1", computeActiveStreaks(mk(["LOSS","WIN","WIN","WIN","WIN","WIN","WIN"])), {
  winStreak: 0, unbeatenStreak: 0, lossStreak: 1,
});

// Case G: [W×6,L,W] → crono prima 6W, poi una L, poi una W (vinta più recente). Newest first = [W, L, W×6].
// Win: 1 (W poi L break). Unbeaten: 1. Loss: 0.
assertEq("[W×6,L,W] newest-first [W,L,W^6] => win 1 / unbeaten 1", computeActiveStreaks(mk(["WIN","LOSS","WIN","WIN","WIN","WIN","WIN","WIN"])), {
  winStreak: 1, unbeatenStreak: 1, lossStreak: 0,
});

console.log("\n=====  TROPHY ENGINE calcStreaks NON-REGRESSION  =====");

// Trophy engine ha solo win e unbeaten. Confrontiamo con retention sugli stessi casi (win e unbeaten only)

const casi = [
  ["A", mk(["WIN"])],
  ["B", mk(["WIN","WIN"])],
  ["C", mk(["WIN","WIN","DRAW"])],
  ["D", mk(["DRAW","WIN","WIN"])],
  ["E", mk(["LOSS","WIN","WIN"])],
  ["F", mk(["LOSS","WIN","WIN","WIN","WIN","WIN","WIN"])],
  ["G", mk(["WIN","LOSS","WIN","WIN","WIN","WIN","WIN","WIN"])],
] as const;

for (const [name, arr] of casi) {
  const ret = computeActiveStreaks(arr);
  const tro = calcStreaks(arr as any);
  const sameWin = ret.winStreak === tro.winStreak;
  const sameUnb = ret.unbeatenStreak === tro.unbeatenStreak;
  if (sameWin && sameUnb) {
    console.log(`  ✓ calcStreaks case ${name} aligned (win ${ret.winStreak}, unbeaten ${ret.unbeatenStreak})`);
  } else {
    failed++;
    console.error(`  ✗ calcStreaks case ${name} DIVERGENCE  retention(w=${ret.winStreak},u=${ret.unbeatenStreak}) vs trophy(w=${tro.winStreak},u=${tro.unbeatenStreak})`);
  }
}

console.log("\n=====  RETENTION / TROPHY STREAK SUMMARY  =====");
console.log(failed === 0 ? "PASS" : `FAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
