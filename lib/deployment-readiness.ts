import type { DriveFile } from "./drive-reader";

export const CURATED_ROOM_ID = "1GjNWfzNvPtFmsy0IMddsqy4ghlezjscD";

export async function verifyProductionReadiness(
  env: Record<string, string | undefined>,
  dependencies: {
    list(root: string): Promise<DriveFile[]>;
    read(id: string): Promise<{ buffer: Buffer; mimeType: string }>;
    database(): Promise<void>;
  }
) {
  if (env.VERCEL_ENV !== "production") return { skipped: true };
  const required = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN", "JWT_SECRET", "POSTGRES_URL"];
  if (required.some((key) => !env[key]?.trim())) throw new Error("Production data-room credentials are incomplete");
  const root = env.GOOGLE_DRIVE_DATA_ROOM_FOLDER_ID?.trim() || CURATED_ROOM_ID;
  if (root !== CURATED_ROOM_ID) throw new Error("Production must point to the approved private data room");
  const files = await dependencies.list(root);
  if (!files.length || new Set(files.map((f) => f.id)).size !== files.length) throw new Error("Production room membership verification failed");
  // A real preview/content read catches credentials that can list shortcuts but
  // cannot read their targets. Do not expose file names or credentials in logs.
  const sample = files.filter((f) => f.mimeType === "application/pdf" && f.size > 0)
    .sort((a, b) => a.size - b.size)[0];
  if (!sample) throw new Error("No readable preview document in the production room");
  const content = await dependencies.read(sample.id);
  if (content.buffer.length !== sample.size || content.mimeType !== sample.mimeType || content.buffer.subarray(0, 5).toString() !== "%PDF-") {
    throw new Error("Production shortcut content verification failed");
  }
  await dependencies.database();
  return { skipped: false, roomId: root, files: files.length, shortcutPreviewRead: true, databaseRead: true };
}
