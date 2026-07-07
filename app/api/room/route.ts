import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { createRoomLink, listRoomLinks } from "@/lib/room";

const DEFAULT_FOLDER_ID = "1GDls9NYWeAuk1y3UN4TyEhbgl7nFX-se";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await listRoomLinks();
  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { label, expiresInDays, allowedEmails } = await req.json();

  if (!label || !expiresInDays) {
    return NextResponse.json({ error: "label and expiresInDays required" }, { status: 400 });
  }

  const emails = allowedEmails?.length
    ? allowedEmails.map((e: string) => e.toLowerCase().trim()).filter((e: string) => e.includes("@"))
    : undefined;

  const link = await createRoomLink({
    label,
    createdById: auth.sub,
    driveFolderId: DEFAULT_FOLDER_ID,
    expiresInDays,
    allowedEmails: emails,
  });

  return NextResponse.json({ link });
}
