export interface FeatureCard {
    /** Bronze mono numeral above the title, e.g. "01" */
    number: string;
    title: string;
    body: string;
}
export interface FeatureCardGridProps {
    items: FeatureCard[];
    /** Grid columns (landing uses 3) */
    columns?: number;
}
/**
 * Hairline-bordered feature grid: cells share 1px rules with no gaps and no
 * shadows. Each cell carries a bronze mono numeral, a Spectral 400 title,
 * and a Plex Sans body — the "Three components, built to work as one rail"
 * grid on the landing page.
 */
export declare function FeatureCardGrid({ items, columns }: FeatureCardGridProps): import("react").JSX.Element;
