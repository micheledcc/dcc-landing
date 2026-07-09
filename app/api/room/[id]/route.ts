import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { revokeRoomLink } from "@/lib/room";
import { sql } from "@/lib/db";

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
