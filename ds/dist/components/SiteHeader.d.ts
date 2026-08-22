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
export declare function SiteHeader({ links, ctaLabel, ctaHref }: SiteHeaderProps): import("react").JSX.Element;
