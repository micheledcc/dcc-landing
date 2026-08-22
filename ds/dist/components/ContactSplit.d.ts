export interface ContactSplitProps {
    kicker?: string;
    title?: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
    /** Mono email line shown under the CTA */
    email?: string;
}
/**
 * Dark contact section: two columns aligned to baseline — Spectral headline
 * block left, inverted parchment CTA + mono email line right.
 */
export declare function ContactSplit({ kicker, title, body, ctaLabel, ctaHref, email, }: ContactSplitProps): import("react").JSX.Element;
