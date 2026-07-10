import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { updateSourceRow } from "@/lib/sheets";

// Update a row in any pipeline source tab
export async function POST(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sourceTab, rowIndex, updates } = await req.json();

  const validTabs = ["Master - Commitments", "Angels - Pipeline", "VC - Pipeline"];
  if (!validTabs.includes(sourceTab)) {
    return NextResponse.json({ error: "Invalid source tab" }, { status: 400 });
  }

  if (typeof rowIndex !== "number" || !updates) {
    return NextResponse.json({ error: "rowIndex and updates required" }, { status: 400 });
  }

  await updateSourceRow(sourceTab, rowIndex, updates, auth.name);
  return NextResponse.json({ ok: true });
}
