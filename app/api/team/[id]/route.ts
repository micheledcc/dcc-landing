import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth || auth.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent deleting yourself
  if (id === auth.sub) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  await sql`DELETE FROM admins WHERE id = ${id} AND role != 'owner'`;
  return NextResponse.json({ ok: true });
}
