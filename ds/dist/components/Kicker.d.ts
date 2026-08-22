export interface KickerProps {
    /** Full kicker text, e.g. "01 — The constraint" or "Conforming & Securitisation Infrastructure" */
    children: string;
    /** Bronze brightens on dark (#b79256) */
    onDark?: boolean;
    /** Wider tracking for standalone hero kickers (0.24em vs 0.18em) */
    wide?: boolean;
    /** Bottom margin in px (landing uses 20–34) */
    marginBottom?: number;
}
/**
 * Numbered editorial kicker that opens every DCC section — IBM Plex Mono,
 * uppercase, wide letter-spacing, bronze. E.g. "01 — The constraint".
 */
export declare function Kicker({ children, onDark, wide, marginBottom }: KickerProps): import("react").JSX.Element;
