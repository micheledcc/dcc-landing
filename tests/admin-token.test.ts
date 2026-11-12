import assert from "node:assert/strict";
import { test } from "node:test";
import { SignJWT } from "jose";
import { verifyAdminToken } from "../lib/admin-token";

process.env.JWT_SECRET = "isolated-admin-test-secret-not-a-production-credential";
const admin = { sub: "123e4567-e89b-42d3-a456-426614174000", email: "owner@example.test", name: "Test Owner", role: "owner" };
async function sign(payload: Record<string, unknown>, expiry = "1h") {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime(expiry).sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

test("legacy owner/member/admin sessions remain valid and new sessions use an explicit admin type", async () => {
  for (const role of ["owner", "member", "admin"]) {
    const expected = { ...admin, role };
    assert.deepEqual(await verifyAdminToken(await sign(expected)), expected);
    assert.deepEqual(await verifyAdminToken(await sign({ ...expected, type: "admin" })), expected);
  }
});

test("investor room and pipeline credentials cannot authenticate to the dashboard or admin APIs", async () => {
  assert.equal(await verifyAdminToken(await sign({ type: "room_viewer", token: "synthetic-room", email: "investor@example.test" })), null);
  assert.equal(await verifyAdminToken(await sign({ type: "viewer", token: "synthetic-pipeline", email: "investor@example.test" })), null);
  assert.equal(await verifyAdminToken(await sign({ ...admin, type: "room_viewer" })), null);
});

test("missing administrator identity, unsupported roles, expired and forged credentials are denied", async () => {
  for (const payload of [{ ...admin, sub: "not-a-database-id" }, { ...admin, sub: undefined }, { ...admin, role: undefined }, { ...admin, role: "viewer" }, { ...admin, name: undefined }]) {
    assert.equal(await verifyAdminToken(await sign(payload)), null);
  }
  assert.equal(await verifyAdminToken(await sign(admin, "-1s")), null);
  assert.equal(await verifyAdminToken("forged"), null);
});
