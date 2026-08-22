import { fonts } from "../tokens";

export interface LogoMarkProps {
  /** Compact 28px footer variant vs 34px header variant */
  size?: "default" | "small";
  /** Muted colors for the dark footer */
  onDark?: boolean;
  /** Hide the wordmark and show only the bordered square */
  markOnly?: boolean;
}

/**
 * The DCC brand mark: a hairline-bordered square containing "DCC" in
 * IBM Plex Mono, beside the uppercase letterspaced wordmark.
 */
export function LogoMark({ size = "default", onDark = false, markOnly = false }: LogoMarkProps) {
  const small = size === "small";
  const boxColor = onDark ? "#75766f" : "#17191c";
  const textColor = onDark ? "#a9aaa6" : "#3a3d42";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: small ? "13px" : "14px" }}>
      <span
        style={{
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
        }}
      >
        DCC
      </span>
      {!markOnly && (
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: small ? "10px" : "10.5px",
            letterSpacing: small ? "0.18em" : "0.22em",
            color: textColor,
            textTransform: "uppercase",
          }}
        >
          Digital&nbsp;Collateral&nbsp;Corporation
        </span>
      )}
    </span>
  );
}
