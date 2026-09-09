// ONE-TIME PRODUCTION RECOVERY SCRIPT
// Goal: safely recover from a FAILED 20260909212241_init migration caused by
// the migration.sql being saved as UTF-16 LE with embedded NUL bytes (Prisma
// error P3018: "string contains embedded null").
//
// SAFETY FIRST:
//  * This script NEVER runs DROP, DELETE, TRUNCATE, RESET, DATABASE-level commands.
//  * All decisions are READ-then-decide with explicit abort.
//  * Only ONE code path ever mutates migration tracking state:
//    IF AND ONLY IF:
//      1. DATABASE_URL is set and the connection works.
//      2. _prisma_migrations table EXISTS.
//      3. A row for migration_name = '20260909212241_init' EXISTS.
//      4. That row has: started_at IS NOT NULL, finished_at IS NULL,
//         rolled_back_at IS NULL  (this is the real Prisma "FAILED" state).
//      5. NONE of the CalcettoXP application tables exist in schema public:
//           "User", "Account", "Session", "PlayerProfile".
//    THEN:
//      a. Run `prisma migrate resolve --rolled-back 20260909212241_init` which
//         ONLY sets rolled_back_at = now() on the failed row in _prisma_migrations.
//      b. Run `prisma migrate deploy` to actually apply the now-fixed UTF-8
//         migration.sql.
//    OTHERWISE: ABORT with exit code 1 and a clear diagnostic report.
//    If migration already applied successfully: no-op exit 0.
//
// After this script succeeds ONCE, the operator (or next commit) should:
//    1. Delete this file.
//    2. Revert package.json "build" script back to the long-term:
//         "prisma migrate deploy && next build"

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const MIGRATION_NAME = "20260909212241_init";
const APP_TABLES = ["User", "Account", "Session", "PlayerProfile"];
const PUBLIC_SCHEMA = "public";

function log(title, payload) {
  const sep = "=" .repeat(60);
  process.stdout.write(`\n${sep}\n[recover] ${title}\n${sep}\n`);
  if (payload !== undefined) {
    if (typeof payload === "string") process.stdout.write(payload + "\n");
    else process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  }
}

function abort(reason, report) {
  log(`FATAL ABORT — Build stopped safely`, reason);
  if (report) log(`DIAGNOSTIC REPORT`, report);
  process.stdout.write(
    "\n[recover] No data was modified. No tables were dropped. No rows deleted.\n"
  );
  process.stdout.write(
    "[recover] This deploy was intentionally aborted to prevent ambiguous state.\n"
  );
  process.stdout.write(
    "[recover] Resolve manually or open an issue with the DIAGNOSTIC REPORT above.\n"
  );
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: process.platform === "win32",
    ...opts,
  });
  return {
    ok: r.status === 0,
    status: r.status,
    stdout: (r.stdout ? r.stdout.toString("utf8") : "").trim(),
    stderr: (r.stderr ? r.stderr.toString("utf8") : "").trim(),
  };
}

function prismaCli(args, extraEnv = {}) {
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  return run(npx, ["--no-install", "prisma", ...args], {
    env: { ...process.env, ...extraEnv },
  });
}

async function loadPrismaClient() {
  const modPath = findNodeModule("@prisma/client");
  const { PrismaClient } = await import(modPath);
  return { PrismaClient };
}

function findNodeModule(name) {
  const start = path.dirname(fileURLToPath(import.meta.url));
  let cur = start;
  while (true) {
    const candidate = path.join(cur, "node_modules", name);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  throw new Error(
    `[recover] Could not find Node module "${name}". Expected in node_modules.`
  );
}

// Real Prisma _prisma_migrations state semantics (no `is_success` column):
//  - SUCCESSFULLY APPLIED: finished_at IS NOT NULL AND rolled_back_at IS NULL
//  - FAILED (in progress that errored, or failed deploy):
//        started_at IS NOT NULL AND finished_at IS NULL AND rolled_back_at IS NULL
//  - ROLLED BACK (via `prisma migrate resolve --rolled-back`):
//        rolled_back_at IS NOT NULL
function classifyRow(row) {
  if (!row) return { status: "missing" };
  const started = row.started_at != null;
  const finished = row.finished_at != null;
  const rolledBack = row.rolled_back_at != null;
  if (rolledBack) return { status: "rolled_back" };
  if (finished) return { status: "applied_success" };
  if (started && !finished) return { status: "failed" };
  return { status: "unknown" };
}

async function main() {
  log("ONE-TIME INIT MIGRATION RECOVERY STARTED", `migration=${MIGRATION_NAME}`);

  if (!process.env.DATABASE_URL) {
    abort(
      "DATABASE_URL environment variable is empty/not set.",
      "This script relies on the Neon/Vercel integration-provided DATABASE_URL."
    );
  }
  log("DATABASE_URL", "Found (value redacted, length=" + process.env.DATABASE_URL.length + ")");

  let PrismaClient;
  try {
    ({ PrismaClient } = await loadPrismaClient());
  } catch (e) {
    abort("Failed to import @prisma/client (prisma generate may not have run).", `${e && e.stack ? e.stack : e}`);
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  const state = {
    migrationsTableExists: null,
    migrationRow: null,
    migrationRowClassified: null,
    appTables: {},
  };

  try {
    // 1. Does _prisma_migrations exist?
    const r1 = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = $1 AND table_name = '_prisma_migrations'
      ) AS exists
    `, PUBLIC_SCHEMA);
    state.migrationsTableExists = Boolean(r1[0].exists);
    log("_prisma_migrations table", state.migrationsTableExists ? "EXISTS" : "MISSING");

    if (state.migrationsTableExists) {
      // 2. Row for our init migration — SELECT ONLY the real Prisma columns:
      //    id, checksum, finished_at, migration_name, logs, rolled_back_at,
      //    started_at, applied_steps_count
      // NOTE: There is NO `is_success` column; there is NO `rollback_log` column.
      const r2 = await prisma.$queryRawUnsafe(`
        SELECT id,
               checksum,
               finished_at,
               migration_name,
               logs,
               rolled_back_at,
               started_at,
               applied_steps_count
        FROM "_prisma_migrations"
        WHERE migration_name = $1
        ORDER BY started_at DESC NULLS LAST
        LIMIT 1
      `, MIGRATION_NAME);
      state.migrationRow = r2.length > 0 ? r2[0] : null;
      if (state.migrationRow) {
        const row = { ...state.migrationRow };
        if (row.checksum && typeof row.checksum === "string") {
          row.checksum = `[sha256 ${row.checksum.slice(0, 12)}…]`;
        } else if (row.checksum) {
          row.checksum = `[binary checksum ${Buffer.byteLength(row.checksum)} bytes]`;
        }
        if (row.logs && typeof row.logs === "string") {
          row.logs = `[truncated: ${row.logs.length} chars]`;
        }
        state.migrationRowClassified = classifyRow(state.migrationRow);
        log(`_prisma_migrations record for ${MIGRATION_NAME}`, JSON.parse(JSON.stringify({
          row,
          classified: state.migrationRowClassified,
        })));
      } else {
        state.migrationRowClassified = { status: "missing" };
        log(`_prisma_migrations record for ${MIGRATION_NAME}`, "MISSING");
      }
    }

    // 3. Do application tables exist?
    for (const t of APP_TABLES) {
      const r = await prisma.$queryRawUnsafe(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = $1 AND table_name = $2
        ) AS exists
      `, PUBLIC_SCHEMA, t);
      state.appTables[t] = Boolean(r[0].exists);
    }
    log("Application tables (public schema)", state.appTables);

  } catch (e) {
    const msg = e && e.stack ? e.stack : String(e);
    abort("Failed to read database state via Prisma raw queries.", msg);
  } finally {
    try { await prisma.$disconnect(); } catch {}
  }

  const anyAppTableExists = Object.values(state.appTables).some(Boolean);
  const allAppTablesExist = Object.values(state.appTables).every(Boolean);
  const classification = state.migrationRowClassified;

  // =============== DECISION TREE ===============
  //
  // CASE A: _prisma_migrations doesn't exist AND no app tables exist.
  // This is equivalent to a fully empty DB — the failed migration never
  // succeeded in even writing its row. Nothing to resolve. Let the normal
  // prisma migrate deploy create the tracking table and apply init normally.
  // We EXIT 0 so the package.json build chain continues.
  if (!state.migrationsTableExists && !anyAppTableExists) {
    log(
      `CLEAN STATE — nothing to recover`,
      "_prisma_migrations tracking table missing, no app tables present.\n" +
      "→ Skipping recovery. Next step in build chain will apply init normally."
    );
    process.exit(0);
  }

  // CASE B: Migration row exists AND was SUCCESSFULLY APPLIED
  //         (finished_at IS NOT NULL AND rolled_back_at IS NULL).
  // Migration was already applied — possibly by a prior human fix or an earlier
  // successful deploy after the encoding bug was corrected.
  // No-op: exit 0 so chain continues (accidental runs after recovery are safe).
  if (classification && classification.status === "applied_success") {
    log(
      `SKIP — init migration already applied successfully`,
      `_prisma_migrations row for ${MIGRATION_NAME}: finished_at set, rolled_back_at null.\n` +
      "Recovery script is now a no-op. Consider removing it in the next commit."
    );
    process.exit(0);
  }

  // CASE C: _prisma_migrations + ALL app tables exist, but no matching row
  // This implies an out-of-band baseline or human manual DB creation.
  // We refuse to touch it; manual baseline using prisma migrate resolve
  // --applied is required (operator decision, not ours).
  if (classification && classification.status === "missing" && allAppTablesExist) {
    abort(
      "Ambiguous state: app tables exist, but _prisma_migrations has no record of init migration.",
      JSON.parse(JSON.stringify({ state }))
    );
  }

  // CASE D: THE RECOVERY PATH — STRICT CONDITIONS
  //  - Row EXISTS
  //  - Classified as FAILED: started_at IS NOT NULL, finished_at IS NULL,
  //    rolled_back_at IS NULL
  //  - ZERO of the four app tables exist (public schema empty of CalcettoXP
  //    objects — the bad migration failed before any CREATE TABLE ran, which
  //    is exactly the P3018 scenario).
  if (classification && classification.status === "failed" && !anyAppTableExists) {
    const row = state.migrationRow;
    log(
      `RECOVERY PATH TRIGGERED — marking failed migration rolled back, then deploying`,
      JSON.parse(JSON.stringify({
        reason:
          "FAILED row (started_at set, finished_at null, rolled_back_at null) " +
          "+ empty public schema (no User/Account/Session/PlayerProfile tables)",
        migration: MIGRATION_NAME,
        started_at: row.started_at,
        applied_steps_count: row.applied_steps_count,
      }))
    );

    log("STEP 1/2", `prisma migrate resolve --rolled-back ${MIGRATION_NAME}`);
    const res = prismaCli(["migrate", "resolve", "--rolled-back", MIGRATION_NAME]);
    if (!res.ok) {
      abort(
        `prisma migrate resolve --rolled-back ${MIGRATION_NAME} FAILED.`,
        JSON.parse(JSON.stringify({ status: res.status, stdout: res.stdout, stderr: res.stderr }))
      );
    }
    log("resolve stdout", res.stdout);
    if (res.stderr) log("resolve stderr (informational)", res.stderr);

    log("STEP 2/2", `prisma migrate deploy`);
    const dep = prismaCli(["migrate", "deploy"]);
    if (!dep.ok) {
      abort(
        `prisma migrate deploy FAILED after successful resolve.`,
        JSON.parse(JSON.stringify({ status: dep.status, stdout: dep.stdout, stderr: dep.stderr }))
      );
    }
    log("deploy stdout", dep.stdout);
    if (dep.stderr) log("deploy stderr (informational)", dep.stderr);

    log(
      "RECOVERY COMPLETED SUCCESSFULLY",
      "The init migration is now marked applied, and all tables should exist.\n" +
      "Please delete scripts/recover-failed-init-migration.mjs in the next commit\n" +
      "and revert package.json build to: \"prisma migrate deploy && next build\"."
    );
    process.exit(0);
  }

  // CASE E: anything else (some tables exist / mixed state / rolled_back but
  // still some tables / unknown status / etc.) → refuse to touch anything.
  abort(
    "State does not match ANY safe recovery path. Aborting build.",
    JSON.parse(JSON.stringify({
      state,
      classification,
      note:
        "Valid paths are (A) empty DB, (B) migration already applied, " +
        "(D) failed row + zero app tables. All other combinations are refused " +
        "to prevent partial or destructive operations.",
    }))
  );
}

main().catch((e) => {
  const msg = e && e.stack ? e.stack : String(e);
  abort("UNHANDLED EXCEPTION in recovery script.", msg);
});
