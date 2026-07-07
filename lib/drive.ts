import { google } from "googleapis";
import { Readable } from "stream";

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth credentials not set");
  }
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  modifiedTime: string;
  isFolder: boolean;
}

export async function listDriveFolder(
  folderId: string,
  allowedFileIds?: string[] | null
): Promise<DriveFile[]> {
  const drive = google.drive({ version: "v3", auth: getAuth() });

  const files: DriveFile[] = [];

  async function walk(parentId: string) {
    const res = await drive.files.list({
      q: `'${parentId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, size, modifiedTime)",
      orderBy: "name",
    });

    for (const f of res.data.files || []) {
      const isFolder = f.mimeType === "application/vnd.google-apps.folder";

      if (isFolder) {
        await walk(f.id!);
      } else {
        if (allowedFileIds && !allowedFileIds.includes(f.id!)) continue;
        files.push({
          id: f.id!,
          name: f.name!,
          mimeType: f.mimeType!,
          size: parseInt(f.size || "0"),
          modifiedTime: f.modifiedTime!,
          isFolder: false,
        });
      }
    }
  }

  await walk(folderId);
  return files;
}

export async function getDriveFileStream(
  fileId: string
): Promise<{ stream: Readable; mimeType: string; name: string; size: number }> {
  const drive = google.drive({ version: "v3", auth: getAuth() });

  // Get metadata first
  const meta = await drive.files.get({
    fileId,
    fields: "name, mimeType, size",
  });

  // Download content
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  return {
    stream: res.data as unknown as Readable,
    mimeType: meta.data.mimeType!,
    name: meta.data.name!,
    size: parseInt(meta.data.size || "0"),
  };
}

export async function getDriveFileBuffer(
  fileId: string
): Promise<{ buffer: Buffer; mimeType: string; name: string }> {
  const drive = google.drive({ version: "v3", auth: getAuth() });

  const meta = await drive.files.get({
    fileId,
    fields: "name, mimeType",
  });

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );

  return {
    buffer: Buffer.from(res.data as ArrayBuffer),
    mimeType: meta.data.mimeType!,
    name: meta.data.name!,
  };
}

export function getFileIcon(mimeType: string): string {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) return "IMG";
  if (mimeType.includes("spreadsheet") || mimeType.includes("xlsx")) return "XLS";
  if (mimeType.includes("document") || mimeType.includes("docx") || mimeType.includes("word")) return "DOC";
  if (mimeType.includes("presentation") || mimeType.includes("pptx")) return "PPT";
  return "FILE";
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}
