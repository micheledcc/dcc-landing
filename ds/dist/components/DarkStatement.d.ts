import type { ReactNode } from "react";
export interface DarkStatementProps {
    /** Bronze kicker, e.g. "04 — The principle" */
    kicker?: string;
    /** Large Spectral 300 statement headline */
    title: string;
    /** Muted body paragraph under the headline */
    body?: string;
    /** Max headline width in ch units (landing uses 18) */
    titleMaxCh?: number;
    /** Extra content below the body */
    children?: ReactNode;
}
/**
 * Full-bleed ink (#17191c) statement section with a bright-bronze kicker
 * and a huge light Spectral headline — the "DCC originates no loans"
 * section on the landing page.
 */
export declare function DarkStatement({ kicker, title, body, titleMaxCh, children }: DarkStatementProps): import("react").JSX.Element;
