import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { createRoomLink, listRoomLinks } from "@/lib/room";
import { getDataRoomFolderId } from "@/lib/data-room-config";
import { listDriveFolder } from "@/lib/drive";
import { snapshotRoomSelection } from "@/lib/room-selection";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await listRoomLinks();
  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { label, expiresInDays, allowedEmails, allowedFileIds, allowDownload } = await req.json();

  if (!label || !expiresInDays) {
    return NextResponse.json({ error: "label and expiresInDays required" }, { status: 400 });
  }

  const emails = allowedEmails?.length
    ? allowedEmails.map((e: string) => e.toLowerCase().trim()).filter((e: string) => e.includes("@"))
    : undefined;

  const folderId = getDataRoomFolderId();
  const available = await listDriveFolder(folderId);
  let selected: string[];
  try { selected = snapshotRoomSelection(available.map((f) => f.id), allowedFileIds, false); }
  catch {
    return NextResponse.json({ error: "Choose files from the current data room" }, { status: 400 });
  }

  const link = await createRoomLink({
    label,
    createdById: auth.sub,
    driveFolderId: folderId,
    expiresInDays,
    allowedEmails: emails,
    allowedFileIds: selected,
    allowDownload: allowDownload ?? true,
  });

  return NextResponse.json({ link });
}
