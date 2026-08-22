import { FeatureCardGrid } from "@dcc/design-system";

export function ThreeRail() {
  return (
    <FeatureCardGrid
      items={[
        {
          number: "01",
          title: "The conforming standard",
          body: "Standardised origination, servicing, collateral management and reporting that make loans from many originators homogeneous enough to pool.",
        },
        {
          number: "02",
          title: "Securitisation arrangement & servicing",
          body: "Pooling conforming loans into bankruptcy-remote vehicles, coordinating the rating and credit enhancement, and distributing the tranches.",
        },
        {
          number: "03",
          title: "The credit warehouse",
          body: "A revolving facility that funds origination between securitisations. The loan transfers off the originator at the moment it is written.",
        },
      ]}
    />
  );
}

export function TwoColumns() {
  return (
    <FeatureCardGrid
      columns={2}
      items={[
        {
          number: "01",
          title: "Neutral by design",
          body: "DCC originates no loans and allocates no capital, so the standard cannot tilt toward its own book.",
        },
        {
          number: "02",
          title: "Bankruptcy-remote",
          body: "Loans live in dedicated vehicles from the moment of origination — never on a single balance sheet.",
        },
      ]}
    />
  );
}
