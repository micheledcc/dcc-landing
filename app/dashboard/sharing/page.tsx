import { getAuth } from "@/lib/auth";
import { listShareLinks } from "@/lib/share";
import { listRoomLinks, getAllRoomAnalytics, getRoomAnalytics } from "@/lib/room";
import { listDriveFolder, getFileIcon, formatFileSize } from "@/lib/drive";
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
  let driveFiles: { id: string; name: string; icon: string; size: string }[] = [];
  try {
    const files = await listDriveFolder(DRIVE_FOLDER_ID);
    driveFiles = files.map((f) => ({
      id: f.id,
      name: f.name,
      icon: getFileIcon(f.mimeType),
      size: formatFileSize(f.size),
    }));
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
