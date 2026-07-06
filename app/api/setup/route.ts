import { NextRequest, NextResponse } from "next/server";
import { setupDatabase, sql } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// One-time setup endpoint. Delete this file after first use.
export async function POST(req: NextRequest) {
  const { secret, admins } = await req.json();

  // Require the JWT_SECRET as a simple auth gate
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create tables
  await setupDatabase();

  // Seed admins
  const results = [];
  for (const admin of admins) {
    const hash = await hashPassword(admin.password);
    await sql`
      INSERT INTO admins (email, password_hash, name)
      VALUES (${admin.email}, ${hash}, ${admin.name})
      ON CONFLICT (email) DO UPDATE SET
        password_hash = ${hash},
        name = ${admin.name}
    `;
    results.push(`Seeded: ${admin.email}`);
  }

  return NextResponse.json({ ok: true, results });
}
