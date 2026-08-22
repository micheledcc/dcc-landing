import { NumberedList } from "@dcc/design-system";

export function RomanConstraints() {
  return (
    <NumberedList
      items={[
        {
          marker: "i",
          text: "Borrower options are each sub-optimal — and today's market structure supports little beyond vanilla Lombard loans.",
        },
        {
          marker: "ii",
          text: "Smaller and mid-tier originators are locked out of cheap capital: the fixed costs of rating, structuring and reporting do not amortise over their volume.",
        },
        {
          marker: "iii",
          text: "Institutional capital cannot reach the asset. Insurers, reinsurers, pension funds and banks can hold rated securities — not bespoke whole loans.",
        },
      ]}
    />
  );
}
