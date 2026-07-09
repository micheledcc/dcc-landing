import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { readPipeline, appendRow, updateRow } from "@/lib/sheets";

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

export async function PATCH(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rowIndex, updates } = await req.json();

  if (typeof rowIndex !== "number" || !updates || typeof updates !== "object") {
    return NextResponse.json({ error: "rowIndex and updates required" }, { status: 400 });
  }

  // Read current row, merge updates, write back
  const { rows } = await readPipeline();
  if (rowIndex < 0 || rowIndex >= rows.length) {
    return NextResponse.json({ error: "Invalid row index" }, { status: 400 });
  }

  const merged = { ...rows[rowIndex], ...updates };
  await updateRow(rowIndex, merged, auth.name);
  return NextResponse.json({ ok: true });
}
