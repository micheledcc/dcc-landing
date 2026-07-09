"use client";

import { useState, useCallback } from "react";

const STAGE_ORDER = [
  "1 - Outreach",
  "2 - Pitch",
  "3 - Internal IC",
  "4 - Final DD",
  "5 - Verbal Commit",
  "6 - Signed",
  "7 - Wired",
  "Advisor",
];

const STAGE_COLORS: Record<string, string> = {
  "1 - Outreach": "#b9b2a4",
  "2 - Pitch": "#a09484",
  "3 - Internal IC": "#8a6d40",
  "4 - Final DD": "#6d5530",
  "5 - Verbal Commit": "#3a7c5f",
  "6 - Signed": "#2d6a4f",
  "7 - Wired": "#1b4332",
  Advisor: "#5d6168",
  "0 - Passed": "#c44",
};

const TYPE_COLORS: Record<string, string> = {
  Angel: "#8a6d40",
  VC: "#17191c",
  Advisor: "#5d6168",
};

function parseCurrency(s: string): number {
  if (!s) return 0;
  return parseFloat(s.replace(/[$,]/g, "")) || 0;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  if (n === 0) return "$0";
  return `$${n.toLocaleString()}`;
}

interface Engagement {
  hasLink: boolean;
  linkToken?: string;
  views: number;
  downloads: number;
  lastActivity?: string;
  heat: "hot" | "warm" | "cold" | "none";
}

interface PipelineBoardProps {
  headers: string[];
  initialRows: Record<string, string>[];
  engagement: Record<string, Engagement>;
}

export function PipelineBoard({ headers, initialRows, engagement }: PipelineBoardProps) {
  const [rows, setRows] = useState(initialRows);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [editField, setEditField] = useState<{ idx: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [sharingIdx, setSharingIdx] = useState<number | null>(null);
  const [shareResult, setShareResult] = useState<string | null>(null);

  type CardRow = Record<string, string> & { _idx: number };

  // Group rows by stage
  const columns = STAGE_ORDER.map((stage) => ({
    stage,
    cards: rows
      .map((r, i) => ({ ...r, _idx: i } as CardRow))
      .filter((r) => r["Stage"] === stage),
  }));

  // Passed investors (separate)
  const passed = rows
    .map((r, i) => ({ ...r, _idx: i } as CardRow))
    .filter((r) => r["Stage"] === "0 - Passed");

  // Global stats
  const totalCommitted = rows.reduce((s, r) => s + parseCurrency(r["Amount ($)"]), 0);
  const totalWeighted = rows.reduce((s, r) => s + parseCurrency(r["Weighted ($)"]), 0);

  // Drag handlers
  const handleDragStart = useCallback((idx: number) => {
    setDraggedIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDropTarget(stage);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(async (stage: string) => {
    if (draggedIdx === null) return;
    setDropTarget(null);

    const row = rows[draggedIdx];
    if (row["Stage"] === stage) { setDraggedIdx(null); return; }

    // Optimistic update
    const newRows = [...rows];
    newRows[draggedIdx] = { ...row, Stage: stage };

    // Auto-set probability based on stage
    const probMap: Record<string, string> = {
      "1 - Outreach": "10%", "2 - Pitch": "25%", "3 - Internal IC": "40%",
      "4 - Final DD": "60%", "5 - Verbal Commit": "90%", "6 - Signed": "95%",
      "7 - Wired": "100%", "Advisor": "", "0 - Passed": "0%",
    };
    if (probMap[stage] !== undefined) {
      newRows[draggedIdx] = { ...newRows[draggedIdx], Prob: probMap[stage] };
    }

    setRows(newRows);
    setDraggedIdx(null);

    // Persist
    await fetch("/api/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rowIndex: draggedIdx,
        updates: { Stage: stage, ...(probMap[stage] !== undefined ? { Prob: probMap[stage] } : {}) },
      }),
    });
  }, [draggedIdx, rows]);

  // Inline edit
  async function handleSaveField(idx: number, field: string, value: string) {
    setSaving(true);
    const newRows = [...rows];
    newRows[idx] = { ...newRows[idx], [field]: value };
    setRows(newRows);
    setEditField(null);

    await fetch("/api/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowIndex: idx, updates: { [field]: value } }),
    });
    setSaving(false);
  }

  // One-click share
  async function handleShareRoom(idx: number) {
    setSharingIdx(idx);
    const row = rows[idx];
    const res = await fetch("/api/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: row["Name"],
        expiresInDays: 30,
      }),
    });
    if (res.ok) {
      const { link } = await res.json();
      const url = `${window.location.origin}/room/${link.token}`;
      navigator.clipboard.writeText(url);
      setShareResult(url);
      setTimeout(() => setShareResult(null), 5000);
    }
    setSharingIdx(null);
  }

  const editableFields = headers.filter((h) => !h.startsWith("_") && h !== "Weighted ($)");

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-['Spectral',Georgia,serif] text-3xl font-light">Pipeline Board</h1>
          <p className="mt-1 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#8a6d40]">
            {rows.length} investors &middot; {formatCurrency(totalCommitted)} committed &middot; {formatCurrency(totalWeighted)} weighted
          </p>
        </div>
        <a
          href="/dashboard"
          className="font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168] no-underline hover:text-[#17191c]"
        >
          &larr; Table view
        </a>
      </div>

      {/* Share result toast */}
      {shareResult && (
        <div className="mb-4 border border-emerald-300 bg-emerald-50 px-4 py-3 font-['IBM_Plex_Mono',monospace] text-[12px] text-emerald-800">
          Link copied to clipboard: <span className="font-medium">{shareResult}</span>
        </div>
      )}

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3" style={{ minWidth: `${STAGE_ORDER.length * 240}px` }}>
          {columns.map(({ stage, cards }) => {
            const colTotal = cards.reduce((s, c) => s + parseCurrency(c["Amount ($)"]), 0);
            const isDropping = dropTarget === stage;
            const color = STAGE_COLORS[stage] || "#5d6168";

            return (
              <div
                key={stage}
                className={`flex w-[240px] shrink-0 flex-col rounded-sm transition-colors ${
                  isDropping ? "bg-[#8a6d40]/10" : "bg-black/[0.03]"
                }`}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(stage)}
              >
                {/* Column header */}
                <div className="sticky top-0 z-10 px-3 pb-2 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-['IBM_Plex_Mono',monospace] text-[10px] font-medium uppercase tracking-wider text-[#3a3d42]">
                      {stage.replace(/^\d+ - /, "")}
                    </span>
                  </div>
                  <div className="mt-1 font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8a6d40]">
                    {cards.length} &middot; {formatCurrency(colTotal)}
                  </div>
                </div>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
                  {cards.map((card) => {
                    const eng = engagement[card["Name"]];
                    const isExpanded = expandedCard === card._idx;
                    const isStale = card["_modified_at"] && (Date.now() - new Date(card["_modified_at"]).getTime()) > 7 * 24 * 60 * 60 * 1000;

                    return (
                      <div
                        key={card._idx}
                        draggable
                        onDragStart={() => handleDragStart(card._idx)}
                        className={`cursor-grab border bg-white transition-shadow active:cursor-grabbing ${
                          draggedIdx === card._idx ? "border-[#8a6d40] opacity-50 shadow-lg" : "border-black/10 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {/* Card summary */}
                        <div
                          className="px-3 py-2.5"
                          onClick={() => setExpandedCard(isExpanded ? null : card._idx)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[13px] font-medium leading-tight text-[#17191c]">{card["Name"]}</span>
                            <div className="flex shrink-0 items-center gap-1">
                              {/* Engagement heat */}
                              {eng?.heat === "hot" && <span title="Active in last 24h" className="text-[12px]">🔥</span>}
                              {eng?.heat === "warm" && <span title="Has viewed data room" className="h-2 w-2 rounded-full bg-[#8a6d40]" />}
                              {eng?.heat === "cold" && <span title="Link sent, not viewed" className="h-2 w-2 rounded-full border border-[#b9b2a4]" />}
                              {/* Stale */}
                              {isStale && <span title="Not updated in 7+ days" className="h-2 w-2 rounded-full bg-amber-400" />}
                            </div>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span
                              className="border px-1.5 py-0.5 font-['IBM_Plex_Mono',monospace] text-[9px]"
                              style={{ borderColor: TYPE_COLORS[card["Type"]] || "#5d6168", color: TYPE_COLORS[card["Type"]] || "#5d6168" }}
                            >
                              {card["Type"]}
                            </span>
                            <span className="font-['IBM_Plex_Mono',monospace] text-[11px] tabular-nums text-[#3a3d42]">
                              {card["Amount ($)"] || "$0"}
                            </span>
                          </div>
                          {card["Next Action"] && (
                            <div className="mt-1.5 truncate font-['IBM_Plex_Mono',monospace] text-[10px] text-[#5d6168]">
                              → {card["Next Action"]}
                            </div>
                          )}
                          {eng?.hasLink && eng.views > 0 && (
                            <div className="mt-1 font-['IBM_Plex_Mono',monospace] text-[9px] text-[#8a6d40]">
                              {eng.views} view{eng.views !== 1 ? "s" : ""}
                              {eng.lastActivity && ` · ${new Date(eng.lastActivity).toLocaleDateString()}`}
                            </div>
                          )}
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="border-t border-black/8 px-3 py-3">
                            {/* Editable fields */}
                            <div className="space-y-2">
                              {editableFields.map((field) => {
                                const isEditing = editField?.idx === card._idx && editField?.field === field;
                                const val = card[field] || "";

                                return (
                                  <div key={field}>
                                    <label className="mb-0.5 block font-['IBM_Plex_Mono',monospace] text-[9px] uppercase tracking-wider text-[#8a6d40]">
                                      {field}
                                    </label>
                                    {isEditing ? (
                                      field === "Stage" ? (
                                        <select
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          onBlur={() => handleSaveField(card._idx, field, editValue)}
                                          autoFocus
                                          className="w-full border border-[#8a6d40] bg-white px-2 py-1 text-[12px] outline-none"
                                        >
                                          {[...STAGE_ORDER, "0 - Passed"].map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                          ))}
                                        </select>
                                      ) : field === "Type" ? (
                                        <select
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          onBlur={() => handleSaveField(card._idx, field, editValue)}
                                          autoFocus
                                          className="w-full border border-[#8a6d40] bg-white px-2 py-1 text-[12px] outline-none"
                                        >
                                          <option value="Angel">Angel</option>
                                          <option value="VC">VC</option>
                                          <option value="Advisor">Advisor</option>
                                        </select>
                                      ) : (
                                        <input
                                          type="text"
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          onBlur={() => handleSaveField(card._idx, field, editValue)}
                                          onKeyDown={(e) => { if (e.key === "Enter") handleSaveField(card._idx, field, editValue); if (e.key === "Escape") setEditField(null); }}
                                          autoFocus
                                          className="w-full border border-[#8a6d40] bg-white px-2 py-1 text-[12px] outline-none"
                                        />
                                      )
                                    ) : (
                                      <div
                                        className="min-h-[24px] cursor-pointer rounded-sm px-2 py-1 text-[12px] text-[#2c2f34] hover:bg-black/[0.03]"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditField({ idx: card._idx, field });
                                          setEditValue(val);
                                        }}
                                      >
                                        {field === "Profile / Notes" ? (
                                          <span className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-[#5d6168]">{val || "Click to add..."}</span>
                                        ) : (
                                          val || <span className="text-[#b9b2a4]">Click to edit</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Engagement detail */}
                            {eng?.hasLink && (
                              <div className="mt-3 border-t border-black/6 pt-2">
                                <div className="font-['IBM_Plex_Mono',monospace] text-[9px] uppercase tracking-wider text-[#8a6d40]">Engagement</div>
                                <div className="mt-1 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">
                                  {eng.views} views &middot; {eng.downloads} downloads
                                  {eng.lastActivity && ` · Last: ${new Date(eng.lastActivity).toLocaleDateString()}`}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleShareRoom(card._idx); }}
                                disabled={sharingIdx === card._idx}
                                className="cursor-pointer bg-[#17191c] px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[10px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34] disabled:opacity-50"
                              >
                                {sharingIdx === card._idx ? "Creating..." : eng?.hasLink ? "New room link" : "Share data room"}
                              </button>
                              {eng?.hasLink && eng.linkToken && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(`${window.location.origin}/room/${eng.linkToken}`);
                                    setShareResult(`Copied link for ${card["Name"]}`);
                                    setTimeout(() => setShareResult(null), 3000);
                                  }}
                                  className="cursor-pointer border border-black/15 bg-white px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[10px] text-[#3a3d42] hover:border-black/25"
                                >
                                  Copy existing link
                                </button>
                              )}
                            </div>

                            {saving && (
                              <div className="mt-2 font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8a6d40]">Saving...</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {cards.length === 0 && (
                    <div className="py-6 text-center font-['IBM_Plex_Mono',monospace] text-[10px] text-[#b9b2a4]">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Passed section */}
      {passed.length > 0 && (
        <div className="mt-4 border-t border-black/8 pt-4">
          <div className="mb-2 font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#c44]">
            Passed ({passed.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {passed.map((card) => (
              <div
                key={card._idx}
                draggable
                onDragStart={() => handleDragStart(card._idx)}
                className="cursor-grab border border-black/8 bg-white/60 px-3 py-1.5 text-[12px] text-[#5d6168] opacity-60"
              >
                {card["Name"]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
