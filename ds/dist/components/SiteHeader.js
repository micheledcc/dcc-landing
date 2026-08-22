import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./Button";
import { LogoMark } from "./LogoMark";
import { fonts } from "../tokens";
/**
 * Sticky site header: blurred parchment bar with hairline bottom rule,
 * DCC logo mark left, mono uppercase nav + primary button right.
 */
export function SiteHeader({ links = [], ctaLabel = "Get in touch", ctaHref = "#contact" }) {
    return (_jsx("header", { style: {
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(243,239,231,0.86)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(23,25,28,0.1)",
        }, children: _jsxs("div", { style: {
                maxWidth: "1160px",
                margin: "0 auto",
                padding: "0 40px",
                height: "74px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }, children: [_jsx("a", { href: "#top", style: { textDecoration: "none", color: "inherit" }, children: _jsx(LogoMark, {}) }), _jsxs("nav", { style: { display: "flex", alignItems: "center", gap: "34px" }, children: [links.map((l) => (_jsx("a", { href: l.href, className: "dcc-nav-link", style: {
                                fontFamily: fonts.mono,
                                fontSize: "11.5px",
                                letterSpacing: "0.06em",
                                color: "#3a3d42",
                                textTransform: "uppercase",
                                textDecoration: "none",
                                transition: "color 0.15s ease",
                            }, children: l.label }, l.href))), ctaLabel && _jsx(Button, { href: ctaHref, children: ctaLabel })] })] }) }));
}
