import { canServeRoomFile, isRoomActive, roomViewer, type RoomAccess } from "./room-access";
import type { DriveFile } from "./drive-reader";

export async function serveRoomFile(
  request: { link: RoomAccess | null; token: string; referenceId: string; cookie?: string; download: boolean },
  files: { list(): Promise<DriveFile[]>; read(id: string): Promise<{ buffer: Buffer; mimeType: string; name: string }> }
): Promise<Response> {
  const deny = (error: string, status: number) => Response.json({ error }, { status, headers: { "Cache-Control": "private, no-store" } });
  if (!isRoomActive(request.link)) return deny("Not found", 404);
  if (!(await roomViewer(request.link, request.token, request.cookie)).allowed) return deny("Email verification required", 401);
  const file = (await files.list()).find((f) => f.id === request.referenceId && !f.isFolder);
  if (!file) return deny("File not found", 404);
  if (!canServeRoomFile(request.link, file.mimeType, request.download)) return deny("Downloads are disabled for this link", 403);
  const { buffer, mimeType, name } = await files.read(file.id);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mimeType,
      "Content-Length": buffer.length.toString(),
      "Content-Disposition": request.download ? `attachment; filename*=UTF-8''${encodeURIComponent(name)}` : "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
