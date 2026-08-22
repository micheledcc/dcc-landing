/**
 * DCC design tokens — extracted verbatim from the landing page.
 * Warm parchment surfaces, near-black ink, bronze accents.
 */
export declare const colors: {
    /** Warm parchment — the page background */
    readonly bg: "#f3efe7";
    /** Darker parchment — alternate sections */
    readonly bgAlt: "#ece7dc";
    /** Near-black ink — headlines, primary buttons, dark sections */
    readonly ink: "#17191c";
    /** Ink hover state for primary buttons */
    readonly inkSoft: "#2c2f34";
    /** Body text on light */
    readonly textBody: "#41454b";
    /** Secondary body text on light */
    readonly textSecondary: "#494d53";
    /** Muted text on light */
    readonly textMuted: "#5d6168";
    /** Label / nav text on light */
    readonly textLabel: "#3a3d42";
    /** Bronze accent on light surfaces */
    readonly accent: "#8a6d40";
    /** Bronze accent on dark surfaces */
    readonly accentDark: "#b79256";
    /** Headings on dark surfaces */
    readonly onDarkHeading: "#ece8e0";
    /** Body text on dark surfaces */
    readonly onDarkBody: "#a9aaa6";
    /** Muted text on dark surfaces */
    readonly onDarkMuted: "#8c8d89";
    /** Footer text on dark surfaces */
    readonly onDarkFooter: "#75766f";
    /** Neutral sand (dividers, early pipeline stages) */
    readonly sand: "#b9b2a4";
    /** Negative / passed */
    readonly negative: "#c44";
};
export declare const hairline: {
    /** Section rules */
    readonly section: "rgba(23,25,28,0.1)";
    /** Inner dividers, list rows */
    readonly divider: "rgba(23,25,28,0.12)";
    /** Card grids */
    readonly grid: "rgba(23,25,28,0.18)";
    /** Chip borders */
    readonly chip: "rgba(23,25,28,0.2)";
    /** On dark surfaces */
    readonly onDark: "rgba(255,255,255,0.1)";
};
export declare const fonts: {
    /** Display / headlines — Spectral 300 */
    readonly serif: "'Spectral',Georgia,serif";
    /** Body / UI — IBM Plex Sans */
    readonly sans: "'IBM Plex Sans',system-ui,sans-serif";
    /** Labels, kickers, nav, chips — IBM Plex Mono */
    readonly mono: "'IBM Plex Mono',monospace";
};
/** Pipeline-stage badge colors used by DataTable (progression scale) */
export declare const stageColors: Record<string, string>;
/** Counterparty-type badge colors used by DataTable */
export declare const typeColors: Record<string, string>;
