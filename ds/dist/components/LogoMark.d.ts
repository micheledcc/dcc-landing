export interface LogoMarkProps {
    /** Compact 28px footer variant vs 34px header variant */
    size?: "default" | "small";
    /** Muted colors for the dark footer */
    onDark?: boolean;
    /** Hide the wordmark and show only the bordered square */
    markOnly?: boolean;
}
/**
 * The DCC brand mark: a hairline-bordered square containing "DCC" in
 * IBM Plex Mono, beside the uppercase letterspaced wordmark.
 */
export declare function LogoMark({ size, onDark, markOnly }: LogoMarkProps): import("react").JSX.Element;
