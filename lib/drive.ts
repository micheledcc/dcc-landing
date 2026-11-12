import { google } from "googleapis";
import { Readable } from "stream";
import { readDriveTree, flattenDriveTree, resolveDriveReference, type DriveTransport } from "./drive-reader";
export type { DriveFile } from "./drive-reader";

function getAuth() {
  const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret, GOOGLE_REFRESH_TOKEN: refreshToken } = process.env;
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Google OAuth credentials not set");
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

const fields = "id,name,mimeType,size,modifiedTime,trashed,shortcutDetails(targetId,targetMimeType,targetResourceKey)";
const resourceHeaders = (id: string, key?: string): Record<string, string> => key ? { "X-Goog-Drive-Resource-Keys": `${id}/${key}` } : {};

function driveAccess() {
  const drive = google.drive({ version: "v3", auth: getAuth() });
  const transport: DriveTransport = {
    async list(folderId, pageToken) {
      if (!/^[A-Za-z0-9_-]+$/.test(folderId)) throw new Error("Invalid folder ID");
      const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: `nextPageToken,files(${fields})`,
        pageSize: 1000, pageToken, orderBy: "folder,name", supportsAllDrives: true, includeItemsFromAllDrives: true,
      });
      return res.data;
    },
    async metadata(fileId, resourceKey) {
      return (await drive.files.get({ fileId, fields, supportsAllDrives: true },
        { headers: resourceHeaders(fileId, resourceKey) })).data;
    },
  };
  return { drive, transport };
}

export async function listDriveFolderTree(folderId: string, allowedFileIds?: string[] | null, pathPrefix?: string) {
  return readDriveTree(driveAccess().transport, folderId, allowedFileIds, pathPrefix);
}

export async function listDriveFolder(folderId: string, allowedFileIds?: string[] | null) {
  return flattenDriveTree(await listDriveFolderTree(folderId, allowedFileIds));
}

export async function getDriveFileStream(fileId: string): Promise<{ stream: Readable; mimeType: string; name: string; size: number }> {
  const { drive, transport } = driveAccess();
  const resolved = await resolveDriveReference(transport, await transport.metadata(fileId));
  const res = await drive.files.get({ fileId: resolved.contentId, alt: "media", supportsAllDrives: true },
    { responseType: "stream", headers: resourceHeaders(resolved.contentId, resolved.resourceKey) });
  return { stream: res.data as unknown as Readable, mimeType: resolved.file.mimeType, name: resolved.file.name, size: resolved.file.size };
}

// Callers must first verify the reference ID belongs to the gated room selection.
export async function getDriveFileBuffer(fileId: string): Promise<{ buffer: Buffer; mimeType: string; name: string }> {
  const { drive, transport } = driveAccess();
  const resolved = await resolveDriveReference(transport, await transport.metadata(fileId));
  const res = await drive.files.get({ fileId: resolved.contentId, alt: "media", supportsAllDrives: true },
    { responseType: "arraybuffer", headers: resourceHeaders(resolved.contentId, resolved.resourceKey) });
  return { buffer: Buffer.from(res.data as ArrayBuffer), mimeType: resolved.file.mimeType, name: resolved.file.name };
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
