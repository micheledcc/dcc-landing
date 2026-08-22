import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fonts } from "../tokens";
/**
 * The end-to-end model timeline: a solid 1px ink rule with 9px ink dots
 * sitting on it, equal hairline-divided columns per step — "originate,
 * pool, rate, place, recycle" on the landing page.
 */
export function ProcessTimeline({ steps, footnoteLabel, footnoteText }) {
    return (_jsxs("div", { style: { position: "relative", borderTop: "1px solid #17191c" }, children: [_jsx("div", { style: { display: "grid", gridTemplateColumns: `repeat(${steps.length},1fr)` }, children: steps.map((step, i) => (_jsxs("div", { style: {
                        padding: "0 18px 0 14px",
                        borderRight: i < steps.length - 1 ? "1px solid rgba(23,25,28,0.12)" : undefined,
                        position: "relative",
                    }, children: [_jsx("div", { style: {
                                width: "9px",
                                height: "9px",
                                background: "#17191c",
                                borderRadius: "50%",
                                position: "absolute",
                                top: "-5px",
                                left: 0,
                            } }), _jsx("div", { style: { fontFamily: fonts.mono, fontSize: "11px", color: "#8a6d40", margin: "22px 0 14px" }, children: step.number }), _jsx("h3", { style: {
                                fontFamily: fonts.sans,
                                fontWeight: 600,
                                fontSize: "14px",
                                letterSpacing: "0.01em",
                                margin: "0 0 10px",
                                lineHeight: 1.25,
                                color: "#17191c",
                            }, children: step.title }), _jsx("p", { style: { fontFamily: fonts.sans, fontSize: "12.5px", lineHeight: 1.5, color: "#5d6168", margin: "0 0 28px" }, children: step.body })] }, step.number))) }), (footnoteLabel || footnoteText) && (_jsxs("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    paddingTop: "18px",
                    borderTop: "1px solid rgba(23,25,28,0.12)",
                }, children: [footnoteLabel && (_jsx("span", { style: {
                            fontFamily: fonts.mono,
                            fontSize: "10.5px",
                            letterSpacing: "0.14em",
                            color: "#8a6d40",
                            textTransform: "uppercase",
                        }, children: footnoteLabel })), footnoteText && (_jsx("span", { style: { fontFamily: fonts.sans, fontSize: "12.5px", color: "#5d6168" }, children: footnoteText }))] }))] }));
}
