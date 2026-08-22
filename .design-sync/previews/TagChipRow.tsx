import { TagChipRow } from "@dcc/design-system";

export function Counterparties() {
  return (
    <TagChipRow
      items={[
        "Conforming originators",
        "Qualified custodian",
        "Warehouse SPV",
        "Securitisation SPV",
        "Rating agencies",
        "Insurer & reinsurer accounts",
        "Structured-credit funds",
      ]}
    />
  );
}
