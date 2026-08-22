export interface SiteFooterProps {
    /** Right-aligned small legal text */
    legal?: string;
}
/**
 * Ink footer with a hairline top rule: small muted DCC mark + wordmark
 * left, 12px legal text right.
 */
export declare function SiteFooter({ legal, }: SiteFooterProps): import("react").JSX.Element;
