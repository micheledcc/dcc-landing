import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./Button";
import { Kicker } from "./Kicker";
import { fonts } from "../tokens";
/**
 * Dark contact section: two columns aligned to baseline — Spectral headline
 * block left, inverted parchment CTA + mono email line right.
 */
export function ContactSplit({ kicker = "Contact", title = "Get in touch.", body, ctaLabel = "Get in touch →", ctaHref = "#", email, }) {
    return (_jsx("section", { style: { background: "#17191c", color: "#ece8e0" }, children: _jsxs("div", { style: {
                maxWidth: "1160px",
                margin: "0 auto",
                padding: "104px 40px",
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: "64px",
                alignItems: "end",
            }, children: [_jsxs("div", { children: [kicker && _jsx(Kicker, { onDark: true, marginBottom: 28, children: kicker }), _jsx("h2", { style: {
                                fontFamily: fonts.serif,
                                fontWeight: 300,
                                fontSize: "clamp(34px,5vw,60px)",
                                lineHeight: 1.04,
                                letterSpacing: "-0.015em",
                                margin: 0,
                                color: "#ece8e0",
                            }, children: title }), body && (_jsx("p", { style: {
                                fontFamily: fonts.sans,
                                fontSize: "17px",
                                lineHeight: 1.6,
                                color: "#a9aaa6",
                                maxWidth: "46ch",
                                margin: "28px 0 0",
                            }, children: body }))] }), _jsxs("div", { style: { justifySelf: "start" }, children: [_jsx(Button, { variant: "cta-dark", href: ctaHref, children: ctaLabel }), email && (_jsx("div", { style: {
                                fontFamily: fonts.mono,
                                fontSize: "12px",
                                letterSpacing: "0.04em",
                                color: "#8c8d89",
                                marginTop: "22px",
                            }, children: email }))] })] }) }));
}
