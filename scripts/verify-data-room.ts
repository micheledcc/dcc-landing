// Read-only integration check. Credentials are supplied by the caller's environment.
import { createHash } from "node:crypto";
import { listDriveFolder, listDriveFolderTree, getDriveFileBuffer } from "../lib/drive";
import { getDataRoomFolderId } from "../lib/data-room-config";

async function verify() {
  const start = Date.now();
  const root = getDataRoomFolderId();
  const tree = await listDriveFolderTree(root);
  const flatten = (items: typeof tree): typeof tree => items.flatMap((f) => f.isFolder ? flatten(f.children || []) : [f]);
  const files = flatten(tree);
  if (files.length !== 53) throw new Error("Unexpected room membership");
  const unique = new Set(files.map((f) => f.id));
  if (unique.size !== 53) throw new Error("Repeated reference IDs");
  if ((await listDriveFolder(root, [])).length) throw new Error("Empty selection exposed files");
  const checks = [];
  for (const suffix of ["DCC_OnePager.pdf", "DCC_Personnel_Schedule.docx", "DCC_Cap_Table_DataRoom.xlsx"]) {
    const file = files.find((f) => f.name === suffix);
    if (!file) throw new Error("Required baseline document missing");
    const selected = await listDriveFolder(root, [file.id]);
    if (selected.length !== 1 || selected[0].id !== file.id) throw new Error("Selection mismatch");
    const downloaded = await getDriveFileBuffer(file.id);
    if (downloaded.buffer.length !== file.size || downloaded.mimeType !== file.mimeType) throw new Error("Downloaded metadata mismatch");
    checks.push({ name: file.name, referenceId: file.id, bytes: downloaded.buffer.length, sha256: createHash("sha256").update(downloaded.buffer).digest("hex") });
  }
  console.log(JSON.stringify({ ok: true, root, files: files.length, sections: tree.map((f) => f.name), downloads: checks, elapsedMs: Date.now() - start }));
}

verify().catch(() => {
  // Never print a Google OAuth/Gaxios error object: it can contain credentials.
  console.log(JSON.stringify({ ok: false, error: "Drive integration verification failed; no files or permissions changed" }));
  process.exitCode = 1;
});
