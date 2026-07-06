import { landingCss, landingBody } from "./_landing-content";

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: landingCss }} />
      <div dangerouslySetInnerHTML={{ __html: landingBody }} />
    </>
  );
}
