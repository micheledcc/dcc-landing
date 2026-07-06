import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { setupDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run full setup (creates tables + migrations)
  await setupDatabase();

  // Set Michele as owner
  await sql`UPDATE admins SET role = 'owner' WHERE email = 'michele@digitalcollateralcorporation.com'`;

  return NextResponse.json({ ok: true, message: "Migration complete" });
}
