import { jsx as _jsx } from "react/jsx-runtime";
import { fonts } from "../tokens";
/**
 * Square mono-font chip with a hairline border — used for counterparty tags
 * ("Warehouse SPV", "Rating agencies") under the model diagram.
 */
export function TagChip({ children }) {
    return (_jsx("span", { style: {
            fontFamily: fonts.mono,
            fontSize: "11px",
            letterSpacing: "0.04em",
            color: "#3a3d42",
            border: "1px solid rgba(23,25,28,0.2)",
            padding: "7px 13px",
            display: "inline-block",
        }, children: children }));
}
/** A wrapping row of TagChips with the landing page's 10x8 gap. */
export function TagChipRow({ items }) {
    return (_jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px 8px" }, children: items.map((t) => (_jsx(TagChip, { children: t }, t))) }));
}
