import { NextRequest, NextResponse } from "next/server";
import { getRoomLink } from "@/lib/room";
import { listDriveFolder } from "@/lib/drive";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const link = await getRoomLink(token);

  if (!link || !link.is_active || new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allowedFileIds =
    typeof link.allowed_file_ids === "string"
      ? JSON.parse(link.allowed_file_ids)
      : link.allowed_file_ids;

  const files = await listDriveFolder(link.drive_folder_id, allowedFileIds);
  return NextResponse.json({ files });
}
