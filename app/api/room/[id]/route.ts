import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { revokeRoomLink } from "@/lib/room";
import { sql } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { label } = await req.json();

  if (!label || !label.trim()) {
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  }

  await sql`UPDATE room_links SET label = ${label.trim()} WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const permanent = req.nextUrl.searchParams.get("permanent") === "1";

  if (permanent) {
    await sql`DELETE FROM room_events WHERE room_link_id = ${id}`;
    await sql`DELETE FROM email_codes WHERE room_link_id = ${id}`;
    await sql`DELETE FROM room_links WHERE id = ${id}`;
  } else {
    await revokeRoomLink(id);
  }

  return NextResponse.json({ ok: true });
}
