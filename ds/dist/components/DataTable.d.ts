export interface DataTableProps {
    /** Column headers, in display order. Headers starting with "_" are hidden. */
    headers: string[];
    /** Row objects keyed by header. "Stage" and "Type" columns render as badges. */
    rows: Record<string, string>[];
    /** Show the per-column dropdown filter row (default true) */
    showFilters?: boolean;
    /** Make headers click-to-sort (default true) */
    showSort?: boolean;
    /** Tighter row padding and smaller text */
    compact?: boolean;
}
/**
 * Dense financial data table in the DCC idiom: parchment-adjacent white
 * surface, hairline borders, mono uppercase headers, sortable columns,
 * per-column filters, resizable columns, and colored stage/type badges
 * (pipeline progression scale). No rounded corners, no shadows.
 */
export declare function DataTable({ headers, rows, showFilters, showSort, compact }: DataTableProps): import("react").JSX.Element;
