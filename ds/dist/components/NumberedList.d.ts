export interface NumberedListItem {
    /** Bronze mono marker, e.g. roman "i", "ii", "iii" */
    marker: string;
    text: string;
}
export interface NumberedListProps {
    items: NumberedListItem[];
}
/**
 * Hairline-divided list rows with a bronze mono marker column — the
 * roman-numeral constraint list ("i / ii / iii") on the landing page.
 */
export declare function NumberedList({ items }: NumberedListProps): import("react").JSX.Element;
