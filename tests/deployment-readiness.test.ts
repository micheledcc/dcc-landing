import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { verifyProductionReadiness, CURATED_ROOM_ID } from "../lib/deployment-readiness";

const env = { VERCEL_ENV: "production", GOOGLE_CLIENT_ID: "test", GOOGLE_CLIENT_SECRET: "test", GOOGLE_REFRESH_TOKEN: "test", JWT_SECRET: "test", POSTGRES_URL: "test" };
const sample = { id: "reference", name: "Synthetic.pdf", mimeType: "application/pdf", size: 5, modifiedTime: "", isFolder: false };

test("local and preview builds do not assume production credentials", async () => {
  const fail = async () => { throw new Error("Should not contact production"); };
  assert.deepEqual(await verifyProductionReadiness({}, { list: fail, read: fail, database: fail }), { skipped: true });
});

test("local readiness entrypoint exits without creating a database connection", () => {
  const childEnv: NodeJS.ProcessEnv = { ...process.env, VERCEL_ENV: "development" };
  delete childEnv.POSTGRES_URL;
  const output = execFileSync(process.execPath, ["--import", "tsx", "scripts/verify-production-readiness.ts"], { env: childEnv, encoding: "utf8" });
  assert.equal(JSON.parse(output).skipped, true);
});

test("required deployment entrypoint fails closed when Vercel system variables and credentials are absent", () => {
  const childEnv: NodeJS.ProcessEnv = { ...process.env };
  for (const key of ["VERCEL_ENV", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN", "JWT_SECRET", "POSTGRES_URL"]) delete childEnv[key];
  assert.throws(() => execFileSync(process.execPath, ["--import", "tsx", "scripts/verify-production-readiness.ts", "--required"], { env: childEnv, encoding: "utf8", stdio: "pipe" }), (error: unknown) => {
    const failure = error as { status: number; stderr: string };
    return failure.status === 1 && failure.stderr.includes("DCC production readiness failed");
  });
});

test("missing credentials and the old public room block publication before network reads", async () => {
  const fail = async () => { throw new Error("Unexpected network read"); };
  const dependencies = { list: fail, read: fail, database: fail };
  await assert.rejects(verifyProductionReadiness({ VERCEL_ENV: "production" }, dependencies), /credentials are incomplete/);
  await assert.rejects(verifyProductionReadiness({ ...env, GOOGLE_DRIVE_DATA_ROOM_FOLDER_ID: "legacy-public-room" }, dependencies), /approved private/);
});

test("production checks the actual private room, shortcut bytes and read-only database access", async () => {
  let databaseReads = 0;
  const result = await verifyProductionReadiness(env, {
    async list(root) { assert.equal(root, CURATED_ROOM_ID); return [sample]; },
    async read(id) { assert.equal(id, sample.id); return { buffer: Buffer.from("%PDF-"), mimeType: sample.mimeType }; },
    async database() { databaseReads++; },
  });
  assert.equal(result.skipped, false);
  assert.equal(result.files, 1);
  assert.equal(databaseReads, 1);
});

test("unreadable targets, wrong content and missing database access fail the build check", async () => {
  const dependencies = {
    async list() { return [sample]; },
    async read() { return { buffer: Buffer.from("wrong"), mimeType: sample.mimeType }; },
    async database() {},
  };
  await assert.rejects(verifyProductionReadiness(env, dependencies), /content verification/);
  await assert.rejects(verifyProductionReadiness(env, { ...dependencies, async read() { throw new Error("No target access"); } }));
  await assert.rejects(verifyProductionReadiness(env, { ...dependencies, async read() { return { buffer: Buffer.from("%PDF-"), mimeType: sample.mimeType }; }, async database() { throw new Error("No database access"); } }));
});
