# DCC Design System — prompt for Claude Design

Paste everything below this line into claude.ai/design to build the Digital Collateral Corporation design system from the landing page.

---

Build a design system called **DCC — Digital Collateral Corporation** that exactly matches my live landing page (https://dcc-landing-omega.vercel.app). It is an institutional, editorial, print-inspired aesthetic for a Bitcoin-backed credit securitisation company: warm parchment surfaces, near-black ink, bronze accents, hairline rules, sharp corners, serif display type. Think rating-agency report meets modernist financial print design.

## Fonts

Load from Google Fonts: `Spectral` (300, 400, 500), `IBM Plex Sans` (400, 500, 600), `IBM Plex Mono` (400, 500).

- **Display / headlines**: Spectral, weight 300, line-height 1.04–1.12, letter-spacing -0.015em. Hero: clamp(40px, 6vw, 76px); section H2: clamp(28px, 3.4vw, 42px); card H3: Spectral 400 at 22px.
- **Body / UI**: IBM Plex Sans. Lede: 17–20px at line-height 1.6; body: 14.5–15px at 1.55–1.6; small: 12.5px.
- **Labels / kickers / nav / chips**: IBM Plex Mono, 10.5–12px, uppercase, wide letter-spacing (0.06em nav, 0.18em kickers, 0.22–0.24em brand lines).

## Color tokens

Light surfaces:
- `--bg`: #f3efe7 (warm parchment, page background)
- `--bg-alt`: #ece7dc (darker parchment, alternate sections)
- `--ink`: #17191c (near-black — headlines, primary buttons, dark sections)
- `--ink-soft`: #2c2f34 (hover on primary button)
- `--text-body`: #41454b; secondary #494d53; muted #5d6168; label #3a3d42
- `--accent`: #8a6d40 (bronze — kickers, numerals, small marks on light)
- `--hairline`: rgba(23,25,28,0.10) section rules · 0.12 inner dividers · 0.18 card grids · 0.20 chip borders

Dark (ink) surfaces (#17191c):
- headings #ece8e0 · body #a9aaa6 · muted #8c8d89 · footer text #75766f
- `--accent-dark`: #b79256 (bronze brightens on dark)
- hairline: rgba(255,255,255,0.10)

Data/status palette (from the dashboard's DataTable): progression scale #b9b2a4 → #a09484 → #8a6d40 → #6d5530 → #3a7c5f → #2d6a4f → #1b4332; negative #c44; neutral #5d6168.

Selection: background #17191c, color #f3efe7.

## Rules of the system

- **Sharp corners everywhere.** border-radius: 0 on every component (only exception: 9px timeline dots, which are circles).
- **Hairlines structure everything.** Sections separate with 1px rgba-ink rules, card grids use shared 1px borders (no gaps, no shadows), lists are rows divided by hairlines. Never use drop shadows.
- **Bronze is a whisper, not a theme.** #8a6d40 appears only in mono-font kickers, roman/arabic numerals (01, 02, i, ii, iii), and tiny marks.
- **Numbered editorial kickers** introduce every section: IBM Plex Mono 11px, letter-spacing 0.18em, uppercase, bronze — e.g. `01 — The constraint`.
- Layout container: max-width 1160px, 40px side padding; section vertical padding 92–104px.

## Components to build

1. **Header**: sticky, 74px, background rgba(243,239,231,0.86) with backdrop-filter blur(10px), bottom hairline. Left: logo — a 34px square with 1px ink border containing "DCC" in Plex Mono 11px, beside "DIGITAL COLLATERAL CORPORATION" in Plex Mono 10.5px, letter-spacing 0.22em. Right: mono uppercase nav links (11.5px, #3a3d42, hover → ink) + primary button.
2. **Buttons** (all square): Primary — solid #17191c, text #f3efe7, Plex Sans 500, padding 15px 30px, hover #2c2f34. Secondary — text-only with 1px bottom border rgba(23,25,28,0.35), hover border → ink, often with a trailing →. CTA-on-dark — solid #ece8e0 with ink text, hover → #fff.
3. **Tag chip**: Plex Mono 11px, 1px border rgba(23,25,28,0.2), padding 7px 13px, no radius.
4. **Section header block**: bronze numbered kicker + Spectral 300 H2, optionally two-column with a narrow lede paragraph.
5. **Feature card grid**: 3 columns, gap 0, shared hairline borders (top rule 0.18 alpha), each cell padded 34px 30px 40px with bronze mono numeral, Spectral H3 22px, Plex Sans body 14.5px.
6. **Numbered list rows**: hairline-divided rows, bronze roman numeral (i, ii, iii) in Plex Mono 12px on the left, body text right.
7. **Process timeline**: solid 1px ink top rule with 9px ink dots sitting on it, 6 equal columns divided by hairlines; each step has bronze mono number, Plex Sans 600 14px title, 12.5px muted description. Collapses to 3 then 2 columns on mobile.
8. **Dark statement section**: full-bleed #17191c, bronze #b79256 kicker, huge Spectral 300 headline (clamp up to 58–60px) in #ece8e0, body in #a9aaa6.
9. **Contact split**: dark section, two columns aligned to baseline — headline block left, inverted CTA button + mono email line right.
10. **Footer**: on ink, hairline top rule rgba(255,255,255,0.1), small bordered DCC mark in #75766f, mono brand line, right-aligned 12px legal text in #75766f.
11. **DataTable** (dashboard): dense financial table with sortable mono-label headers, per-column filters, resizable columns, and stage/type badges using the data/status palette above — same parchment/ink/hairline treatment, compact variant included.

## Motion

Subtle and few: `riseIn` (fade up 14px) for content entering, `lineGrow` (scaleX 0→1) for rules drawing in. Color transitions on hover only. Nothing bouncy.

## Voice

Copy is precise, institutional, unhyped: "Neutral by design", "Bankruptcy-remote vehicles", "Engineered for the senior band". Sentence-case headlines that read like theses. British spelling (securitisation).
