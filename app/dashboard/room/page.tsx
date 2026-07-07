import { getAuth } from "@/lib/auth";
import { listRoomLinks, getAllRoomAnalytics, getRoomAnalytics } from "@/lib/room";
import { listDriveFolder, getFileIcon, formatFileSize } from "@/lib/drive";
import { RoomManager } from "./room-manager";

export const dynamic = "force-dynamic";

const DRIVE_FOLDER_ID = "1GDls9NYWeAuk1y3UN4TyEhbgl7nFX-se";

export default async function RoomDashboardPage() {
  const auth = await getAuth();
  if (!auth) return null;

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
