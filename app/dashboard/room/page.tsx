import { getAuth } from "@/lib/auth";
import { listRoomLinks, getAllRoomAnalytics, getRoomAnalytics } from "@/lib/room";
import { listDriveFolderTree, getFileIcon, formatFileSize, type DriveFile } from "@/lib/drive";
import { RoomManager } from "./room-manager";

export const dynamic = "force-dynamic";

const DRIVE_FOLDER_ID = "1GDls9NYWeAuk1y3UN4TyEhbgl7nFX-se";

export default async function RoomDashboardPage() {
  const auth = await getAuth();
  if (!auth) return null;

  let driveFiles: { id: string; name: string; icon: string; size: string; isFolder?: boolean; children?: any[]; depth?: number }[] = [];
  try {
    const tree = await listDriveFolderTree(DRIVE_FOLDER_ID);
    // Flatten with depth for the file picker UI
    function flatten(items: DriveFile[], depth: number) {
      for (const f of items) {
        driveFiles.push({
          id: f.id,
          name: f.name,
          icon: f.isFolder ? "DIR" : getFileIcon(f.mimeType),
          size: f.isFolder ? "" : formatFileSize(f.size),
          isFolder: f.isFolder,
          depth,
        });
        if (f.isFolder && f.children) flatten(f.children, depth + 1);
      }
    }
    flatten(tree, 0);
  } catch {}

  const [links, summaryAnalytics] = await Promise.all([
    listRoomLinks(),
    getAllRoomAnalytics(),
  ]);

  // Get detailed analytics for each active link
  const detailedAnalytics: Record<string, any> = {};
  for (const link of links as any[]) {
    if (link.is_active) {
      try {
        detailedAnalytics[link.id] = await getRoomAnalytics(link.id);
      } catch {}
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-['Spectral',Georgia,serif] text-3xl font-light">
        Data Room
      </h1>
      <RoomManager
        initialLinks={links as any[]}
        summaryAnalytics={summaryAnalytics}
        detailedAnalytics={detailedAnalytics}
        driveFiles={driveFiles}
      />
    </div>
  );
}
