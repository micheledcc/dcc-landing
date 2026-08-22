import { SiteHeader } from "@dcc/design-system";

export function Landing() {
  return (
    <SiteHeader
      links={[
        { label: "What we do", href: "#what" },
        { label: "The model", href: "#model" },
        { label: "Neutrality", href: "#principle" },
      ]}
      ctaLabel="Get in touch"
      ctaHref="#contact"
    />
  );
}

export function LogoOnly() {
  return <SiteHeader links={[]} ctaLabel="" />;
}
