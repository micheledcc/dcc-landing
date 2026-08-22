import { SectionHeader } from "@dcc/design-system";

export function WithKicker() {
  return (
    <SectionHeader
      kicker="01 — The constraint"
      title="Bitcoin-backed lending is structurally undersupplied."
      titleMaxCh={26}
    />
  );
}

export function WithLede() {
  return (
    <SectionHeader
      kicker="02 — What we do"
      title="Three components, built to work as one rail."
      lede="A neutral standard that lets loans originated by different lenders pool into rated, institutionally-ownable securities."
      titleMaxCh={22}
    />
  );
}

export function OnDarkDisplay() {
  return (
    <div style={{ background: "#17191c", padding: "48px 40px" }}>
      <SectionHeader
        kicker="04 — The principle"
        title="DCC originates no loans and allocates no capital."
        lede="Neutrality is built into the structure — which is what lets every originator and every capital source rely on it."
        titleMaxCh={18}
        onDark
        display
      />
    </div>
  );
}
