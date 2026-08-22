import { Button } from "@dcc/design-system";

export function Primary() {
  return <Button variant="primary">Get in touch</Button>;
}

export function PrimaryLarge() {
  return (
    <Button variant="primary" size="large">
      Get in touch
    </Button>
  );
}

export function Secondary() {
  return <Button variant="secondary">See how it works →</Button>;
}

export function CtaOnDark() {
  return (
    <div style={{ background: "#17191c", padding: "32px" }}>
      <Button variant="cta-dark" href="mailto:contact@digitalcollateralcorporation.com">
        Get in touch →
      </Button>
    </div>
  );
}

export function HeroPair() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
      <Button variant="primary" size="large">
        Get in touch
      </Button>
      <Button variant="secondary">See how it works →</Button>
    </div>
  );
}
