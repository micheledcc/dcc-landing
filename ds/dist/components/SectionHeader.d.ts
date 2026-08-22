export interface SectionHeaderProps {
    /** Kicker line above the title, e.g. "02 — What we do" */
    kicker?: string;
    /** Section headline, set in Spectral 300 */
    title: string;
    /** Optional lede paragraph under (or beside) the title */
    lede?: string;
    /** Max title width in ch units (landing uses 16–22) */
    titleMaxCh?: number;
    /** On dark ink sections: light heading, brighter bronze, muted body */
    onDark?: boolean;
    /** Larger display size for statement sections (up to 58px vs 42px) */
    display?: boolean;
}
/**
 * DCC section header: bronze numbered kicker + Spectral 300 headline,
 * optionally with a lede. The standard opening block of every section.
 */
export declare function SectionHeader({ kicker, title, lede, titleMaxCh, onDark, display }: SectionHeaderProps): import("react").JSX.Element;
