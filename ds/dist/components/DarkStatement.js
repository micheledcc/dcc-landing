import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SectionHeader } from "./SectionHeader";
/**
 * Full-bleed ink (#17191c) statement section with a bright-bronze kicker
 * and a huge light Spectral headline — the "DCC originates no loans"
 * section on the landing page.
 */
export function DarkStatement({ kicker, title, body, titleMaxCh = 18, children }) {
    return (_jsx("section", { style: { background: "#17191c", color: "#ece8e0" }, children: _jsxs("div", { style: { maxWidth: "1160px", margin: "0 auto", padding: "104px 40px" }, children: [_jsx(SectionHeader, { kicker: kicker, title: title, lede: body, titleMaxCh: titleMaxCh, onDark: true, display: true }), children] }) }));
}
