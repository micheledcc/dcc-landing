# Building with the DCC design system

DCC (Digital Collateral Corporation) is an institutional, editorial, print-inspired system: warm parchment surfaces, near-black ink, bronze accents, hairline rules, sharp corners, serif display type. Components live on `window.DCC`.

## Setup

No provider or wrapper is required — every component is self-styled. Two global rules only:

- Page background must be `var(--dcc-bg)` (#f3efe7 warm parchment). Components assume it.
- Fonts (Spectral, IBM Plex Sans, IBM Plex Mono) load via `styles.css`'s Google Fonts `@import` — always include the system stylesheet, or all type falls back.

## Styling idiom

**No utility classes — style via component props, and use CSS custom properties for your own layout glue.** The tokens defined in `styles.css`:

| Token | Value / use |
|---|---|
| `--dcc-bg` / `--dcc-bg-alt` | #f3efe7 page parchment / #ece7dc alternate section |
| `--dcc-ink` / `--dcc-ink-soft` | #17191c headlines, dark sections / #2c2f34 hover |
| `--dcc-text-body` `--dcc-text-secondary` `--dcc-text-muted` `--dcc-text-label` | #41454b · #494d53 · #5d6168 · #3a3d42 |
| `--dcc-accent` / `--dcc-accent-dark` | #8a6d40 bronze on light / #b79256 bronze on dark |
| `--dcc-on-dark-heading` `--dcc-on-dark-body` `--dcc-on-dark-muted` `--dcc-on-dark-footer` | #ece8e0 · #a9aaa6 · #8c8d89 · #75766f |
| `--dcc-hairline` `--dcc-hairline-divider` `--dcc-hairline-grid` `--dcc-hairline-chip` `--dcc-hairline-on-dark` | rgba-ink 0.10 / 0.12 / 0.18 / 0.20 / white 0.10 |
| `--dcc-font-serif` / `--dcc-font-sans` / `--dcc-font-mono` | Spectral (display, weight 300) / IBM Plex Sans (body) / IBM Plex Mono (labels, uppercase, letterspaced) |

Hard rules: `border-radius: 0` everywhere (no rounded corners, no shadows — structure comes from 1px hairlines); bronze only for kickers, numerals and small marks, never large fills; section containers are `max-width:1160px; padding: 92px 40px`; dark sections use solid `--dcc-ink` full-bleed.

## Components (all on `window.DCC`)

`Button` (variant: primary | secondary | cta-dark), `Kicker` (numbered section opener, e.g. "01 — The constraint"), `SectionHeader` (kicker + Spectral headline + lede; `onDark`/`display` for ink sections), `TagChip`/`TagChipRow`, `LogoMark`, `SiteHeader`, `FeatureCardGrid`, `NumberedList` (roman markers), `ProcessTimeline` (dot-on-rule step rail), `DarkStatement`, `ContactSplit`, `SiteFooter`, `DataTable` (sortable/filterable, colored stage badges). Exported token objects: `colors`, `hairline`, `fonts`, `stageColors`, `typeColors`.

## Where the truth lives

Read `styles.css` (imports `_ds_bundle.css` — all tokens, hover classes, keyframes `dccRiseIn`/`dccLineGrow`) and each component's `.prompt.md` before styling.

## Idiomatic example

```jsx
<section style={{ background: "var(--dcc-bg)", minHeight: "100vh" }}>
  <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "92px 40px" }}>
    <SectionHeader
      kicker="02 — What we do"
      title="Three components, built to work as one rail."
      titleMaxCh={22}
    />
    <div style={{ marginTop: "56px" }}>
      <FeatureCardGrid
        items={[
          { number: "01", title: "The conforming standard", body: "Standardised origination and reporting that make loans homogeneous enough to pool." },
          { number: "02", title: "Securitisation & servicing", body: "Pooling conforming loans into bankruptcy-remote vehicles and distributing tranches." },
          { number: "03", title: "The credit warehouse", body: "A revolving facility that funds origination between securitisations." },
        ]}
      />
    </div>
    <div style={{ display: "flex", gap: "18px", marginTop: "46px" }}>
      <Button size="large">Get in touch</Button>
      <Button variant="secondary">See how it works →</Button>
    </div>
  </div>
</section>
```

Copy voice: precise, institutional, unhyped; sentence-case thesis headlines; British spelling (securitisation).
