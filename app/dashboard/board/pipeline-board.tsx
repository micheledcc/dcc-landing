"use client";

import { useState, useCallback } from "react";
import type { PipelineRow } from "@/lib/sheets";
import { ShareDialog } from "./share-dialog";

const STAGE_ORDER = [
  "1 - Outreach", "2 - Pitch", "3 - Internal IC", "4 - Final DD",
  "5 - Verbal Commit", "6 - Signed", "7 - Wired", "Advisor",
];

const STAGE_COLORS: Record<string, string> = {
  "1 - Outreach": "#b9b2a4", "2 - Pitch": "#a09484", "3 - Internal IC": "#8a6d40",
  "4 - Final DD": "#6d5530", "5 - Verbal Commit": "#3a7c5f", "6 - Signed": "#2d6a4f",
  "7 - Wired": "#1b4332", Advisor: "#5d6168", "0 - Passed": "#c44",
};

const SOURCE_BORDER: Record<string, string> = {
  commitments: "#8a6d40",
  "angels-pipeline": "#7c3aed",
  "vc-pipeline": "#17191c",
};

const SOURCE_LABEL: Record<string, string> = {
  commitments: "MC",
  "angels-pipeline": "AP",
  "vc-pipeline": "VP",
};

const PROB_MAP: Record<string, string> = {
  "1 - Outreach": "10%", "2 - Pitch": "25%", "3 - Internal IC": "40%",
  "4 - Final DD": "60%", "5 - Verbal Commit": "90%", "6 - Signed": "95%",
  "7 - Wired": "100%", Advisor: "", "0 - Passed": "0%",
};

function parseCurrency(s: string): number {
  return parseFloat((s || "").replace(/[$,]/g, "")) || 0;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return n === 0 ? "$0" : `$${n.toLocaleString()}`;
}

interface Engagement {
  hasLink: boolean; linkToken?: string; views: number; downloads: number;
  lastActivity?: string; heat: "hot" | "warm" | "cold" | "none";
}

interface DriveFile {
  id: string; name: string; icon: string; size: string; isFolder?: boolean; depth?: number;
}

export function PipelineBoard({
  allRows,
  engagement,
  driveFiles,
}: {
  allRows: PipelineRow[];
  engagement: Record<string, Engagement>;
  driveFiles: DriveFile[];
}) {
  const [rows, setRows] = useState(allRows);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editField, setEditField] = useState<{ key: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [shareTarget, setShareTarget] = useState<PipelineRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Unique key for each row
  const rowKey = (r: PipelineRow) => `${r.source}:${r.sourceRowIndex}`;

  // Group by stage
  const columns = STAGE_ORDER.map((stage) => ({
    stage,
    cards: rows.filter((r) => r.stage === stage),
  }));

  const passed = rows.filter((r) => r.stage === "0 - Passed");
  const totalAmount = rows.reduce((s, r) => s + parseCurrency(r.amount), 0);
  const totalWeighted = rows.reduce((s, r) => s + parseCurrency(r.weighted), 0);

  // Drag handlers
  const handleDragStart = useCallback((key: string) => setDraggedKey(key), []);
  const handleDragOver = useCallback((e: React.DragEvent, stage: string) => { e.preventDefault(); setDropTarget(stage); }, []);
  const handleDragLeave = useCallback(() => setDropTarget(null), []);

  const handleDrop = useCallback(async (stage: string) => {
    if (!draggedKey) return;
    setDropTarget(null);
    const idx = rows.findIndex((r) => rowKey(r) === draggedKey);
    if (idx === -1) return;
    const row = rows[idx];
    if (row.stage === stage) { setDraggedKey(null); return; }

    // Optimistic update
    const newRows = [...rows];
    newRows[idx] = { ...row, stage, prob: PROB_MAP[stage] ?? row.prob };
    setRows(newRows);
    setDraggedKey(null);

    // Persist to correct sheet tab
    const updates: Record<string, string> = { Stage: stage };
    if (PROB_MAP[stage] !== undefined) updates["Prob"] = PROB_MAP[stage];

    await fetch("/api/pipeline/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceTab: row.sourceTab, rowIndex: row.sourceRowIndex, updates }),
    });
  }, [draggedKey, rows]);

  // Inline edit
  async function handleSaveField(row: PipelineRow, field: string, value: string) {
    setSaving(true);
    const idx = rows.findIndex((r) => rowKey(r) === rowKey(row));
    if (idx >= 0) {
      const newRows = [...rows];
      (newRows[idx] as any)[field] = value;
      setRows(newRows);
    }
    setEditField(null);

    // Map normalized field name to sheet column
    const fieldMap: Record<string, string> = {
      name: row.source === "vc-pipeline" ? "Fund" : "Name",
      amount: row.source === "commitments" ? "Amount ($)" : "Target ($)",
      stage: "Stage", prob: "Prob", nextAction: "Next Action",
      owner: "Owner", notes: row.source === "commitments" ? "Profile / Notes" : "Notes",
      email: "Email", type: "Type",
    };

    await fetch("/api/pipeline/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceTab: row.sourceTab,
        rowIndex: row.sourceRowIndex,
        updates: { [fieldMap[field] || field]: value },
      }),
    });
    setSaving(false);
  }

  const editableFields: { key: keyof PipelineRow; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "amount", label: "Amount" },
    { key: "stage", label: "Stage" },
    { key: "prob", label: "Probability" },
    { key: "nextAction", label: "Next Action" },
    { key: "owner", label: "Owner" },
    { key: "email", label: "Email" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-['Spectral',Georgia,serif] text-3xl font-light">Pipeline Board</h1>
          <p className="mt-1 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#8a6d40]">
            {rows.length} investors · {formatCurrency(totalAmount)} total · {formatCurrency(totalWeighted)} weighted
          </p>
        </div>
        <a href="/dashboard" className="font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168] no-underline hover:text-[#17191c]">
          ← Table view
        </a>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 border border-emerald-300 bg-emerald-50 px-4 py-3 font-['IBM_Plex_Mono',monospace] text-[12px] text-emerald-800">
          {toast}
        </div>
      )}

      {/* Share Dialog */}
      {shareTarget && (
        <ShareDialog
          investorName={shareTarget.name}
          investorEmail={shareTarget.email}
          driveFiles={driveFiles}
          onClose={() => setShareTarget(null)}
          onCreated={(url) => {
            setShareTarget(null);
            setToast(`Link copied: ${url}`);
            setTimeout(() => setToast(null), 5000);
          }}
        />
      )}

      {/* Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-2.5" style={{ minWidth: `${STAGE_ORDER.length * 230}px` }}>
          {columns.map(({ stage, cards }) => {
            const colTotal = cards.reduce((s, c) => s + parseCurrency(c.amount), 0);
            const isDropping = dropTarget === stage;
            const color = STAGE_COLORS[stage] || "#5d6168";

            return (
              <div
                key={stage}
                className={`flex w-[230px] shrink-0 flex-col transition-colors ${isDropping ? "bg-[#8a6d40]/10" : "bg-black/[0.03]"}`}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(stage)}
              >
                {/* Column header */}
                <div className="px-2.5 pb-1.5 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-['IBM_Plex_Mono',monospace] text-[9px] font-medium uppercase tracking-wider text-[#3a3d42]">
                      {stage.replace(/^\d+ - /, "")}
                    </span>
                  </div>
                  <div className="mt-0.5 font-['IBM_Plex_Mono',monospace] text-[9px] text-[#8a6d40]">
                    {cards.length} · {formatCurrency(colTotal)}
                  </div>
                </div>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-1.5 px-1.5 pb-2">
                  {cards.map((card) => {
                    const key = rowKey(card);
                    const eng = engagement[card.name];
                    const isExpanded = expandedCard === key;
                    const borderColor = SOURCE_BORDER[card.source] || "#5d6168";

                    return (
                      <div
                        key={key}
                        draggable
                        onDragStart={() => handleDragStart(key)}
                        className={`cursor-grab border-l-[3px] border bg-white transition-shadow active:cursor-grabbing ${
                          draggedKey === key ? "opacity-50 shadow-lg" : "shadow-sm hover:shadow-md"
                        }`}
                        style={{ borderLeftColor: borderColor, borderTopColor: "rgba(0,0,0,0.08)", borderRightColor: "rgba(0,0,0,0.08)", borderBottomColor: "rgba(0,0,0,0.08)" }}
                      >
                        {/* Card face */}
                        <div className="px-2.5 py-2" onClick={() => setExpandedCard(isExpanded ? null : key)}>
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-[12px] font-medium leading-tight">{card.name}</span>
                            <div className="flex shrink-0 items-center gap-1">
                              {eng?.heat === "hot" && <span title="Active <24h">🔥</span>}
                              {eng?.heat === "warm" && <span title="Has viewed" className="h-1.5 w-1.5 rounded-full bg-[#8a6d40]" />}
                              {eng?.heat === "cold" && <span title="Not viewed" className="h-1.5 w-1.5 rounded-full border border-[#b9b2a4]" />}
                              <span className="font-['IBM_Plex_Mono',monospace] text-[8px] text-[#b9b2a4]" title={card.source}>{SOURCE_LABEL[card.source]}</span>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="border px-1 py-px font-['IBM_Plex_Mono',monospace] text-[8px]" style={{ borderColor: card.type === "VC" ? "#17191c" : card.type === "Angel" ? "#8a6d40" : "#5d6168", color: card.type === "VC" ? "#17191c" : card.type === "Angel" ? "#8a6d40" : "#5d6168" }}>
                              {card.type}
                            </span>
                            <span className="font-['IBM_Plex_Mono',monospace] text-[10px] tabular-nums text-[#3a3d42]">{card.amount || "$0"}</span>
                          </div>
                          {card.nextAction && (
                            <div className="mt-1 truncate font-['IBM_Plex_Mono',monospace] text-[9px] text-[#5d6168]">→ {card.nextAction}</div>
                          )}
                          {eng?.views ? (
                            <div className="mt-0.5 font-['IBM_Plex_Mono',monospace] text-[8px] text-[#8a6d40]">
                              {eng.views} view{eng.views !== 1 ? "s" : ""}{eng.lastActivity && ` · ${new Date(eng.lastActivity).toLocaleDateString()}`}
                            </div>
                          ) : null}
                        </div>

                        {/* Expanded */}
                        {isExpanded && (
                          <div className="border-t border-black/8 px-2.5 py-2.5">
                            <div className="space-y-1.5">
                              {editableFields.map(({ key: fk, label }) => {
                                const isEditing = editField?.key === key && editField?.field === fk;
                                const val = String(card[fk] || "");
                                return (
                                  <div key={fk}>
                                    <label className="mb-px block font-['IBM_Plex_Mono',monospace] text-[8px] uppercase tracking-wider text-[#8a6d40]">{label}</label>
                                    {isEditing ? (
                                      fk === "stage" ? (
                                        <select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleSaveField(card, fk, editValue)} autoFocus className="w-full border border-[#8a6d40] px-1.5 py-1 text-[11px] outline-none">
                                          {[...STAGE_ORDER, "0 - Passed"].map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                      ) : fk === "type" ? (
                                        <select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleSaveField(card, fk, editValue)} autoFocus className="w-full border border-[#8a6d40] px-1.5 py-1 text-[11px] outline-none">
                                          <option value="Angel">Angel</option><option value="VC">VC</option><option value="Advisor">Advisor</option>
                                        </select>
                                      ) : (
                                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleSaveField(card, fk, editValue)} onKeyDown={(e) => { if (e.key === "Enter") handleSaveField(card, fk, editValue); if (e.key === "Escape") setEditField(null); }} autoFocus className="w-full border border-[#8a6d40] px-1.5 py-1 text-[11px] outline-none" />
                                      )
                                    ) : (
                                      <div className="min-h-[22px] cursor-pointer px-1.5 py-1 text-[11px] text-[#2c2f34] hover:bg-black/[0.02]" onClick={(e) => { e.stopPropagation(); setEditField({ key, field: fk }); setEditValue(val); }}>
                                        {fk === "notes" ? <span className="whitespace-pre-wrap break-words text-[10px] leading-relaxed text-[#5d6168]">{val || "Click to add..."}</span> : val || <span className="text-[#b9b2a4]">—</span>}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {eng?.hasLink && (
                              <div className="mt-2 border-t border-black/6 pt-1.5 font-['IBM_Plex_Mono',monospace] text-[9px] text-[#5d6168]">
                                {eng.views} views · {eng.downloads} downloads{eng.lastActivity && ` · Last: ${new Date(eng.lastActivity).toLocaleDateString()}`}
                              </div>
                            )}

                            <div className="mt-2.5 flex gap-1.5">
                              <button onClick={(e) => { e.stopPropagation(); setShareTarget(card); }} className="cursor-pointer bg-[#17191c] px-2.5 py-1 font-['IBM_Plex_Mono',monospace] text-[9px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34]">
                                {eng?.hasLink ? "New link" : "Share data room"}
                              </button>
                              {eng?.linkToken && (
                                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/room/${eng.linkToken}`); setToast("Copied!"); setTimeout(() => setToast(null), 2000); }} className="cursor-pointer border border-black/15 bg-white px-2.5 py-1 font-['IBM_Plex_Mono',monospace] text-[9px] text-[#3a3d42] hover:border-black/25">
                                  Copy link
                                </button>
                              )}
                            </div>
                            {saving && <div className="mt-1 font-['IBM_Plex_Mono',monospace] text-[9px] text-[#8a6d40]">Saving...</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {cards.length === 0 && <div className="py-4 text-center font-['IBM_Plex_Mono',monospace] text-[9px] text-[#b9b2a4]">Drop here</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Passed */}
      {passed.length > 0 && (
        <div className="mt-3 border-t border-black/8 pt-3">
          <div className="mb-1.5 font-['IBM_Plex_Mono',monospace] text-[9px] uppercase tracking-wider text-[#c44]">Passed ({passed.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {passed.map((c) => (
              <div key={rowKey(c)} draggable onDragStart={() => handleDragStart(rowKey(c))} className="cursor-grab border border-black/8 bg-white/60 px-2.5 py-1 text-[11px] text-[#5d6168] opacity-60">
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
