"use client";

import { useState } from "react";
import { ShareManager } from "@/app/dashboard/share/share-manager";
import { RoomManager } from "@/app/dashboard/room/room-manager";

export function SharingPage({
  shareLinks,
  roomLinks,
  pipelineHeaders,
  shareViewsSummary,
  roomSummaryAnalytics,
  roomDetailedAnalytics,
  driveFiles,
}: {
  shareLinks: any[];
  roomLinks: any[];
  pipelineHeaders: string[];
  shareViewsSummary: any;
  roomSummaryAnalytics: any;
  roomDetailedAnalytics: any;
  driveFiles: any[];
}) {
  const [tab, setTab] = useState<"pipeline" | "dataroom">("pipeline");

  return (
    <div>
      <h1 className="mb-2 font-['Spectral',Georgia,serif] text-3xl font-light">
        Sharing
      </h1>
      <p className="mb-6 text-[13px] text-[#5d6168]">
        Manage access links for the investor pipeline and data room.
      </p>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-black/10">
        <button
          onClick={() => setTab("pipeline")}
          className={`cursor-pointer border-b-2 bg-transparent px-4 py-2.5 font-['IBM_Plex_Mono',monospace] text-[12px] uppercase tracking-wider transition-colors ${
            tab === "pipeline"
              ? "border-[#17191c] text-[#17191c]"
              : "border-transparent text-[#5d6168] hover:text-[#3a3d42]"
          }`}
        >
          Pipeline Links ({shareLinks.length})
        </button>
        <button
          onClick={() => setTab("dataroom")}
          className={`cursor-pointer border-b-2 bg-transparent px-4 py-2.5 font-['IBM_Plex_Mono',monospace] text-[12px] uppercase tracking-wider transition-colors ${
            tab === "dataroom"
              ? "border-[#17191c] text-[#17191c]"
              : "border-transparent text-[#5d6168] hover:text-[#3a3d42]"
          }`}
        >
          Data Room Links ({roomLinks.length})
        </button>
      </div>

      {tab === "pipeline" && (
        <ShareManager
          initialLinks={shareLinks}
          availableFields={pipelineHeaders}
          viewsSummary={shareViewsSummary}
        />
      )}

      {tab === "dataroom" && (
        <RoomManager
          initialLinks={roomLinks}
          summaryAnalytics={roomSummaryAnalytics}
          detailedAnalytics={roomDetailedAnalytics}
          driveFiles={driveFiles}
        />
      )}
    </div>
  );
}
