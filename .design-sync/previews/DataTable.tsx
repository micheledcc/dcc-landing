import { DataTable } from "@dcc/design-system";

const HEADERS = ["Name", "Type", "Stage", "Amount ($)", "Prob", "Notes"];
const ROWS = [
  {
    Name: "Meridian Capital",
    Type: "VC",
    Stage: "6 - Signed",
    "Amount ($)": "$500,000",
    Prob: "95%",
    Notes: "Lead for the round; docs signed, wiring scheduled for month end.",
  },
  {
    Name: "R. Alvarez",
    Type: "Angel",
    Stage: "5 - Verbal Commit",
    "Amount ($)": "$100,000",
    Prob: "80%",
    Notes: "Verbal commit at the partner dinner; follow-up sent.",
  },
  {
    Name: "Northgate Partners",
    Type: "VC",
    Stage: "3 - Internal IC",
    "Amount ($)": "$750,000",
    Prob: "45%",
    Notes: "IC scheduled next Thursday; asked for the securitisation model and warehouse terms.",
  },
  {
    Name: "S. Okafor",
    Type: "Advisor",
    Stage: "Advisor",
    "Amount ($)": "$25,000",
    Prob: "100%",
    Notes: "Structured-credit advisor; small advisory cheque.",
  },
  {
    Name: "Beacon Ventures",
    Type: "VC",
    Stage: "0 - Passed",
    "Amount ($)": "$0",
    Prob: "0%",
    Notes: "Passed — no crypto mandate this fund.",
  },
];

export function Pipeline() {
  return <DataTable headers={HEADERS} rows={ROWS} />;
}

export function Compact() {
  return <DataTable headers={HEADERS} rows={ROWS.slice(0, 3)} compact showFilters={false} />;
}

export function PlainNoControls() {
  return (
    <DataTable
      headers={["Name", "Amount ($)", "Notes"]}
      rows={ROWS.slice(0, 3).map(({ Name, Notes, ...r }) => ({ Name, "Amount ($)": r["Amount ($)"], Notes }))}
      showFilters={false}
      showSort={false}
    />
  );
}
