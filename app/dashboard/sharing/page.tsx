import { getAuth } from "@/lib/auth";
import { listShareLinks } from "@/lib/share";
import { listRoomLinks, getAllRoomAnalytics, getRoomAnalytics } from "@/lib/room";
import { listDriveFolderTree, getFileIcon, formatFileSize, type DriveFile } from "@/lib/drive";
import { readPipeline } from "@/lib/sheets";
import { getViewsSummary } from "@/lib/analytics";
import { SharingPage } from "./sharing-page";

export const dynamic = "force-dynamic";

const DRIVE_FOLDER_ID = "1GDls9NYWeAuk1y3UN4TyEhbgl7nFX-se";

export default async function Sharing() {
  const auth = await getAuth();
  if (!auth) return null;

  const [shareLinks, roomLinks, shareViewsSummary, roomSummary] = await Promise.all([
    listShareLinks(),
    listRoomLinks(),
    getViewsSummary(),
    getAllRoomAnalytics(),
  ]);

  // Drive files for room manager
  let driveFiles: { id: string; name: string; icon: string; size: string; isFolder?: boolean; depth?: number }[] = [];
  try {
    const tree = await listDriveFolderTree(DRIVE_FOLDER_ID);
    function flatten(items: DriveFile[], depth: number) {
      for (const f of items) {
        driveFiles.push({ id: f.id, name: f.name, icon: f.isFolder ? "DIR" : getFileIcon(f.mimeType), size: f.isFolder ? "" : formatFileSize(f.size), isFolder: f.isFolder, depth });
        if (f.isFolder && f.children) flatten(f.children, depth + 1);
      }
    }
    flatten(tree, 0);
  } catch {}

  // Detailed analytics for active room links
  const roomDetailed: Record<string, any> = {};
  for (const link of roomLinks as any[]) {
    if (link.is_active) {
      try { roomDetailed[link.id] = await getRoomAnalytics(link.id); } catch {}
    }
  }

  let pipelineHeaders: string[] = [];
  try {
    const data = await readPipeline();
    pipelineHeaders = data.headers.filter((h) => !h.startsWith("_"));
  } catch {}

  return (
    <SharingPage
      shareLinks={shareLinks as any[]}
      roomLinks={roomLinks as any[]}
      pipelineHeaders={pipelineHeaders}
      shareViewsSummary={shareViewsSummary}
      roomSummaryAnalytics={roomSummary}
      roomDetailedAnalytics={roomDetailed}
      driveFiles={driveFiles}
    />
  );
}
