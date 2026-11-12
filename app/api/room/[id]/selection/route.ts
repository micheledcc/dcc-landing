import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { listDriveFolderTree, getFileIcon, formatFileSize, type DriveFile } from "@/lib/drive";

// An existing link's editor must use that link's folder, even after the default changes.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const link = (await sql`SELECT drive_folder_id FROM room_links WHERE id = ${id}`).rows[0];
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const tree = await listDriveFolderTree(link.drive_folder_id);
    const files: { id: string; name: string; icon: string; size: string; isFolder: boolean; depth: number }[] = [];
    function flatten(items: DriveFile[], depth: number) {
      for (const f of items) {
        files.push({ id: f.id, name: f.name, icon: f.isFolder ? "DIR" : getFileIcon(f.mimeType), size: f.isFolder ? "" : formatFileSize(f.size), isFolder: f.isFolder, depth });
        if (f.children) flatten(f.children, depth + 1);
      }
    }
    flatten(tree, 0);
    return NextResponse.json({ files }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load this link's documents" }, { status: 503 });
  }
}
