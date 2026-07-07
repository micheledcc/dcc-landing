import { NextRequest, NextResponse } from "next/server";
import { setupDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await setupDatabase();
  return NextResponse.json({ ok: true });
}
