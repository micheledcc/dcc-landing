"use client";

import { useState, useMemo, useRef, useCallback } from "react";

const STAGE_COLORS: Record<string, string> = {
  "1 - Outreach": "#b9b2a4", "2 - Pitch": "#a09484", "3 - Internal IC": "#8a6d40",
  "4 - Final DD": "#6d5530", "5 - Verbal Commit": "#3a7c5f", "6 - Signed": "#2d6a4f",
  "7 - Wired": "#1b4332", Advisor: "#5d6168", "0 - Passed": "#c44",
};
const TYPE_COLORS: Record<string, string> = { Angel: "#8a6d40", VC: "#17191c", Advisor: "#5d6168" };

function parseSortValue(val: string): number | string {
  if (!val) return "";
  const num = parseFloat(val.replace(/[$,%]/g, ""));
  return isNaN(num) ? val.toLowerCase() : num;
}

interface DataTableProps {
  headers: string[];
  rows: Record<string, string>[];
  showFilters?: boolean;
  showSort?: boolean;
  compact?: boolean;
}

export function DataTable({ headers, rows, showFilters = true, showSort = true, compact = false }: DataTableProps) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  const resizingRef = useRef<{ col: string; startX: number; startW: number } | null>(null);

  const displayHeaders = headers.filter((h) => !h.startsWith("_"));

  const uniqueValues = useMemo(() => {
    const uv: Record<string, string[]> = {};
    displayHeaders.forEach((h) => {
      const vals = [...new Set(rows.map((r) => r[h]).filter(Boolean))].sort();
      if (vals.length > 1 && vals.length <= 20) uv[h] = vals;
    });
    return uv;
  }, [rows, displayHeaders]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.entries(filters).every(([col, val]) => {
        if (!val) return true;
        return (row[col] || "").toLowerCase().includes(val.toLowerCase());
      })
    );
  }, [rows, filters]);

  const sortedRows = useMemo(() => {
    if (!sortCol) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const av = parseSortValue(a[sortCol] || "");
      const bv = parseSortValue(b[sortCol] || "");
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortCol, sortDir]);

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  const handleMouseDown = useCallback((col: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    // Read actual rendered width from the th element
    const th = (e.target as HTMLElement).closest("th");
    const startW = th ? th.offsetWidth : (colWidths[col] || 150);
    resizingRef.current = { col, startX, startW };

    // Set initial width for all columns to lock them during resize
    if (!colWidths[col] && th) {
      setColWidths((prev) => ({ ...prev, [col]: th.offsetWidth }));
    }

    function onMove(ev: MouseEvent) {
      if (!resizingRef.current) return;
      const diff = ev.clientX - resizingRef.current.startX;
      setColWidths((prev) => ({ ...prev, [resizingRef.current!.col]: Math.max(60, resizingRef.current!.startW + diff) }));
    }
    function onUp() {
      resizingRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [colWidths]);

  const cellKey = (ri: number, h: string) => `${ri}-${h}`;
  const py = compact ? "py-2" : "py-3";
  const textSize = compact ? "text-[12px]" : "text-[13px]";

  return (
    <div>
      {/* Filters row */}
      {showFilters && Object.keys(uniqueValues).length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#8a6d40]">Filter:</span>
          {Object.entries(uniqueValues).map(([col, vals]) => (
            <select
              key={col}
              value={filters[col] || ""}
              onChange={(e) => setFilters({ ...filters, [col]: e.target.value })}
              className="border border-black/12 bg-white px-2 py-1 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#3a3d42] outline-none"
            >
              <option value="">{col}</option>
              {vals.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          ))}
          {Object.values(filters).some(Boolean) && (
            <button
              onClick={() => setFilters({})}
              className="cursor-pointer border-none bg-transparent font-['IBM_Plex_Mono',monospace] text-[10px] text-[#c44] underline"
            >
              Clear all
            </button>
          )}
          <span className="ml-auto font-['IBM_Plex_Mono',monospace] text-[10px] text-[#5d6168]">
            {sortedRows.length} of {rows.length} rows
          </span>
        </div>
      )}

      <div className="w-full overflow-x-auto border border-black/10 bg-white">
        <table className={`w-full min-w-[700px] border-collapse ${Object.keys(colWidths).length > 0 ? "" : ""}`} style={Object.keys(colWidths).length > 0 ? { tableLayout: "fixed" } : undefined}>
          <thead>
            <tr className="border-b border-black/12 bg-[#faf9f6]">
              {displayHeaders.map((h, hi) => (
                <th
                  key={h}
                  className={`relative select-none whitespace-nowrap px-4 text-left font-['IBM_Plex_Mono',monospace] text-[11px] font-medium uppercase tracking-wider text-[#5d6168] ${
                    hi < displayHeaders.length - 1 ? "border-r border-black/[0.06]" : ""
                  }`}
                  style={colWidths[h] ? { width: `${colWidths[h]}px`, minWidth: `${colWidths[h]}px`, maxWidth: `${colWidths[h]}px` } : undefined}
                >
                  <div className={`flex items-center gap-1 ${py}`}>
                    {showSort ? (
                      <button
                        onClick={() => handleSort(h)}
                        className="cursor-pointer border-none bg-transparent p-0 font-['IBM_Plex_Mono',monospace] text-[11px] font-medium uppercase tracking-wider text-[#5d6168] hover:text-[#17191c]"
                      >
                        {h}
                        {sortCol === h && (
                          <span className="ml-1 text-[#8a6d40]">{sortDir === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    ) : (
                      <span>{h}</span>
                    )}
                  </div>
                  {/* Resize handle */}
                  <div
                    onMouseDown={(e) => handleMouseDown(h, e)}
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-[#8a6d40]/20"
                    style={{ marginRight: -1 }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <tr key={i} className="border-b border-black/6 transition-colors hover:bg-[#f9f7f2]">
                {displayHeaders.map((h, hi) => {
                  const val = row[h] || "";
                  const key = cellKey(i, h);
                  const isExpanded = expandedCell === key;
                  const isLong = val.length > 40;

                  return (
                    <td
                      key={h}
                      className={`px-4 ${py} align-top overflow-hidden ${
                        hi < displayHeaders.length - 1 ? "border-r border-black/[0.04]" : ""
                      }`}
                      style={colWidths[h] ? { width: `${colWidths[h]}px`, minWidth: `${colWidths[h]}px`, maxWidth: `${colWidths[h]}px` } : undefined}
                    >
                      {h === "Stage" ? (
                        <span
                          className="inline-block whitespace-nowrap px-2 py-0.5 font-['IBM_Plex_Mono',monospace] text-[10px] text-white"
                          style={{ backgroundColor: STAGE_COLORS[val] || "#5d6168" }}
                        >
                          {val || "-"}
                        </span>
                      ) : h === "Type" ? (
                        <span
                          className="inline-block whitespace-nowrap border px-2 py-0.5 font-['IBM_Plex_Mono',monospace] text-[10px]"
                          style={{ borderColor: TYPE_COLORS[val] || "#5d6168", color: TYPE_COLORS[val] || "#5d6168" }}
                        >
                          {val || "-"}
                        </span>
                      ) : h.includes("$") || h === "Weighted ($)" ? (
                        <span className={`font-['IBM_Plex_Mono',monospace] ${textSize} tabular-nums`}>{val || "-"}</span>
                      ) : h === "Prob" ? (
                        <span className={`font-['IBM_Plex_Mono',monospace] ${textSize} text-[#8a6d40]`}>{val || "-"}</span>
                      ) : h === "Name" ? (
                        <span className={`font-medium text-[#17191c] ${textSize}`}>{val}</span>
                      ) : (
                        <div
                          className={`${textSize} text-[#2c2f34] leading-relaxed ${
                            isExpanded
                              ? "whitespace-pre-wrap break-words"
                              : "truncate"
                          } ${isLong ? "cursor-pointer hover:text-[#17191c]" : ""}`}
                          onClick={isLong ? () => setExpandedCell(isExpanded ? null : key) : undefined}
                          title={isLong && !isExpanded ? val : undefined}
                        >
                          {val}
                          {isLong && !isExpanded && (
                            <span className="ml-1 font-['IBM_Plex_Mono',monospace] text-[9px] text-[#8a6d40]">more</span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={displayHeaders.length} className="px-4 py-8 text-center text-[13px] text-[#b9b2a4]">
                  No matching rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
