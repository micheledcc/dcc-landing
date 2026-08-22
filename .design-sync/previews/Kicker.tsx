import { Kicker } from "@dcc/design-system";

export function Numbered() {
  return <Kicker marginBottom={0}>01 — The constraint</Kicker>;
}

export function HeroWide() {
  return (
    <Kicker wide marginBottom={0}>
      Conforming &amp; Securitisation Infrastructure
    </Kicker>
  );
}

export function OnDark() {
  return (
    <div style={{ background: "#17191c", padding: "24px" }}>
      <Kicker onDark marginBottom={0}>
        04 — The principle
      </Kicker>
    </div>
  );
}
