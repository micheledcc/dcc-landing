export interface TimelineStep {
    /** Bronze mono number, e.g. "01" */
    number: string;
    title: string;
    body: string;
}
export interface ProcessTimelineProps {
    steps: TimelineStep[];
    /** Optional footnote row under the timeline (mono label + sans text) */
    footnoteLabel?: string;
    footnoteText?: string;
}
/**
 * The end-to-end model timeline: a solid 1px ink rule with 9px ink dots
 * sitting on it, equal hairline-divided columns per step — "originate,
 * pool, rate, place, recycle" on the landing page.
 */
export declare function ProcessTimeline({ steps, footnoteLabel, footnoteText }: ProcessTimelineProps): import("react").JSX.Element;
