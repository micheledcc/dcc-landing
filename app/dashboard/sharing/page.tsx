import { getAuth } from "@/lib/auth";
import { listShareLinks } from "@/lib/share";
import { listRoomLinks, getAllRoomAnalytics } from "@/lib/room";
import { readPipeline } from "@/lib/sheets";
import { getViewsSummary } from "@/lib/analytics";
import { SharingPage } from "./sharing-page";

export const dynamic = "force-dynamic";

export default async function Sharing() {
  const auth = await getAuth();
  if (!auth) return null;

  const [shareLinks, roomLinks, shareViewsSummary, roomAnalytics] = await Promise.all([
    listShareLinks(),
    listRoomLinks(),
    getViewsSummary(),
    getAllRoomAnalytics(),
  ]);

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
      roomAnalytics={roomAnalytics}
    />
  );
}
