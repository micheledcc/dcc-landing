import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }

  const result = await sql`
    SELECT id, email, password_hash, name FROM admins WHERE email = ${email}
  `;

  const admin = result.rows[0];
  if (!admin) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = await signToken({
    sub: admin.id,
    email: admin.email,
    name: admin.name,
  });

  const res = NextResponse.json({ ok: true });
  setAuthCookie(res, token);
  return res;
}
