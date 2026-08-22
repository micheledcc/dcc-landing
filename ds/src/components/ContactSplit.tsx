import { Button } from "./Button";
import { Kicker } from "./Kicker";
import { fonts } from "../tokens";

export interface ContactSplitProps {
  kicker?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Mono email line shown under the CTA */
  email?: string;
}

/**
 * Dark contact section: two columns aligned to baseline — Spectral headline
 * block left, inverted parchment CTA + mono email line right.
 */
export function ContactSplit({
  kicker = "Contact",
  title = "Get in touch.",
  body,
  ctaLabel = "Get in touch →",
  ctaHref = "#",
  email,
}: ContactSplitProps) {
  return (
    <section style={{ background: "#17191c", color: "#ece8e0" }}>
      <div
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "104px 40px",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "64px",
          alignItems: "end",
        }}
      >
        <div>
          {kicker && <Kicker onDark marginBottom={28}>{kicker}</Kicker>}
          <h2
            style={{
              fontFamily: fonts.serif,
              fontWeight: 300,
              fontSize: "clamp(34px,5vw,60px)",
              lineHeight: 1.04,
              letterSpacing: "-0.015em",
              margin: 0,
              color: "#ece8e0",
            }}
          >
            {title}
          </h2>
          {body && (
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: "17px",
                lineHeight: 1.6,
                color: "#a9aaa6",
                maxWidth: "46ch",
                margin: "28px 0 0",
              }}
            >
              {body}
            </p>
          )}
        </div>
        <div style={{ justifySelf: "start" }}>
          <Button variant="cta-dark" href={ctaHref}>
            {ctaLabel}
          </Button>
          {email && (
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: "12px",
                letterSpacing: "0.04em",
                color: "#8c8d89",
                marginTop: "22px",
              }}
            >
              {email}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
