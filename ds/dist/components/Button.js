import { jsx as _jsx } from "react/jsx-runtime";
import { colors, fonts } from "../tokens";
/**
 * DCC button. Square corners always. Primary is solid ink on parchment;
 * secondary is text with a hairline bottom border (usually with a trailing →);
 * cta-dark is the inverted parchment-on-ink button used in dark sections.
 */
export function Button({ variant = "primary", href, size = "default", onClick, children, style }) {
    const base = {
        fontFamily: fonts.sans,
        fontWeight: 500,
        display: "inline-block",
        cursor: "pointer",
        border: "none",
        textDecoration: "none",
        transition: "background 0.15s ease, border-color 0.15s ease",
    };
    const variants = {
        primary: {
            fontSize: size === "large" ? "14.5px" : "13px",
            letterSpacing: "0.01em",
            background: colors.ink,
            color: colors.bg,
            padding: size === "large" ? "15px 30px" : "11px 20px",
        },
        secondary: {
            fontSize: "14.5px",
            background: "transparent",
            color: colors.ink,
            padding: "15px 6px",
            borderBottom: "1px solid rgba(23,25,28,0.35)",
        },
        "cta-dark": {
            fontSize: "15px",
            background: colors.onDarkHeading,
            color: colors.ink,
            padding: "16px 34px",
        },
    };
    const cls = variant === "primary" ? "dcc-btn-primary" : variant === "secondary" ? "dcc-btn-secondary" : "dcc-btn-cta";
    const merged = { ...base, ...variants[variant], ...style };
    if (href) {
        return (_jsx("a", { href: href, className: cls, style: merged, onClick: onClick, children: children }));
    }
    return (_jsx("button", { type: "button", className: cls, style: merged, onClick: onClick, children: children }));
}
