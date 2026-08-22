import { LogoMark } from "@dcc/design-system";

export function Header() {
  return <LogoMark />;
}

export function FooterSmall() {
  return (
    <div style={{ background: "#17191c", padding: "24px" }}>
      <LogoMark size="small" onDark />
    </div>
  );
}

export function MarkOnly() {
  return <LogoMark markOnly />;
}
