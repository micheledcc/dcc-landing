import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useRef, useCallback } from "react";
import { fonts, stageColors, typeColors } from "../tokens";
function parseSortValue(val) {
    if (!val)
        return "";
    const num = parseFloat(val.replace(/[$,%]/g, ""));
    return isNaN(num) ? val.toLowerCase() : num;
}
/**
 * Dense financial data table in the DCC idiom: parchment-adjacent white
 * surface, hairline borders, mono uppercase headers, sortable columns,
 * per-column filters, resizable columns, and colored stage/type badges
 * (pipeline progression scale). No rounded corners, no shadows.
 */
export function DataTable({ headers, rows, showFilters = true, showSort = true, compact = false }) {
    const [sortCol, setSortCol] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const [filters, setFilters] = useState({});
    const [colWidths, setColWidths] = useState({});
    const [expandedCell, setExpandedCell] = useState(null);
    const resizingRef = useRef(null);
    const displayHeaders = headers.filter((h) => !h.startsWith("_"));
    const uniqueValues = useMemo(() => {
        const uv = {};
        displayHeaders.forEach((h) => {
            const vals = [...new Set(rows.map((r) => r[h]).filter(Boolean))].sort();
            if (vals.length > 1 && vals.length <= 20)
                uv[h] = vals;
        });
        return uv;
    }, [rows, displayHeaders]);
    const filteredRows = useMemo(() => {
        return rows.filter((row) => Object.entries(filters).every(([col, val]) => {
            if (!val)
                return true;
            return (row[col] || "").toLowerCase().includes(val.toLowerCase());
        }));
    }, [rows, filters]);
    const sortedRows = useMemo(() => {
        if (!sortCol)
            return filteredRows;
        return [...filteredRows].sort((a, b) => {
            const av = parseSortValue(a[sortCol] || "");
            const bv = parseSortValue(b[sortCol] || "");
            if (av < bv)
                return sortDir === "asc" ? -1 : 1;
            if (av > bv)
                return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredRows, sortCol, sortDir]);
    function handleSort(col) {
        if (sortCol === col) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        }
        else {
            setSortCol(col);
            setSortDir("asc");
        }
    }
    const handleMouseDown = useCallback((col, e) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const th = e.target.closest("th");
        const startW = th ? th.offsetWidth : colWidths[col] || 150;
        resizingRef.current = { col, startX, startW };
        if (!colWidths[col] && th) {
            setColWidths((prev) => ({ ...prev, [col]: th.offsetWidth }));
        }
        function onMove(ev) {
            if (!resizingRef.current)
                return;
            const diff = ev.clientX - resizingRef.current.startX;
            setColWidths((prev) => ({
                ...prev,
                [resizingRef.current.col]: Math.max(60, resizingRef.current.startW + diff),
            }));
        }
        function onUp() {
            resizingRef.current = null;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }, [colWidths]);
    const cellKey = (ri, h) => `${ri}-${h}`;
    const pad = compact ? "8px" : "12px";
    const textSize = compact ? "12px" : "13px";
    const monoLabel = {
        fontFamily: fonts.mono,
        fontSize: "11px",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "#5d6168",
    };
    const widthStyle = (h) => colWidths[h] ? { width: `${colWidths[h]}px`, minWidth: `${colWidths[h]}px`, maxWidth: `${colWidths[h]}px` } : {};
    return (_jsxs("div", { children: [showFilters && Object.keys(uniqueValues).length > 0 && (_jsxs("div", { style: { marginBottom: "12px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }, children: [_jsx("span", { style: {
                            fontFamily: fonts.mono,
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "#8a6d40",
                        }, children: "Filter:" }), Object.entries(uniqueValues).map(([col, vals]) => (_jsxs("select", { value: filters[col] || "", onChange: (e) => setFilters({ ...filters, [col]: e.target.value }), style: {
                            border: "1px solid rgba(0,0,0,0.12)",
                            background: "#fff",
                            padding: "4px 8px",
                            fontFamily: fonts.mono,
                            fontSize: "11px",
                            color: "#3a3d42",
                            outline: "none",
                        }, children: [_jsx("option", { value: "", children: col }), vals.map((v) => (_jsx("option", { value: v, children: v }, v)))] }, col))), Object.values(filters).some(Boolean) && (_jsx("button", { onClick: () => setFilters({}), style: {
                            cursor: "pointer",
                            border: "none",
                            background: "transparent",
                            fontFamily: fonts.mono,
                            fontSize: "10px",
                            color: "#c44",
                            textDecoration: "underline",
                        }, children: "Clear all" })), _jsxs("span", { style: { marginLeft: "auto", fontFamily: fonts.mono, fontSize: "10px", color: "#5d6168" }, children: [sortedRows.length, " of ", rows.length, " rows"] })] })), _jsx("div", { style: { width: "100%", overflowX: "auto", border: "1px solid rgba(0,0,0,0.1)", background: "#fff" }, children: _jsxs("table", { style: {
                        width: "100%",
                        minWidth: "700px",
                        borderCollapse: "collapse",
                        ...(Object.keys(colWidths).length > 0 ? { tableLayout: "fixed" } : {}),
                    }, children: [_jsx("thead", { children: _jsx("tr", { style: { borderBottom: "1px solid rgba(0,0,0,0.12)", background: "#faf9f6" }, children: displayHeaders.map((h, hi) => (_jsxs("th", { style: {
                                        position: "relative",
                                        userSelect: "none",
                                        whiteSpace: "nowrap",
                                        padding: `0 16px`,
                                        textAlign: "left",
                                        ...monoLabel,
                                        ...(hi < displayHeaders.length - 1 ? { borderRight: "1px solid rgba(0,0,0,0.06)" } : {}),
                                        ...widthStyle(h),
                                    }, children: [_jsx("div", { style: { display: "flex", alignItems: "center", gap: "4px", padding: `${pad} 0` }, children: showSort ? (_jsxs("button", { onClick: () => handleSort(h), className: "dcc-sort-btn", style: { cursor: "pointer", border: "none", background: "transparent", padding: 0, ...monoLabel }, children: [h, sortCol === h && (_jsx("span", { style: { marginLeft: "4px", color: "#8a6d40" }, children: sortDir === "asc" ? "↑" : "↓" }))] })) : (_jsx("span", { children: h })) }), _jsx("div", { onMouseDown: (e) => handleMouseDown(h, e), className: "dcc-resize-handle", style: {
                                                position: "absolute",
                                                right: 0,
                                                top: 0,
                                                height: "100%",
                                                width: "8px",
                                                cursor: "col-resize",
                                                background: "transparent",
                                                marginRight: -1,
                                            } })] }, h))) }) }), _jsxs("tbody", { children: [sortedRows.map((row, i) => (_jsx("tr", { className: "dcc-table-row", style: { borderBottom: "1px solid rgba(0,0,0,0.06)" }, children: displayHeaders.map((h, hi) => {
                                        const val = row[h] || "";
                                        const key = cellKey(i, h);
                                        const isExpanded = expandedCell === key;
                                        const isLong = val.length > 40;
                                        return (_jsx("td", { style: {
                                                padding: `${pad} 16px`,
                                                verticalAlign: "top",
                                                overflow: "hidden",
                                                ...(hi < displayHeaders.length - 1 ? { borderRight: "1px solid rgba(0,0,0,0.04)" } : {}),
                                                ...widthStyle(h),
                                            }, children: h === "Stage" ? (_jsx("span", { style: {
                                                    display: "inline-block",
                                                    whiteSpace: "nowrap",
                                                    padding: "2px 8px",
                                                    fontFamily: fonts.mono,
                                                    fontSize: "10px",
                                                    color: "#fff",
                                                    backgroundColor: stageColors[val] || "#5d6168",
                                                }, children: val || "-" })) : h === "Type" ? (_jsx("span", { style: {
                                                    display: "inline-block",
                                                    whiteSpace: "nowrap",
                                                    border: `1px solid ${typeColors[val] || "#5d6168"}`,
                                                    padding: "2px 8px",
                                                    fontFamily: fonts.mono,
                                                    fontSize: "10px",
                                                    color: typeColors[val] || "#5d6168",
                                                }, children: val || "-" })) : h.includes("$") ? (_jsx("span", { style: { fontFamily: fonts.mono, fontSize: textSize, fontVariantNumeric: "tabular-nums" }, children: val || "-" })) : h === "Prob" ? (_jsx("span", { style: { fontFamily: fonts.mono, fontSize: textSize, color: "#8a6d40" }, children: val || "-" })) : h === "Name" ? (_jsx("span", { style: { fontFamily: fonts.sans, fontWeight: 500, color: "#17191c", fontSize: textSize }, children: val })) : (_jsxs("div", { style: {
                                                    fontFamily: fonts.sans,
                                                    fontSize: textSize,
                                                    color: "#2c2f34",
                                                    ...(isExpanded
                                                        ? { whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6 }
                                                        : colWidths[h]
                                                            ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
                                                            : { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }),
                                                    ...(isLong ? { cursor: "pointer" } : {}),
                                                }, onClick: isLong ? () => setExpandedCell(isExpanded ? null : key) : undefined, title: isLong && !isExpanded ? val : undefined, children: [val, isLong && !isExpanded && (_jsx("span", { style: { marginLeft: "4px", fontFamily: fonts.mono, fontSize: "9px", color: "#8a6d40" }, children: "more" }))] })) }, h));
                                    }) }, i))), sortedRows.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: displayHeaders.length, style: { padding: "32px 16px", textAlign: "center", fontSize: "13px", color: "#b9b2a4" }, children: "No matching rows" }) }))] })] }) })] }));
}
