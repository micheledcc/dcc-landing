import { getAuth } from "@/lib/auth";
import { readAllPipeline } from "@/lib/sheets";
import { listRoomLinks, getAllRoomAnalytics } from "@/lib/room";
import { listDriveFolderTree, getFileIcon, formatFileSize, type DriveFile } from "@/lib/drive";
import { PipelineBoard } from "./pipeline-board";

export const dynamic = "force-dynamic";

const DRIVE_FOLDER_ID = "1GDls9NYWeAuk1y3UN4TyEhbgl7nFX-se";

export default async function BoardPage() {
  const auth = await getAuth();
  if (!auth) return null;

  let allRows: Awaited<ReturnType<typeof readAllPipeline>> = [];
  try {
    allRows = await readAllPipeline();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return (
      <div>
        <h1 className="mb-4 font-['Spectral',Georgia,serif] text-3xl font-light">Pipeline Board</h1>
        <div className="border border-red-300 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-medium">Could not load pipeline data</p>
          <p className="mt-1 text-red-600">{msg}</p>
        </div>
      </div>
    );
  }

  // Room links + analytics for engagement signals
  let roomLinks: any[] = [];
  let roomAnalytics: Record<string, any> = {};
  try {
    [roomLinks, roomAnalytics] = await Promise.all([
      listRoomLinks(),
      getAllRoomAnalytics(),
    ]);
  } catch {}

  // Build engagement map
  const engagementMap: Record<string, {
    hasLink: boolean;
    linkToken?: string;
    views: number;
    downloads: number;
    lastActivity?: string;
    heat: "hot" | "warm" | "cold" | "none";
  }> = {};

  for (const link of roomLinks) {
    if (!link.is_active) continue;
    const stats = roomAnalytics[link.id];
    const label = (link.label || "").toLowerCase();

    for (const row of allRows) {
      const name = row.name.toLowerCase();
      if (name && label.includes(name)) {
        const lastAct = stats?.last_activity;
        const isHot = lastAct && (Date.now() - new Date(lastAct).getTime()) < 24 * 60 * 60 * 1000;
        engagementMap[row.name] = {
          hasLink: true,
          linkToken: link.token,
          views: stats?.views || 0,
          downloads: stats?.downloads || 0,
          lastActivity: lastAct || undefined,
          heat: stats?.views > 0 ? (isHot ? "hot" : "warm") : "cold",
        };
      }
    }
  }

  // Drive files for share dialog
  let driveFiles: { id: string; name: string; icon: string; size: string; isFolder?: boolean; depth?: number }[] = [];
  try {
    const tree = await listDriveFolderTree(DRIVE_FOLDER_ID);
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

  return (
    <PipelineBoard
      allRows={allRows}
      engagement={engagementMap}
      driveFiles={driveFiles}
    />
  );
}
