import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { createShareLink, listShareLinks } from "@/lib/share";

export async function GET() {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await listShareLinks();
  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { label, expiresInDays, visibleFields } = await req.json();

  if (!label || !expiresInDays || !visibleFields?.length) {
    return NextResponse.json(
      { error: "label, expiresInDays, and visibleFields are required" },
      { status: 400 }
    );
  }

  const link = await createShareLink({
    label,
    createdById: auth.sub,
    expiresInDays,
    visibleFields,
  });

  return NextResponse.json({ link });
}
