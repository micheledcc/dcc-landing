import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fonts } from "../tokens";
/**
 * The DCC brand mark: a hairline-bordered square containing "DCC" in
 * IBM Plex Mono, beside the uppercase letterspaced wordmark.
 */
export function LogoMark({ size = "default", onDark = false, markOnly = false }) {
    const small = size === "small";
    const boxColor = onDark ? "#75766f" : "#17191c";
    const textColor = onDark ? "#a9aaa6" : "#3a3d42";
    return (_jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: small ? "13px" : "14px" }, children: [_jsx("span", { style: {
                    width: small ? "28px" : "34px",
                    height: small ? "28px" : "34px",
                    border: `1px solid ${boxColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: fonts.mono,
                    fontSize: small ? "9.5px" : "11px",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    color: onDark ? "#a9aaa6" : "#17191c",
                    flex: "none",
                }, children: "DCC" }), !markOnly && (_jsx("span", { style: {
                    fontFamily: fonts.mono,
                    fontSize: small ? "10px" : "10.5px",
                    letterSpacing: small ? "0.18em" : "0.22em",
                    color: textColor,
                    textTransform: "uppercase",
                }, children: "Digital\u00A0Collateral\u00A0Corporation" }))] }));
}
