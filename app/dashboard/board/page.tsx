import { getAuth } from "@/lib/auth";
import { readPipeline } from "@/lib/sheets";
import { listRoomLinks, getAllRoomAnalytics } from "@/lib/room";
import { PipelineBoard } from "./pipeline-board";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const auth = await getAuth();
  if (!auth) return null;

  let data: { headers: string[]; rows: Record<string, string>[] };
  try {
    data = await readPipeline();
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

  // Get room links + analytics to compute engagement per investor
  let roomLinks: any[] = [];
  let roomAnalytics: Record<string, any> = {};
  try {
    [roomLinks, roomAnalytics] = await Promise.all([
      listRoomLinks(),
      getAllRoomAnalytics(),
    ]);
  } catch {}

  // Build engagement map: investor name → engagement data
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

    // Match by investor name in label
    for (const row of data.rows) {
      const name = (row["Name"] || "").toLowerCase();
      if (name && label.includes(name)) {
        const lastAct = stats?.last_activity;
        const isHot = lastAct && (Date.now() - new Date(lastAct).getTime()) < 24 * 60 * 60 * 1000;

        engagementMap[row["Name"]] = {
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

  return (
    <PipelineBoard
      headers={data.headers}
      initialRows={data.rows}
      engagement={engagementMap}
    />
  );
}
