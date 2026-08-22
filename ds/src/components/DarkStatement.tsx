import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";

export interface DarkStatementProps {
  /** Bronze kicker, e.g. "04 — The principle" */
  kicker?: string;
  /** Large Spectral 300 statement headline */
  title: string;
  /** Muted body paragraph under the headline */
  body?: string;
  /** Max headline width in ch units (landing uses 18) */
  titleMaxCh?: number;
  /** Extra content below the body */
  children?: ReactNode;
}

/**
 * Full-bleed ink (#17191c) statement section with a bright-bronze kicker
 * and a huge light Spectral headline — the "DCC originates no loans"
 * section on the landing page.
 */
export function DarkStatement({ kicker, title, body, titleMaxCh = 18, children }: DarkStatementProps) {
  return (
    <section style={{ background: "#17191c", color: "#ece8e0" }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "104px 40px" }}>
        <SectionHeader kicker={kicker} title={title} lede={body} titleMaxCh={titleMaxCh} onDark display />
        {children}
      </div>
    </section>
  );
}
