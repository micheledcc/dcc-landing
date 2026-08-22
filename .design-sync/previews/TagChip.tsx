import { TagChip } from "@dcc/design-system";

export function Single() {
  return <TagChip>Warehouse SPV</TagChip>;
}

export function Several() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 8px" }}>
      <TagChip>Conforming originators</TagChip>
      <TagChip>Qualified custodian</TagChip>
      <TagChip>Rating agencies</TagChip>
    </div>
  );
}
