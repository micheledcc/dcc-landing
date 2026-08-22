import { Kicker } from "./Kicker";
import { fonts } from "../tokens";

export interface SectionHeaderProps {
  /** Kicker line above the title, e.g. "02 — What we do" */
  kicker?: string;
  /** Section headline, set in Spectral 300 */
  title: string;
  /** Optional lede paragraph under (or beside) the title */
  lede?: string;
  /** Max title width in ch units (landing uses 16–22) */
  titleMaxCh?: number;
  /** On dark ink sections: light heading, brighter bronze, muted body */
  onDark?: boolean;
  /** Larger display size for statement sections (up to 58px vs 42px) */
  display?: boolean;
}

/**
 * DCC section header: bronze numbered kicker + Spectral 300 headline,
 * optionally with a lede. The standard opening block of every section.
 */
export function SectionHeader({ kicker, title, lede, titleMaxCh, onDark = false, display = false }: SectionHeaderProps) {
  return (
    <div>
      {kicker && <Kicker onDark={onDark} marginBottom={onDark ? 34 : 20}>{kicker}</Kicker>}
      <h2
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: display ? "clamp(30px,4.6vw,58px)" : "clamp(28px,3.4vw,42px)",
          lineHeight: display ? 1.08 : 1.12,
          letterSpacing: display ? "-0.015em" : "-0.01em",
          margin: 0,
          maxWidth: titleMaxCh ? `${titleMaxCh}ch` : undefined,
          color: onDark ? "#ece8e0" : "#17191c",
        }}
      >
        {title}
      </h2>
      {lede && (
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: display ? "clamp(16px,1.7vw,19px)" : "17px",
            lineHeight: 1.62,
            color: onDark ? "#a9aaa6" : "#41454b",
            maxWidth: "60ch",
            margin: "28px 0 0",
          }}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
