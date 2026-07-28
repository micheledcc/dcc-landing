import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { revokeShareLink } from "@/lib/share";
import { sql } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { extend_days } = await req.json();

  if (extend_days) {
    const days = parseInt(extend_days);
    if (days > 0) {
      await sql`UPDATE share_links SET expires_at = GREATEST(expires_at, now()) + make_interval(days => ${days}) WHERE id = ${id}`;
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const permanent = req.nextUrl.searchParams.get("permanent") === "1";

  if (permanent) {
    await sql`DELETE FROM email_codes WHERE share_link_id = ${id}`;
    await sql`DELETE FROM share_link_views WHERE share_link_id = ${id}`;
    await sql`DELETE FROM share_links WHERE id = ${id}`;
  } else {
    await revokeShareLink(id);
  }

  return NextResponse.json({ ok: true });
}
