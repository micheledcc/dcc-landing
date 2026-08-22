import { fonts } from "../tokens";

export interface TimelineStep {
  /** Bronze mono number, e.g. "01" */
  number: string;
  title: string;
  body: string;
}

export interface ProcessTimelineProps {
  steps: TimelineStep[];
  /** Optional footnote row under the timeline (mono label + sans text) */
  footnoteLabel?: string;
  footnoteText?: string;
}

/**
 * The end-to-end model timeline: a solid 1px ink rule with 9px ink dots
 * sitting on it, equal hairline-divided columns per step — "originate,
 * pool, rate, place, recycle" on the landing page.
 */
export function ProcessTimeline({ steps, footnoteLabel, footnoteText }: ProcessTimelineProps) {
  return (
    <div style={{ position: "relative", borderTop: "1px solid #17191c" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length},1fr)` }}>
        {steps.map((step, i) => (
          <div
            key={step.number}
            style={{
              padding: "0 18px 0 14px",
              borderRight: i < steps.length - 1 ? "1px solid rgba(23,25,28,0.12)" : undefined,
              position: "relative",
            }}
          >
            <div
              style={{
                width: "9px",
                height: "9px",
                background: "#17191c",
                borderRadius: "50%",
                position: "absolute",
                top: "-5px",
                left: 0,
              }}
            />
            <div style={{ fontFamily: fonts.mono, fontSize: "11px", color: "#8a6d40", margin: "22px 0 14px" }}>
              {step.number}
            </div>
            <h3
              style={{
                fontFamily: fonts.sans,
                fontWeight: 600,
                fontSize: "14px",
                letterSpacing: "0.01em",
                margin: "0 0 10px",
                lineHeight: 1.25,
                color: "#17191c",
              }}
            >
              {step.title}
            </h3>
            <p style={{ fontFamily: fonts.sans, fontSize: "12.5px", lineHeight: 1.5, color: "#5d6168", margin: "0 0 28px" }}>
              {step.body}
            </p>
          </div>
        ))}
      </div>
      {(footnoteLabel || footnoteText) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            paddingTop: "18px",
            borderTop: "1px solid rgba(23,25,28,0.12)",
          }}
        >
          {footnoteLabel && (
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: "10.5px",
                letterSpacing: "0.14em",
                color: "#8a6d40",
                textTransform: "uppercase",
              }}
            >
              {footnoteLabel}
            </span>
          )}
          {footnoteText && (
            <span style={{ fontFamily: fonts.sans, fontSize: "12.5px", color: "#5d6168" }}>{footnoteText}</span>
          )}
        </div>
      )}
    </div>
  );
}
