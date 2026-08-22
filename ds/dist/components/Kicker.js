import { jsx as _jsx } from "react/jsx-runtime";
import { fonts } from "../tokens";
/**
 * Numbered editorial kicker that opens every DCC section — IBM Plex Mono,
 * uppercase, wide letter-spacing, bronze. E.g. "01 — The constraint".
 */
export function Kicker({ children, onDark = false, wide = false, marginBottom = 20 }) {
    return (_jsx("div", { style: {
            fontFamily: fonts.mono,
            fontSize: wide ? "11.5px" : "11px",
            letterSpacing: wide ? "0.24em" : "0.18em",
            color: onDark ? "#b79256" : "#8a6d40",
            textTransform: "uppercase",
            marginBottom: `${marginBottom}px`,
        }, children: children }));
}
