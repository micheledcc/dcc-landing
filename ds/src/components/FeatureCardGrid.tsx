import { fonts } from "../tokens";

export interface FeatureCard {
  /** Bronze mono numeral above the title, e.g. "01" */
  number: string;
  title: string;
  body: string;
}

export interface FeatureCardGridProps {
  items: FeatureCard[];
  /** Grid columns (landing uses 3) */
  columns?: number;
}

/**
 * Hairline-bordered feature grid: cells share 1px rules with no gaps and no
 * shadows. Each cell carries a bronze mono numeral, a Spectral 400 title,
 * and a Plex Sans body — the "Three components, built to work as one rail"
 * grid on the landing page.
 */
export function FeatureCardGrid({ items, columns = 3 }: FeatureCardGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns},1fr)`,
        gap: 0,
        borderTop: "1px solid rgba(23,25,28,0.18)",
      }}
    >
      {items.map((item) => (
        <div key={item.number} style={{ padding: "34px 30px 40px", borderBottom: "1px solid rgba(23,25,28,0.18)" }}>
          <div style={{ fontFamily: fonts.mono, fontSize: "12px", color: "#8a6d40", marginBottom: "26px" }}>
            {item.number}
          </div>
          <h3
            style={{
              fontFamily: fonts.serif,
              fontWeight: 400,
              fontSize: "22px",
              lineHeight: 1.2,
              margin: "0 0 14px",
              color: "#17191c",
            }}
          >
            {item.title}
          </h3>
          <p style={{ fontFamily: fonts.sans, fontSize: "14.5px", lineHeight: 1.6, color: "#494d53", margin: 0 }}>
            {item.body}
          </p>
        </div>
      ))}
    </div>
  );
}
