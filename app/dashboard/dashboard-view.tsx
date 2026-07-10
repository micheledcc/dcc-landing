"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/app/components/data-table";
import type { PipelineRow } from "@/lib/sheets";

const STAGE_COLORS: Record<string, string> = {
  "1 - Outreach": "#b9b2a4", "2 - Pitch": "#a09484", "3 - Internal IC": "#8a6d40",
  "4 - Final DD": "#6d5530", "5 - Verbal Commit": "#3a7c5f", "6 - Signed": "#2d6a4f",
  "7 - Wired": "#1b4332", Advisor: "#5d6168", "0 - Passed": "#c44",
};

const STAGE_ORDER = [
  "1 - Outreach", "2 - Pitch", "3 - Internal IC", "4 - Final DD",
  "5 - Verbal Commit", "6 - Signed", "7 - Wired", "Advisor",
];

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  commitments: { label: "MC", color: "#8a6d40" },
  "angels-pipeline": { label: "AP", color: "#7c3aed" },
  "vc-pipeline": { label: "VP", color: "#17191c" },
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

export function DashboardView({
  allRows,
  commitmentHeaders,
}: {
  allRows: PipelineRow[];
  commitmentHeaders: string[];
}) {
  const [tab, setTab] = useState<"all" | "pipeline" | "commitments">("all");

  const filtered = useMemo(() => {
    if (tab === "all") return allRows;
    if (tab === "pipeline") return allRows.filter((r) => r.source !== "commitments");
    return allRows.filter((r) => r.source === "commitments");
  }, [allRows, tab]);

  const stats = useMemo(() => {
    const totalAmount = filtered.reduce((s, r) => s + parseCurrency(r.amount), 0);
    const totalWeighted = filtered.reduce((s, r) => s + parseCurrency(r.weighted), 0);

    const byStage: Record<string, { count: number; amount: number }> = {};
    const byType: Record<string, { count: number; amount: number }> = {};

    filtered.forEach((r) => {
      const stage = r.stage || "Unknown";
      const type = r.type || "Unknown";
      const amt = parseCurrency(r.amount);

      if (!byStage[stage]) byStage[stage] = { count: 0, amount: 0 };
      byStage[stage].count++;
      byStage[stage].amount += amt;

      if (!byType[type]) byType[type] = { count: 0, amount: 0 };
      byType[type].count++;
      byType[type].amount += amt;
    });

    return { totalAmount, totalWeighted, byStage, byType };
  }, [filtered]);

  // Convert PipelineRows to table format
  const tableHeaders = ["Source", "Name", "Type", "Amount ($)", "Stage", "Prob", "Next Action", "Owner", "Notes"];
  const tableRows = filtered.map((r) => ({
    Source: SOURCE_LABELS[r.source]?.label || r.source,
    Name: r.name,
    Type: r.type,
    "Amount ($)": r.amount,
    Stage: r.stage,
    Prob: r.prob,
    "Next Action": r.nextAction,
    Owner: r.owner,
    Notes: r.notes,
  }));

  const maxStageAmount = Math.max(...Object.values(stats.byStage).map((s) => s.amount), 1);

  const commitmentCount = allRows.filter((r) => r.source === "commitments").length;
  const pipelineCount = allRows.filter((r) => r.source !== "commitments").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-['Spectral',Georgia,serif] text-3xl font-light">Pipeline</h1>
          <p className="mt-1 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#8a6d40] uppercase tracking-wider">
            {allRows.length} investors &middot; {formatCurrency(stats.totalAmount)} total &middot; {formatCurrency(stats.totalWeighted)} weighted
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/dashboard/board"
            className="flex items-center gap-2 border border-black/12 bg-white px-3 py-2 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#3a3d42] no-underline hover:border-black/25"
          >
            Board view →
          </a>
          <a
            href="https://docs.google.com/spreadsheets/d/1HIqULY2hBQI8DhRDgNWQgH5pAPluJVsogkP5qbIC560/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-black/12 bg-white px-3 py-2 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#3a3d42] no-underline hover:border-black/25"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Sheets
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-black/10">
        {[
          { key: "all" as const, label: `All (${allRows.length})` },
          { key: "pipeline" as const, label: `Pipeline (${pipelineCount})` },
          { key: "commitments" as const, label: `Commitments (${commitmentCount})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`cursor-pointer border-b-2 bg-transparent px-4 py-2.5 font-['IBM_Plex_Mono',monospace] text-[12px] uppercase tracking-wider transition-colors ${
              tab === t.key
                ? "border-[#17191c] text-[#17191c]"
                : "border-transparent text-[#5d6168] hover:text-[#3a3d42]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <SummaryCard label={tab === "pipeline" ? "Target" : "Committed"} value={formatCurrency(stats.totalAmount)} sub={`${filtered.length} investors`} />
        <SummaryCard label="Weighted" value={formatCurrency(stats.totalWeighted)} sub="probability-adjusted" />
        <SummaryCard
          label="Verbal+"
          value={String(
            (stats.byStage["5 - Verbal Commit"]?.count || 0) +
            (stats.byStage["6 - Signed"]?.count || 0) +
            (stats.byStage["7 - Wired"]?.count || 0)
          )}
          sub="committed"
        />
        <SummaryCard
          label="Active"
          value={String(
            (stats.byStage["1 - Outreach"]?.count || 0) +
            (stats.byStage["2 - Pitch"]?.count || 0) +
            (stats.byStage["3 - Internal IC"]?.count || 0) +
            (stats.byStage["4 - Final DD"]?.count || 0)
          )}
          sub="in pipeline"
        />
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* Stage Funnel */}
        <div className="border border-black/10 bg-white p-5">
          <h3 className="mb-3 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">By Stage</h3>
          <div className="space-y-2">
            {STAGE_ORDER.filter((s) => stats.byStage[s]).map((stage) => {
              const d = stats.byStage[stage];
              const pct = (d.amount / maxStageAmount) * 100;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <div className="w-[100px] shrink-0 text-right font-['IBM_Plex_Mono',monospace] text-[10px] text-[#3a3d42]">
                    {stage.replace(/^\d+ - /, "")}
                  </div>
                  <div className="relative h-5 flex-1 bg-[#f3efe7]">
                    <div className="absolute inset-y-0 left-0" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: STAGE_COLORS[stage] || "#8a6d40" }} />
                    <span className="relative z-10 flex h-full items-center px-2 font-['IBM_Plex_Mono',monospace] text-[9px] text-white mix-blend-difference">
                      {d.count} · {formatCurrency(d.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="border border-black/10 bg-white p-5">
          <h3 className="mb-3 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">By Type</h3>
          <div className="space-y-3">
            {Object.entries(stats.byType)
              .sort((a, b) => b[1].amount - a[1].amount)
              .map(([type, d]) => {
                const pct = stats.totalAmount > 0 ? (d.amount / stats.totalAmount) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="mb-1 flex justify-between font-['IBM_Plex_Mono',monospace] text-[11px]">
                      <span className="text-[#3a3d42]">{type}</span>
                      <span className="text-[#8a6d40]">{d.count} · {formatCurrency(d.amount)} · {pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#f3efe7]">
                      <div className="h-full" style={{ width: `${pct}%`, backgroundColor: type === "VC" ? "#17191c" : type === "Angel" ? "#8a6d40" : "#5d6168" }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable headers={tableHeaders} rows={tableRows} />
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-black/10 bg-white p-4 md:p-5">
      <div className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#8a6d40]">{label}</div>
      <div className="mt-1.5 font-['Spectral',Georgia,serif] text-[24px] font-light leading-none text-[#17191c] md:text-[28px]">{value}</div>
      <div className="mt-1 font-['IBM_Plex_Mono',monospace] text-[10px] text-[#5d6168]">{sub}</div>
    </div>
  );
}
