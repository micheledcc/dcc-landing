import { NextRequest, NextResponse } from "next/server";
import { getAuth, hashPassword } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const auth = await getAuth();
  if (!auth || auth.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const result = await sql`
    SELECT id, email, name, COALESCE(role, 'member') as role, created_at
    FROM admins ORDER BY created_at ASC
  `;
  return NextResponse.json({ members: result.rows });
}

export async function POST(req: NextRequest) {
  const auth = await getAuth();
  if (!auth || auth.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { email, name, password } = await req.json();

  if (!email || !name || !password) {
    return NextResponse.json(
      { error: "email, name, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const hash = await hashPassword(password);

  try {
    const result = await sql`
      INSERT INTO admins (email, password_hash, name, role)
      VALUES (${email}, ${hash}, ${name}, 'member')
      RETURNING id, email, name, role, created_at
    `;
    return NextResponse.json({ member: result.rows[0] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
