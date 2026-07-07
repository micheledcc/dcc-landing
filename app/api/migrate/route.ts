import { NextRequest, NextResponse } from "next/server";
import { setupDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await setupDatabase();

  // Debug: check what token scopes we have
  const { google } = await import("googleapis");
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  try {
    const drive = google.drive({ version: "v3", auth: oauth2 });
    const res = await drive.files.list({
      q: "'1GDls9NYWeAuk1y3UN4TyEhbgl7nFX-se' in parents and trashed = false",
      fields: "files(id, name)",
      pageSize: 3,
    });
    return NextResponse.json({
      ok: true,
      driveWorks: true,
      files: res.data.files?.map(f => f.name),
      tokenPrefix: process.env.GOOGLE_REFRESH_TOKEN?.substring(0, 20)
    });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      driveWorks: false,
      error: e instanceof Error ? e.message : "unknown",
      tokenPrefix: process.env.GOOGLE_REFRESH_TOKEN?.substring(0, 20)
    });
  }
}
