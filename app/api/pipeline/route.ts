import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { readPipeline, appendRow } from "@/lib/sheets";

export async function GET() {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await readPipeline();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { row } = await req.json();
  await appendRow(row, auth.name);
  return NextResponse.json({ ok: true });
}
