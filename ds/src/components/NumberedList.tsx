import { fonts } from "../tokens";

export interface NumberedListItem {
  /** Bronze mono marker, e.g. roman "i", "ii", "iii" */
  marker: string;
  text: string;
}

export interface NumberedListProps {
  items: NumberedListItem[];
}

/**
 * Hairline-divided list rows with a bronze mono marker column — the
 * roman-numeral constraint list ("i / ii / iii") on the landing page.
 */
export function NumberedList({ items }: NumberedListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid rgba(23,25,28,0.12)" }}>
      {items.map((item) => (
        <div
          key={item.marker}
          style={{ display: "flex", gap: "22px", padding: "20px 0", borderBottom: "1px solid rgba(23,25,28,0.12)" }}
        >
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: "12px",
              color: "#8a6d40",
              paddingTop: "2px",
              flex: "none",
              width: "26px",
            }}
          >
            {item.marker}
          </span>
          <p style={{ fontFamily: fonts.sans, fontSize: "15px", lineHeight: 1.55, color: "#2c2f34", margin: 0 }}>
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}
