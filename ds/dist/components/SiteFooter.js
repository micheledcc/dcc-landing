import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LogoMark } from "./LogoMark";
import { fonts } from "../tokens";
/**
 * Ink footer with a hairline top rule: small muted DCC mark + wordmark
 * left, 12px legal text right.
 */
export function SiteFooter({ legal = "© 2026 Digital Collateral Corporation.", }) {
    return (_jsx("footer", { style: { background: "#17191c", color: "#75766f", borderTop: "1px solid rgba(255,255,255,0.1)" }, children: _jsxs("div", { style: {
                maxWidth: "1160px",
                margin: "0 auto",
                padding: "40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "18px",
            }, children: [_jsx(LogoMark, { size: "small", onDark: true }), _jsx("div", { style: {
                        fontFamily: fonts.sans,
                        fontSize: "12px",
                        lineHeight: 1.5,
                        color: "#75766f",
                        maxWidth: "54ch",
                        textAlign: "right",
                    }, children: legal })] }) }));
}
