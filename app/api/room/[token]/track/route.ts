import { NextRequest, NextResponse } from "next/server";
import { getRoomLink, logRoomEvent } from "@/lib/room";
import { isRoomActive, roomCookieName, roomViewer, stringList } from "@/lib/room-access";
import { listDriveFolder } from "@/lib/drive";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const link = await getRoomLink(token);

  if (!isRoomActive(link)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const viewer = await roomViewer(link, token, req.cookies.get(roomCookieName(token))?.value);
  if (!viewer.allowed) return NextResponse.json({ error: "Email verification required" }, { status: 401 });
  const { event, fileId, page, duration } = await req.json();

  if (!event || !fileId) {
    return NextResponse.json({ error: "event and fileId required" }, { status: 400 });
  }

  const validEvents = ["view_file", "view_page", "download"];
  if (!validEvents.includes(event)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const files = await listDriveFolder(link.drive_folder_id, stringList(link.allowed_file_ids));
  const file = files.find((f) => f.id === fileId);
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
  if (event === "download" && link.allow_download === false) return NextResponse.json({ error: "Downloads disabled" }, { status: 403 });

  await logRoomEvent({
    roomLinkId: link.id,
    email: viewer.email,
    eventType: event,
    fileId,
    fileName: file.name,
    pageNumber: page,
    durationSeconds: duration,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  return NextResponse.json({ ok: true });
}
