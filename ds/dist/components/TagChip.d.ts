import type { ReactNode } from "react";
export interface TagChipProps {
    children: ReactNode;
}
/**
 * Square mono-font chip with a hairline border — used for counterparty tags
 * ("Warehouse SPV", "Rating agencies") under the model diagram.
 */
export declare function TagChip({ children }: TagChipProps): import("react").JSX.Element;
export interface TagChipRowProps {
    /** Chip labels, rendered in a wrapping row */
    items: string[];
}
/** A wrapping row of TagChips with the landing page's 10x8 gap. */
export declare function TagChipRow({ items }: TagChipRowProps): import("react").JSX.Element;
