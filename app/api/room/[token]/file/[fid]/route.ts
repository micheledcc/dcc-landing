import { NextRequest, NextResponse } from "next/server";
import { getRoomLink } from "@/lib/room";
import { getDriveFileBuffer, listDriveFolder } from "@/lib/drive";
import { roomCookieName, stringList } from "@/lib/room-access";
import { serveRoomFile } from "@/lib/room-file-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; fid: string }> }
) {
  const { token, fid } = await params;
  const link = await getRoomLink(token);
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    return await serveRoomFile({
      link, token, referenceId: fid,
      cookie: _req.cookies.get(roomCookieName(token))?.value,
      download: _req.nextUrl.searchParams.get("download") === "1",
    }, {
      list: () => listDriveFolder(link.drive_folder_id, stringList(link.allowed_file_ids)),
      read: getDriveFileBuffer,
    });
  } catch {
    // OAuth errors can contain credentials; never serialize/log the raw error.
    return NextResponse.json({ error: "File unavailable" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
