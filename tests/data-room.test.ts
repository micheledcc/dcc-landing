import assert from "node:assert/strict";
import { test } from "node:test";
import { SignJWT } from "jose";
import { DRIVE_FOLDER, DRIVE_SHORTCUT, readDriveTree, flattenDriveTree, resolveDriveReference, type DriveTransport, type DriveMetadata, type DriveFile } from "../lib/drive-reader";
import { isRoomActive, roomViewer, roomCookieName, stringList, type RoomAccess } from "../lib/room-access";
import { serveRoomFile } from "../lib/room-file-response";
import { getDataRoomFolderId } from "../lib/data-room-config";
import { snapshotRoomSelection } from "../lib/room-selection";

const target = { id: "target", name: "canonical.pdf", mimeType: "application/pdf", size: "123", modifiedTime: "2026-11-11" };
const reference = { id: "ref", name: "Investor edition.pdf", mimeType: DRIVE_SHORTCUT, shortcutDetails: { targetId: "target", targetMimeType: "application/pdf", targetResourceKey: "resource-key" } };

test("native shortcut displays target metadata but preserves its reference ID and room path", async () => {
  const calls: unknown[] = [];
  const transport: DriveTransport = {
    async list(id, page) {
      calls.push(["list", id, page]);
      if (id === "root" && !page) return { files: [{ id: "folder", name: "Investment", mimeType: DRIVE_FOLDER }], nextPageToken: "page-2" };
      if (id === "folder") return { files: [reference] };
      return { files: [{ id: "empty", name: "Empty", mimeType: DRIVE_FOLDER }] };
    },
    async metadata(id, key) { calls.push(["meta", id, key]); return target; },
  };
  // Make the empty leaf terminate rather than return itself.
  const list = transport.list;
  transport.list = (id, page) => id === "empty" ? Promise.resolve({ files: [] }) : list(id, page);
  const tree = await readDriveTree(transport, "root");
  assert.equal(tree.length, 1);
  assert.deepEqual(flattenDriveTree(tree), [{ id: "ref", name: "Investor edition.pdf", mimeType: "application/pdf", size: 123, modifiedTime: "2026-11-11", isFolder: false, path: "Investment/Investor edition.pdf" }]);
  assert.ok(calls.some((c) => JSON.stringify(c) === JSON.stringify(["list", "root", "page-2"])));
  assert.ok(calls.some((c) => JSON.stringify(c) === JSON.stringify(["meta", "target", "resource-key"])));
});

test("a target ID does not substitute for an allowed shortcut; empty selection exposes nothing", async () => {
  let reads = 0;
  const transport: DriveTransport = { async list() { return { files: [reference] }; }, async metadata() { reads++; return target; } };
  assert.deepEqual(await readDriveTree(transport, "root", []), []);
  assert.deepEqual(await readDriveTree(transport, "root", ["target"]), []);
  assert.equal(reads, 0);
  assert.equal(flattenDriveTree(await readDriveTree(transport, "root", ["ref"]))[0].id, "ref");
});

test("legacy direct files keep their original IDs and require no shortcut metadata lookup", async () => {
  const transport: DriveTransport = { async list() { return { files: [target] }; }, async metadata() { throw new Error("Unexpected lookup"); } };
  assert.equal(flattenDriveTree(await readDriveTree(transport, "legacy", ["target"]))[0].id, "target");
});

test("broken, trashed, nested and folder shortcuts fail closed", async () => {
  const transport: DriveTransport = { async list() { return {}; }, async metadata() { return { ...target, trashed: true }; } };
  await assert.rejects(resolveDriveReference(transport, reference));
  transport.metadata = async () => ({ ...reference, id: "nested" });
  await assert.rejects(resolveDriveReference(transport, reference));
  const folder: DriveMetadata = { ...reference, shortcutDetails: { targetId: "outside", targetMimeType: DRIVE_FOLDER } };
  await assert.rejects(resolveDriveReference(transport, folder));
});

test("email verification is bound to the exact link, viewer type, expiry and current allowed email", async () => {
  process.env.JWT_SECRET = "isolated-test-secret-never-a-production-credential";
  const link: RoomAccess = { is_active: true, expires_at: new Date(Date.now() + 60_000), allowed_emails: ["reviewer@example.test"] };
  async function cookie(claims: object, expiry = "1h") {
    return new SignJWT({ type: "room_viewer", email: "reviewer@example.test", token: "room-a", ...claims }).setProtectedHeader({ alg: "HS256" }).setExpirationTime(expiry).sign(new TextEncoder().encode(process.env.JWT_SECRET));
  }
  assert.equal((await roomViewer(link, "room-a")).allowed, false);
  assert.equal((await roomViewer(link, "room-a", await cookie({}))).allowed, true);
  for (const claims of [{ token: "room-b" }, { email: "removed@example.test" }, { type: "admin" }]) {
    assert.equal((await roomViewer(link, "room-a", await cookie(claims))).allowed, false);
  }
  assert.equal((await roomViewer(link, "room-a", await cookie({}, "-1s"))).allowed, false);
  assert.equal((await roomViewer(link, "room-a", "forged")).allowed, false);
  assert.equal((await roomViewer({ ...link, allowed_emails: null }, "room-a")).allowed, true);
  assert.equal(roomCookieName("room-a"), "dcc_room_v2_room-a");
});

test("revoked, expired and malformed-expiry links are inactive", () => {
  assert.equal(isRoomActive({ is_active: false, expires_at: "2099-01-01" }), false);
  assert.equal(isRoomActive({ is_active: true, expires_at: "2000-01-01" }), false);
  assert.equal(isRoomActive({ is_active: true, expires_at: "invalid" }), false);
  assert.equal(isRoomActive(null), false);
});

const file: DriveFile = { id: "ref", name: "Investor edition.pdf", mimeType: "application/pdf", size: 3, modifiedTime: "", isFolder: false };
const active: RoomAccess = { is_active: true, expires_at: "2099-01-01", allowed_emails: null, allow_download: false };

test("file endpoint enforces membership, gate and download policy before fetching any bytes", async () => {
  let reads = 0, lists = 0;
  const files = { async list() { lists++; return [file]; }, async read(id: string) { reads++; assert.equal(id, "ref"); return { buffer: Buffer.from("pdf"), mimeType: "application/pdf", name: file.name }; } };
  const request = { link: active, token: "room-a", referenceId: "ref", download: false };
  assert.equal((await serveRoomFile({ ...request, referenceId: "arbitrary-private-file" }, files)).status, 404);
  assert.equal((await serveRoomFile({ ...request, referenceId: "target" }, files)).status, 404);
  assert.equal((await serveRoomFile({ ...request, download: true }, files)).status, 403);
  assert.equal(reads, 0);
  lists = 0;
  assert.equal((await serveRoomFile({ ...request, link: { ...active, is_active: false } }, files)).status, 404);
  assert.equal((await serveRoomFile({ ...request, link: { ...active, allowed_emails: ["reviewer@example.test"] } }, files)).status, 401);
  assert.equal(lists, 0);
  const response = await serveRoomFile(request, files);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "pdf");
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.equal(reads, 1);
});

test("view-only non-preview files cannot bypass download controls through the inline endpoint", async () => {
  const response = await serveRoomFile({ link: active, token: "room-a", referenceId: "ref", download: false }, {
    async list() { return [{ ...file, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }]; },
    async read() { throw new Error("Must not fetch bytes"); },
  });
  assert.equal(response.status, 403);
});

test("configured default is private, with no fallback to the old public room", () => {
  delete process.env.GOOGLE_DRIVE_DATA_ROOM_FOLDER_ID;
  assert.equal(getDataRoomFolderId(), "1GjNWfzNvPtFmsy0IMddsqy4ghlezjscD");
  process.env.GOOGLE_DRIVE_DATA_ROOM_FOLDER_ID = "override_room";
  assert.equal(getDataRoomFolderId(), "override_room");
  process.env.GOOGLE_DRIVE_DATA_ROOM_FOLDER_ID = "bad' query";
  assert.throws(getDataRoomFolderId);
  delete process.env.GOOGLE_DRIVE_DATA_ROOM_FOLDER_ID;
});

test("null means unfiltered legacy selection, while [] stays empty and malformed selections fail", () => {
  assert.equal(stringList(null), null);
  assert.deepEqual(stringList("[]"), []);
  assert.deepEqual(stringList('["ref"]'), ["ref"]);
  assert.throws(() => stringList('{"arbitrary":"object"}'));
});

test("new selections snapshot exact current files; none never becomes all and cross-room IDs are rejected", () => {
  const current = ["ref-a", "ref-b"];
  const saved = snapshotRoomSelection(current, undefined);
  current.push("new-file-after-link-created");
  assert.deepEqual(saved, ["ref-a", "ref-b"]);
  assert.deepEqual(snapshotRoomSelection(current, []), []);
  assert.throws(() => snapshotRoomSelection(current, [], false));
  assert.throws(() => snapshotRoomSelection(current, ["old-room-file"]));
  assert.throws(() => snapshotRoomSelection(current, "ref-a"));
  assert.deepEqual(snapshotRoomSelection(current, ["ref-a", "ref-a"]), ["ref-a"]);
});
