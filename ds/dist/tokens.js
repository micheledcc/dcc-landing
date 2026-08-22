/**
 * DCC design tokens — extracted verbatim from the landing page.
 * Warm parchment surfaces, near-black ink, bronze accents.
 */
export const colors = {
    /** Warm parchment — the page background */
    bg: "#f3efe7",
    /** Darker parchment — alternate sections */
    bgAlt: "#ece7dc",
    /** Near-black ink — headlines, primary buttons, dark sections */
    ink: "#17191c",
    /** Ink hover state for primary buttons */
    inkSoft: "#2c2f34",
    /** Body text on light */
    textBody: "#41454b",
    /** Secondary body text on light */
    textSecondary: "#494d53",
    /** Muted text on light */
    textMuted: "#5d6168",
    /** Label / nav text on light */
    textLabel: "#3a3d42",
    /** Bronze accent on light surfaces */
    accent: "#8a6d40",
    /** Bronze accent on dark surfaces */
    accentDark: "#b79256",
    /** Headings on dark surfaces */
    onDarkHeading: "#ece8e0",
    /** Body text on dark surfaces */
    onDarkBody: "#a9aaa6",
    /** Muted text on dark surfaces */
    onDarkMuted: "#8c8d89",
    /** Footer text on dark surfaces */
    onDarkFooter: "#75766f",
    /** Neutral sand (dividers, early pipeline stages) */
    sand: "#b9b2a4",
    /** Negative / passed */
    negative: "#c44",
};
export const hairline = {
    /** Section rules */
    section: "rgba(23,25,28,0.1)",
    /** Inner dividers, list rows */
    divider: "rgba(23,25,28,0.12)",
    /** Card grids */
    grid: "rgba(23,25,28,0.18)",
    /** Chip borders */
    chip: "rgba(23,25,28,0.2)",
    /** On dark surfaces */
    onDark: "rgba(255,255,255,0.1)",
};
export const fonts = {
    /** Display / headlines — Spectral 300 */
    serif: "'Spectral',Georgia,serif",
    /** Body / UI — IBM Plex Sans */
    sans: "'IBM Plex Sans',system-ui,sans-serif",
    /** Labels, kickers, nav, chips — IBM Plex Mono */
    mono: "'IBM Plex Mono',monospace",
};
/** Pipeline-stage badge colors used by DataTable (progression scale) */
export const stageColors = {
    "1 - Outreach": "#b9b2a4",
    "2 - Pitch": "#a09484",
    "3 - Internal IC": "#8a6d40",
    "4 - Final DD": "#6d5530",
    "5 - Verbal Commit": "#3a7c5f",
    "6 - Signed": "#2d6a4f",
    "7 - Wired": "#1b4332",
    Advisor: "#5d6168",
    "0 - Passed": "#c44",
};
/** Counterparty-type badge colors used by DataTable */
export const typeColors = {
    Angel: "#8a6d40",
    VC: "#17191c",
    Advisor: "#5d6168",
};
