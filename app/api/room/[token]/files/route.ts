import { NextRequest, NextResponse } from "next/server";
import { getRoomLink } from "@/lib/room";
import { listDriveFolder } from "@/lib/drive";
import { isRoomActive, roomCookieName, roomViewer, stringList } from "@/lib/room-access";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const link = await getRoomLink(token);

  if (!isRoomActive(link)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await roomViewer(link, token, _req.cookies.get(roomCookieName(token))?.value)).allowed) {
    return NextResponse.json({ error: "Email verification required" }, { status: 401 });
  }

  try {
    const files = await listDriveFolder(link.drive_folder_id, stringList(link.allowed_file_ids));
    return NextResponse.json({ files }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Files unavailable" }, { status: 503 });
  }
}
