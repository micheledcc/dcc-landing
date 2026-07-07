import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getShareLink } from "@/lib/share";
import { SignJWT } from "jose";

const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const link = await getShareLink(token);
  if (!link || !link.is_active || new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: "Link not found or expired" }, { status: 404 });
  }

  // Find the most recent unexpired, unverified code for this email + link
  const result = await sql`
    SELECT id, code, expires_at, attempts FROM email_codes
    WHERE share_link_id = ${link.id}
      AND email = ${normalizedEmail}
      AND verified = false
      AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const record = result.rows[0];
  if (!record) {
    return NextResponse.json(
      { error: "No valid code found. Please request a new one." },
      { status: 400 }
    );
  }

  // Check attempts (max 5)
  if (record.attempts >= 5) {
    return NextResponse.json(
      { error: "Too many attempts. Please request a new code." },
      { status: 429 }
    );
  }

  // Increment attempts
  await sql`UPDATE email_codes SET attempts = attempts + 1 WHERE id = ${record.id}`;

  // Verify code
  if (record.code !== code.trim()) {
    const remaining = 4 - record.attempts;
    return NextResponse.json(
      { error: `Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` },
      { status: 401 }
    );
  }

  // Mark as verified
  await sql`UPDATE email_codes SET verified = true WHERE id = ${record.id}`;

  // Issue a viewer JWT cookie (24 hours)
  const viewerToken = await new SignJWT({
    email: normalizedEmail,
    token,
    type: "viewer",
  } as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret());

  const res = NextResponse.json({ ok: true });
  res.cookies.set(`dcc_view_${token.substring(0, 16)}`, viewerToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/view/${token}`,
    maxAge: 60 * 60 * 24,
  });

  return res;
}
