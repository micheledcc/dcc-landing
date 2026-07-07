"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/app/components/data-table";

const STAGE_ORDER = [
  "1 - Outreach",
  "2 - Pitch",
  "3 - Internal IC",
  "4 - Final DD",
  "5 - Verbal Commit",
  "6 - Signed",
  "7 - Wired",
  "Advisor",
  "0 - Passed",
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
  return `$${n.toLocaleString()}`;
}

export function DashboardView({
  headers,
  rows: initialRows,
}: {
  headers: string[];
  rows: Record<string, string>[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const totalCommitted = rows.reduce(
      (sum, r) => sum + parseCurrency(r["Amount ($)"]),
      0
    );
    const weighted = rows.reduce(
      (sum, r) => sum + parseCurrency(r["Weighted ($)"]),
      0
    );
    const byStage: Record<string, { count: number; amount: number }> = {};
    const byType: Record<string, { count: number; amount: number }> = {};

    rows.forEach((r) => {
      const stage = r["Stage"] || "Unknown";
      const type = r["Type"] || "Unknown";
      const amt = parseCurrency(r["Amount ($)"]);

      if (!byStage[stage]) byStage[stage] = { count: 0, amount: 0 };
      byStage[stage].count++;
      byStage[stage].amount += amt;

      if (!byType[type]) byType[type] = { count: 0, amount: 0 };
      byType[type].count++;
      byType[type].amount += amt;
    });

    return { totalCommitted, weighted, byStage, byType };
  }, [rows]);

  const displayHeaders = headers.filter((h) => !h.startsWith("_"));

  async function handleAddRow() {
    setSaving(true);
    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row: newRow }),
    });
    if (res.ok) {
      setRows([...rows, { ...newRow }]);
      setNewRow({});
      setAdding(false);
    }
    setSaving(false);
  }

  const maxStageAmount = Math.max(
    ...Object.values(stats.byStage).map((s) => s.amount),
    1
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-['Spectral',Georgia,serif] text-3xl font-light">
            Investor Pipeline
          </h1>
          <p className="mt-1 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#8a6d40] uppercase tracking-wider">
            Master Commitments &middot; {rows.length} investors
          </p>
        </div>
        <a
          href="https://docs.google.com/spreadsheets/d/1HIqULY2hBQI8DhRDgNWQgH5pAPluJVsogkP5qbIC560/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-black/12 bg-white px-3 py-2 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#3a3d42] no-underline hover:border-black/25"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open in Google Sheets
        </a>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <SummaryCard
          label="Total Committed"
          value={formatCurrency(stats.totalCommitted)}
          sub={`${rows.length} investors`}
        />
        <SummaryCard
          label="Weighted Value"
          value={formatCurrency(stats.weighted)}
          sub="probability-adjusted"
        />
        <SummaryCard
          label="Verbal+"
          value={
            (stats.byStage["5 - Verbal Commit"]?.count || 0) +
            (stats.byStage["6 - Signed"]?.count || 0) +
            (stats.byStage["7 - Wired"]?.count || 0) +
            ""
          }
          sub="committed investors"
        />
        <SummaryCard
          label="In Pipeline"
          value={
            (stats.byStage["1 - Outreach"]?.count || 0) +
            (stats.byStage["2 - Pitch"]?.count || 0) +
            (stats.byStage["3 - Internal IC"]?.count || 0) +
            (stats.byStage["4 - Final DD"]?.count || 0) +
            ""
          }
          sub="active prospects"
        />
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* Stage Funnel */}
        <div className="border border-black/10 bg-white p-6">
          <h3 className="mb-4 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
            By Stage
          </h3>
          <div className="space-y-2.5">
            {STAGE_ORDER.filter((s) => stats.byStage[s]).map((stage) => {
              const d = stats.byStage[stage];
              const pct = (d.amount / maxStageAmount) * 100;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <div className="w-[120px] shrink-0 text-right font-['IBM_Plex_Mono',monospace] text-[11px] text-[#3a3d42]">
                    {stage}
                  </div>
                  <div className="relative h-6 flex-1 bg-[#f3efe7]">
                    <div
                      className="absolute inset-y-0 left-0 transition-all"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor:
                          STAGE_COLORS[stage] || "#8a6d40",
                      }}
                    />
                    <span className="relative z-10 flex h-full items-center px-2 font-['IBM_Plex_Mono',monospace] text-[10px] text-white mix-blend-difference">
                      {d.count} &middot; {formatCurrency(d.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="border border-black/10 bg-white p-6">
          <h3 className="mb-4 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
            By Type
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.byType)
              .sort((a, b) => b[1].amount - a[1].amount)
              .map(([type, d]) => {
                const pct =
                  stats.totalCommitted > 0
                    ? (d.amount / stats.totalCommitted) * 100
                    : 0;
                return (
                  <div key={type}>
                    <div className="mb-1 flex justify-between">
                      <span className="font-['IBM_Plex_Mono',monospace] text-[12px] text-[#3a3d42]">
                        {type}
                      </span>
                      <span className="font-['IBM_Plex_Mono',monospace] text-[12px] text-[#8a6d40]">
                        {d.count} &middot; {formatCurrency(d.amount)} &middot;{" "}
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-[#f3efe7]">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            TYPE_COLORS[type] || "#8a6d40",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Donut-like summary */}
          <div className="mt-6 flex items-center justify-center gap-6 border-t border-black/8 pt-5">
            {Object.entries(stats.byType)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([type, d]) => (
                <div key={type} className="text-center">
                  <div
                    className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full font-['IBM_Plex_Mono',monospace] text-[13px] font-medium text-white"
                    style={{
                      backgroundColor: TYPE_COLORS[type] || "#8a6d40",
                    }}
                  >
                    {d.count}
                  </div>
                  <div className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#5d6168]">
                    {type}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Table with add button */}
      <div className="mb-4 flex items-end justify-between">
        <div />
        <button
          onClick={() => setAdding(true)}
          className="cursor-pointer bg-[#17191c] px-4 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34]"
        >
          + Add investor
        </button>
      </div>

      {/* Data Table */}
      <DataTable headers={headers} rows={rows} />

      {/* Add investor form */}
      {adding && (
        <div className="mt-3 border border-[#8a6d40]/30 bg-[#8a6d40]/5 p-4">
          <div className="mb-3 grid grid-cols-3 gap-2 md:grid-cols-5">
            {displayHeaders.slice(0, 5).map((h) => (
              <div key={h}>
                <label className="mb-1 block font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#5d6168]">{h}</label>
                {h === "Type" ? (
                  <select value={newRow[h] || ""} onChange={(e) => setNewRow({ ...newRow, [h]: e.target.value })} className="w-full border border-black/15 bg-white px-2 py-1.5 text-sm outline-none">
                    <option value="">Select...</option>
                    <option value="Angel">Angel</option>
                    <option value="VC">VC</option>
                    <option value="Advisor">Advisor</option>
                  </select>
                ) : h === "Stage" ? (
                  <select value={newRow[h] || ""} onChange={(e) => setNewRow({ ...newRow, [h]: e.target.value })} className="w-full border border-black/15 bg-white px-2 py-1.5 text-sm outline-none">
                    <option value="">Select...</option>
                    {STAGE_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input type="text" value={newRow[h] || ""} onChange={(e) => setNewRow({ ...newRow, [h]: e.target.value })} placeholder={h} className="w-full border border-black/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-[#8a6d40]" />
                )}
              </div>
            ))}
          </div>
          {/* Remaining fields */}
          {displayHeaders.length > 5 && (
            <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              {displayHeaders.slice(5).filter(h => !h.startsWith("_")).map((h) => (
                <div key={h}>
                  <label className="mb-1 block font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#5d6168]">{h}</label>
                  <input type="text" value={newRow[h] || ""} onChange={(e) => setNewRow({ ...newRow, [h]: e.target.value })} placeholder={h} className="w-full border border-black/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-[#8a6d40]" />
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleAddRow} disabled={saving || !newRow["Name"]} className="cursor-pointer bg-[#17191c] px-5 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34] disabled:opacity-40">
              {saving ? "Saving..." : "Save to sheet"}
            </button>
            <button onClick={() => { setAdding(false); setNewRow({}); }} className="cursor-pointer border border-black/15 bg-white px-4 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#5d6168] hover:border-black/30">
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="border border-black/10 bg-white p-5">
      <div className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#8a6d40]">
        {label}
      </div>
      <div className="mt-2 font-['Spectral',Georgia,serif] text-[28px] font-light leading-none text-[#17191c]">
        {value}
      </div>
      <div className="mt-1 font-['IBM_Plex_Mono',monospace] text-[10px] text-[#5d6168]">
        {sub}
      </div>
    </div>
  );
}

