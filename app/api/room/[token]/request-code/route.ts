import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getRoomLink } from "@/lib/room";
import { generateCode } from "@/lib/share";
import { sendVerificationCode } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const normalizedEmail = email.toLowerCase().trim();
  const link = await getRoomLink(token);

  if (!link || !link.is_active || new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: "Link not found or expired" }, { status: 404 });
  }

  const allowedEmails: string[] | null =
    typeof link.allowed_emails === "string" ? JSON.parse(link.allowed_emails) : link.allowed_emails;

  if (!allowedEmails || !allowedEmails.includes(normalizedEmail)) {
    return NextResponse.json({ error: "This link is not available for this email address." }, { status: 403 });
  }

  // Rate limit
  const recent = await sql`
    SELECT COUNT(*)::int as count FROM email_codes
    WHERE room_link_id = ${link.id} AND email = ${normalizedEmail} AND created_at > now() - interval '1 hour'
  `;
  if (recent.rows[0].count >= 3) {
    return NextResponse.json({ error: "Too many code requests. Please try again later." }, { status: 429 });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await sql`
    INSERT INTO email_codes (room_link_id, email, code, expires_at)
    VALUES (${link.id}, ${normalizedEmail}, ${code}, ${expiresAt.toISOString()})
  `;

  try {
    await sendVerificationCode(normalizedEmail, code, link.label);
  } catch (e) {
    console.error("Failed to send email:", e);
    return NextResponse.json({ error: "Failed to send verification email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
