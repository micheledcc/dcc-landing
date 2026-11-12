import { sql } from "@vercel/postgres";
import { listDriveFolder, getDriveFileBuffer } from "../lib/drive";
import { verifyProductionReadiness } from "../lib/deployment-readiness";

async function main() {
  let databaseUsed = false;
  try {
    // The checked-in Vercel build command requires this check even when the
    // project's optional system-environment-variable exposure is disabled.
    const env = process.argv.includes("--required") ? { ...process.env, VERCEL_ENV: "production" } : process.env;
    const result = await verifyProductionReadiness(env, {
      list: listDriveFolder,
      read: getDriveFileBuffer,
      async database() { databaseUsed = true; await sql`SELECT 1 AS dcc_readiness`; },
    });
    console.log(JSON.stringify({ check: "dcc-production-readiness", ...result }));
  } catch {
    // SDK error objects can contain OAuth credentials or a connection string.
    console.error("DCC production readiness failed. The approved private room, its preview targets, required credentials and database must be readable before publishing. Existing production remains unchanged.");
    process.exitCode = 1;
  } finally {
    if (databaseUsed) {
      try { await sql.end(); }
      catch { console.error("DCC readiness database cleanup failed."); process.exitCode = 1; }
    }
  }
}

void main();
