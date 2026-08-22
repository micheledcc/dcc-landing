import { useState, useMemo, useRef, useCallback } from "react";
import type { CSSProperties } from "react";
import { fonts, stageColors, typeColors } from "../tokens";

function parseSortValue(val: string): number | string {
  if (!val) return "";
  const num = parseFloat(val.replace(/[$,%]/g, ""));
  return isNaN(num) ? val.toLowerCase() : num;
}

export interface DataTableProps {
  /** Column headers, in display order. Headers starting with "_" are hidden. */
  headers: string[];
  /** Row objects keyed by header. "Stage" and "Type" columns render as badges. */
  rows: Record<string, string>[];
  /** Show the per-column dropdown filter row (default true) */
  showFilters?: boolean;
  /** Make headers click-to-sort (default true) */
  showSort?: boolean;
  /** Tighter row padding and smaller text */
  compact?: boolean;
}

/**
 * Dense financial data table in the DCC idiom: parchment-adjacent white
 * surface, hairline borders, mono uppercase headers, sortable columns,
 * per-column filters, resizable columns, and colored stage/type badges
 * (pipeline progression scale). No rounded corners, no shadows.
 */
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

  const handleMouseDown = useCallback(
    (col: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const th = (e.target as HTMLElement).closest("th");
      const startW = th ? th.offsetWidth : colWidths[col] || 150;
      resizingRef.current = { col, startX, startW };
      if (!colWidths[col] && th) {
        setColWidths((prev) => ({ ...prev, [col]: th.offsetWidth }));
      }
      function onMove(ev: MouseEvent) {
        if (!resizingRef.current) return;
        const diff = ev.clientX - resizingRef.current.startX;
        setColWidths((prev) => ({
          ...prev,
          [resizingRef.current!.col]: Math.max(60, resizingRef.current!.startW + diff),
        }));
      }
      function onUp() {
        resizingRef.current = null;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [colWidths]
  );

  const cellKey = (ri: number, h: string) => `${ri}-${h}`;
  const pad = compact ? "8px" : "12px";
  const textSize = compact ? "12px" : "13px";

  const monoLabel: CSSProperties = {
    fontFamily: fonts.mono,
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#5d6168",
  };
  const widthStyle = (h: string): CSSProperties =>
    colWidths[h] ? { width: `${colWidths[h]}px`, minWidth: `${colWidths[h]}px`, maxWidth: `${colWidths[h]}px` } : {};

  return (
    <div>
      {showFilters && Object.keys(uniqueValues).length > 0 && (
        <div style={{ marginBottom: "12px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#8a6d40",
            }}
          >
            Filter:
          </span>
          {Object.entries(uniqueValues).map(([col, vals]) => (
            <select
              key={col}
              value={filters[col] || ""}
              onChange={(e) => setFilters({ ...filters, [col]: e.target.value })}
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                background: "#fff",
                padding: "4px 8px",
                fontFamily: fonts.mono,
                fontSize: "11px",
                color: "#3a3d42",
                outline: "none",
              }}
            >
              <option value="">{col}</option>
              {vals.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          ))}
          {Object.values(filters).some(Boolean) && (
            <button
              onClick={() => setFilters({})}
              style={{
                cursor: "pointer",
                border: "none",
                background: "transparent",
                fontFamily: fonts.mono,
                fontSize: "10px",
                color: "#c44",
                textDecoration: "underline",
              }}
            >
              Clear all
            </button>
          )}
          <span style={{ marginLeft: "auto", fontFamily: fonts.mono, fontSize: "10px", color: "#5d6168" }}>
            {sortedRows.length} of {rows.length} rows
          </span>
        </div>
      )}

      <div style={{ width: "100%", overflowX: "auto", border: "1px solid rgba(0,0,0,0.1)", background: "#fff" }}>
        <table
          style={{
            width: "100%",
            minWidth: "700px",
            borderCollapse: "collapse",
            ...(Object.keys(colWidths).length > 0 ? { tableLayout: "fixed" as const } : {}),
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.12)", background: "#faf9f6" }}>
              {displayHeaders.map((h, hi) => (
                <th
                  key={h}
                  style={{
                    position: "relative",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    padding: `0 16px`,
                    textAlign: "left",
                    ...monoLabel,
                    ...(hi < displayHeaders.length - 1 ? { borderRight: "1px solid rgba(0,0,0,0.06)" } : {}),
                    ...widthStyle(h),
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: `${pad} 0` }}>
                    {showSort ? (
                      <button
                        onClick={() => handleSort(h)}
                        className="dcc-sort-btn"
                        style={{ cursor: "pointer", border: "none", background: "transparent", padding: 0, ...monoLabel }}
                      >
                        {h}
                        {sortCol === h && (
                          <span style={{ marginLeft: "4px", color: "#8a6d40" }}>{sortDir === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    ) : (
                      <span>{h}</span>
                    )}
                  </div>
                  <div
                    onMouseDown={(e) => handleMouseDown(h, e)}
                    className="dcc-resize-handle"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      height: "100%",
                      width: "8px",
                      cursor: "col-resize",
                      background: "transparent",
                      marginRight: -1,
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <tr key={i} className="dcc-table-row" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                {displayHeaders.map((h, hi) => {
                  const val = row[h] || "";
                  const key = cellKey(i, h);
                  const isExpanded = expandedCell === key;
                  const isLong = val.length > 40;
                  return (
                    <td
                      key={h}
                      style={{
                        padding: `${pad} 16px`,
                        verticalAlign: "top",
                        overflow: "hidden",
                        ...(hi < displayHeaders.length - 1 ? { borderRight: "1px solid rgba(0,0,0,0.04)" } : {}),
                        ...widthStyle(h),
                      }}
                    >
                      {h === "Stage" ? (
                        <span
                          style={{
                            display: "inline-block",
                            whiteSpace: "nowrap",
                            padding: "2px 8px",
                            fontFamily: fonts.mono,
                            fontSize: "10px",
                            color: "#fff",
                            backgroundColor: stageColors[val] || "#5d6168",
                          }}
                        >
                          {val || "-"}
                        </span>
                      ) : h === "Type" ? (
                        <span
                          style={{
                            display: "inline-block",
                            whiteSpace: "nowrap",
                            border: `1px solid ${typeColors[val] || "#5d6168"}`,
                            padding: "2px 8px",
                            fontFamily: fonts.mono,
                            fontSize: "10px",
                            color: typeColors[val] || "#5d6168",
                          }}
                        >
                          {val || "-"}
                        </span>
                      ) : h.includes("$") ? (
                        <span style={{ fontFamily: fonts.mono, fontSize: textSize, fontVariantNumeric: "tabular-nums" }}>
                          {val || "-"}
                        </span>
                      ) : h === "Prob" ? (
                        <span style={{ fontFamily: fonts.mono, fontSize: textSize, color: "#8a6d40" }}>{val || "-"}</span>
                      ) : h === "Name" ? (
                        <span style={{ fontFamily: fonts.sans, fontWeight: 500, color: "#17191c", fontSize: textSize }}>
                          {val}
                        </span>
                      ) : (
                        <div
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: textSize,
                            color: "#2c2f34",
                            ...(isExpanded
                              ? { whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6 }
                              : colWidths[h]
                                ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
                                : { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }),
                            ...(isLong ? { cursor: "pointer" } : {}),
                          }}
                          onClick={isLong ? () => setExpandedCell(isExpanded ? null : key) : undefined}
                          title={isLong && !isExpanded ? val : undefined}
                        >
                          {val}
                          {isLong && !isExpanded && (
                            <span style={{ marginLeft: "4px", fontFamily: fonts.mono, fontSize: "9px", color: "#8a6d40" }}>
                              more
                            </span>
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
                <td
                  colSpan={displayHeaders.length}
                  style={{ padding: "32px 16px", textAlign: "center", fontSize: "13px", color: "#b9b2a4" }}
                >
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
