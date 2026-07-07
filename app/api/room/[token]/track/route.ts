import { NextRequest, NextResponse } from "next/server";
import { getRoomLink, logRoomEvent } from "@/lib/room";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const link = await getRoomLink(token);

  if (!link || !link.is_active) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { event, fileId, fileName, page, duration, email } = await req.json();

  if (!event || !fileId) {
    return NextResponse.json({ error: "event and fileId required" }, { status: 400 });
  }

  const validEvents = ["view_file", "view_page", "download"];
  if (!validEvents.includes(event)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  await logRoomEvent({
    roomLinkId: link.id,
    email: email || undefined,
    eventType: event,
    fileId,
    fileName,
    pageNumber: page,
    durationSeconds: duration,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  return NextResponse.json({ ok: true });
}
