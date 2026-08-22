import { Button } from "./Button";
import { LogoMark } from "./LogoMark";
import { fonts } from "../tokens";

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteHeaderProps {
  /** Uppercase mono nav links (hidden under 900px on the landing page) */
  links?: NavLink[];
  /** Primary CTA at the right of the nav */
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Sticky site header: blurred parchment bar with hairline bottom rule,
 * DCC logo mark left, mono uppercase nav + primary button right.
 */
export function SiteHeader({ links = [], ctaLabel = "Get in touch", ctaHref = "#contact" }: SiteHeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(243,239,231,0.86)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(23,25,28,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "0 40px",
          height: "74px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a href="#top" style={{ textDecoration: "none", color: "inherit" }}>
          <LogoMark />
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: "34px" }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="dcc-nav-link"
              style={{
                fontFamily: fonts.mono,
                fontSize: "11.5px",
                letterSpacing: "0.06em",
                color: "#3a3d42",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "color 0.15s ease",
              }}
            >
              {l.label}
            </a>
          ))}
          {ctaLabel && <Button href={ctaHref}>{ctaLabel}</Button>}
        </nav>
      </div>
    </header>
  );
}
