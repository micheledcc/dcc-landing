import type { CSSProperties, ReactNode } from "react";
export interface ButtonProps {
    /** Visual variant: solid ink, hairline-underlined text, or inverted for dark sections */
    variant?: "primary" | "secondary" | "cta-dark";
    /** Link target; renders an <a>. Omit for a <button>. */
    href?: string;
    /** Larger padding for hero placement */
    size?: "default" | "large";
    onClick?: () => void;
    children: ReactNode;
    style?: CSSProperties;
}
/**
 * DCC button. Square corners always. Primary is solid ink on parchment;
 * secondary is text with a hairline bottom border (usually with a trailing →);
 * cta-dark is the inverted parchment-on-ink button used in dark sections.
 */
export declare function Button({ variant, href, size, onClick, children, style }: ButtonProps): import("react").JSX.Element;
