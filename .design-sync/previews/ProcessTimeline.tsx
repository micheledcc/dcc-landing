import { ProcessTimeline } from "@dcc/design-system";

export function SixStepRail() {
  return (
    <ProcessTimeline
      steps={[
        { number: "01", title: "Origination", body: "A borrower posts BTC to a qualified custodian; the loan is written to the conforming standard." },
        { number: "02", title: "Atomic transfer", body: "The loan transfers into a bankruptcy-remote warehouse at origination — the originator never holds it." },
        { number: "03", title: "Pool & true sale", body: "Seasoned loans are pooled and true-sold into a securitisation vehicle that issues notes in tranches." },
        { number: "04", title: "Rate & enhance", body: "Rating agencies rate the notes; structural and credit enhancement supports the senior tranche." },
        { number: "05", title: "Placement", body: "Insurer and reinsurer accounts buy the senior tranche; structured-credit funds buy the mezzanine." },
        { number: "06", title: "Recycle", body: "Dollar proceeds return to the warehouse to fund the next cohort of originations." },
      ]}
      footnoteLabel="Recycle ♻"
      footnoteText="Dollar securitisation proceeds return to the warehouse to fund the next cohort of originations."
    />
  );
}

export function ThreeSteps() {
  return (
    <ProcessTimeline
      steps={[
        { number: "01", title: "Originate", body: "Loans written to the conforming standard." },
        { number: "02", title: "Pool", body: "Conforming loans pool into a securitisation vehicle." },
        { number: "03", title: "Place", body: "Rated tranches are placed with institutional accounts." },
      ]}
    />
  );
}
