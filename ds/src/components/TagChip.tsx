import type { ReactNode } from "react";
import { fonts } from "../tokens";

export interface TagChipProps {
  children: ReactNode;
}

/**
 * Square mono-font chip with a hairline border — used for counterparty tags
 * ("Warehouse SPV", "Rating agencies") under the model diagram.
 */
export function TagChip({ children }: TagChipProps) {
  return (
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: "11px",
        letterSpacing: "0.04em",
        color: "#3a3d42",
        border: "1px solid rgba(23,25,28,0.2)",
        padding: "7px 13px",
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

export interface TagChipRowProps {
  /** Chip labels, rendered in a wrapping row */
  items: string[];
}

/** A wrapping row of TagChips with the landing page's 10x8 gap. */
export function TagChipRow({ items }: TagChipRowProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 8px" }}>
      {items.map((t) => (
        <TagChip key={t}>{t}</TagChip>
      ))}
    </div>
  );
}
