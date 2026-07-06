export const landingCss = `
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;background:#f3efe7;}
  body{font-family:'IBM Plex Sans',system-ui,sans-serif;color:#17191c;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
  ::selection{background:#17191c;color:#f3efe7;}
  a{color:inherit;text-decoration:none;}
  @keyframes riseIn{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  @keyframes lineGrow{from{transform:scaleX(0);}to{transform:scaleX(1);}}

  /* Hover states */
  .nav-link:hover{color:#17191c !important;}
  .btn-primary:hover{background:#2c2f34 !important;}
  .btn-secondary:hover{border-bottom-color:#17191c !important;}
  .btn-cta:hover{background:#fff !important;}

  /* Responsive */
  @media(max-width:900px){
    .hero-grid{grid-template-columns:1fr !important;}
    .constraint-grid{grid-template-columns:1fr !important;}
    .components-grid{grid-template-columns:1fr !important;}
    .flow-grid{grid-template-columns:repeat(3,1fr) !important;}
    .contact-grid{grid-template-columns:1fr !important;}
    nav{display:none !important;}
  }
  @media(max-width:600px){
    .flow-grid{grid-template-columns:repeat(2,1fr) !important;}
    .tags-wrap{justify-content:center;}
  }
`;

export const landingBody = `<div style="background:#f3efe7;min-height:100vh;overflow-x:hidden;">

  <!-- ===== HEADER ===== -->
  <header style="position:sticky;top:0;z-index:50;background:rgba(243,239,231,0.86);backdrop-filter:blur(10px);border-bottom:1px solid rgba(23,25,28,0.1);">
    <div style="max-width:1160px;margin:0 auto;padding:0 40px;height:74px;display:flex;align-items:center;justify-content:space-between;">
      <a href="#top" style="display:flex;align-items:center;gap:14px;">
        <span style="width:34px;height:34px;border:1px solid #17191c;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;letter-spacing:0.04em;">DCC</span>
        <span style="font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:0.22em;color:#3a3d42;text-transform:uppercase;">Digital&nbsp;Collateral&nbsp;Corporation</span>
      </a>
      <nav style="display:flex;align-items:center;gap:34px;">
        <a href="#what" class="nav-link" style="font-family:'IBM Plex Mono',monospace;font-size:11.5px;letter-spacing:0.06em;color:#3a3d42;text-transform:uppercase;">What we do</a>
        <a href="#model" class="nav-link" style="font-family:'IBM Plex Mono',monospace;font-size:11.5px;letter-spacing:0.06em;color:#3a3d42;text-transform:uppercase;">The model</a>
        <a href="#principle" class="nav-link" style="font-family:'IBM Plex Mono',monospace;font-size:11.5px;letter-spacing:0.06em;color:#3a3d42;text-transform:uppercase;">Neutrality</a>
        <a href="#contact" class="btn-primary" style="font-family:'IBM Plex Sans',sans-serif;font-size:13px;font-weight:500;letter-spacing:0.01em;background:#17191c;color:#f3efe7;padding:11px 20px;">Get in touch</a>
      </nav>
    </div>
  </header>

  <!-- ===== HERO ===== -->
  <section id="top" style="max-width:1160px;margin:0 auto;padding:118px 40px 96px;">
    <div style="font-family:'IBM Plex Mono',monospace;font-size:11.5px;letter-spacing:0.24em;color:#8a6d40;text-transform:uppercase;margin-bottom:34px;">Conforming &amp; Securitisation Infrastructure</div>
    <h1 style="font-family:'Spectral',Georgia,serif;font-weight:300;font-size:clamp(40px,6vw,76px);line-height:1.04;letter-spacing:-0.015em;margin:0;max-width:16ch;">The conforming and securitisation layer for Bitcoin-backed credit.</h1>
    <p style="font-family:'IBM Plex Sans',sans-serif;font-size:clamp(17px,1.7vw,20px);line-height:1.6;color:#41454b;max-width:60ch;margin:38px 0 0;font-weight:400;">A neutral standard that lets loans originated by different lenders pool into rated, institutionally-ownable securities &mdash; relieving the supply, cost and product constraints of the market at once.</p>
    <div style="display:flex;align-items:center;gap:18px;margin-top:46px;">
      <a href="#contact" class="btn-primary" style="font-family:'IBM Plex Sans',sans-serif;font-size:14.5px;font-weight:500;background:#17191c;color:#f3efe7;padding:15px 30px;">Get in touch</a>
      <a href="#model" class="btn-secondary" style="font-family:'IBM Plex Sans',sans-serif;font-size:14.5px;font-weight:500;color:#17191c;padding:15px 6px;border-bottom:1px solid rgba(23,25,28,0.35);">See how it works &rarr;</a>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:14px 30px;margin-top:74px;padding-top:26px;border-top:1px solid rgba(23,25,28,0.12);">
      <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.1em;color:#5d6168;text-transform:uppercase;">Neutral by design</span>
      <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#b9b2a4;">/</span>
      <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.1em;color:#5d6168;text-transform:uppercase;">Bankruptcy-remote vehicles</span>
      <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#b9b2a4;">/</span>
      <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.1em;color:#5d6168;text-transform:uppercase;">Engineered for the senior band</span>
    </div>
  </section>

  <!-- ===== CONSTRAINT ===== -->
  <section style="border-top:1px solid rgba(23,25,28,0.1);">
    <div class="constraint-grid" style="max-width:1160px;margin:0 auto;padding:92px 40px;display:grid;grid-template-columns:0.85fr 1.15fr;gap:64px;">
      <div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.18em;color:#8a6d40;text-transform:uppercase;margin-bottom:20px;">01 &mdash; The constraint</div>
        <h2 style="font-family:'Spectral',Georgia,serif;font-weight:300;font-size:clamp(28px,3.4vw,42px);line-height:1.12;letter-spacing:-0.01em;margin:0;">Bitcoin-backed lending is structurally undersupplied.</h2>
      </div>
      <div>
        <p style="font-family:'IBM Plex Sans',sans-serif;font-size:17px;line-height:1.62;color:#41454b;margin:0 0 28px;max-width:54ch;">With no secondary market, originators carry loans on their own balance sheet. Total supply is capped by the balance sheets of a handful of lenders, and the floor cost of capital stays structurally high.</p>
        <div style="display:flex;flex-direction:column;border-top:1px solid rgba(23,25,28,0.12);">
          <div style="display:flex;gap:22px;padding:20px 0;border-bottom:1px solid rgba(23,25,28,0.12);">
            <span style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:#8a6d40;padding-top:2px;flex:none;width:26px;">i</span>
            <p style="font-family:'IBM Plex Sans',sans-serif;font-size:15px;line-height:1.55;color:#2c2f34;margin:0;">Borrower options are each sub-optimal &mdash; and today&rsquo;s market structure supports little beyond vanilla Lombard loans.</p>
          </div>
          <div style="display:flex;gap:22px;padding:20px 0;border-bottom:1px solid rgba(23,25,28,0.12);">
            <span style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:#8a6d40;padding-top:2px;flex:none;width:26px;">ii</span>
            <p style="font-family:'IBM Plex Sans',sans-serif;font-size:15px;line-height:1.55;color:#2c2f34;margin:0;">Smaller and mid-tier originators are locked out of cheap capital: the fixed costs of rating, structuring and reporting do not amortise over their volume.</p>
          </div>
          <div style="display:flex;gap:22px;padding:20px 0;border-bottom:1px solid rgba(23,25,28,0.12);">
            <span style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:#8a6d40;padding-top:2px;flex:none;width:26px;">iii</span>
            <p style="font-family:'IBM Plex Sans',sans-serif;font-size:15px;line-height:1.55;color:#2c2f34;margin:0;">Institutional capital cannot reach the asset. Insurers, reinsurers, pension funds and banks can hold rated securities &mdash; not bespoke whole loans.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== WHAT WE DO ===== -->
  <section id="what" style="background:#ece7dc;border-top:1px solid rgba(23,25,28,0.1);">
    <div style="max-width:1160px;margin:0 auto;padding:92px 40px;">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.18em;color:#8a6d40;text-transform:uppercase;margin-bottom:20px;">02 &mdash; What we do</div>
      <h2 style="font-family:'Spectral',Georgia,serif;font-weight:300;font-size:clamp(28px,3.4vw,42px);line-height:1.12;letter-spacing:-0.01em;margin:0 0 56px;max-width:22ch;">Three components, built to work as one rail.</h2>
      <div class="components-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid rgba(23,25,28,0.18);">
        <div style="padding:34px 30px 40px;border-bottom:1px solid rgba(23,25,28,0.18);">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:#8a6d40;margin-bottom:26px;">01</div>
          <h3 style="font-family:'Spectral',Georgia,serif;font-weight:400;font-size:22px;line-height:1.2;margin:0 0 14px;">The conforming standard</h3>
          <p style="font-family:'IBM Plex Sans',sans-serif;font-size:14.5px;line-height:1.6;color:#494d53;margin:0;">Standardised origination, servicing, collateral management and reporting that make loans from many originators homogeneous enough to pool &mdash; something no single originator can manufacture alone.</p>
        </div>
        <div style="padding:34px 30px 40px;border-bottom:1px solid rgba(23,25,28,0.18);">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:#8a6d40;margin-bottom:26px;">02</div>
          <h3 style="font-family:'Spectral',Georgia,serif;font-weight:400;font-size:22px;line-height:1.2;margin:0 0 14px;">Securitisation arrangement &amp; servicing</h3>
          <p style="font-family:'IBM Plex Sans',sans-serif;font-size:14.5px;line-height:1.6;color:#494d53;margin:0;">Pooling conforming loans into bankruptcy-remote vehicles, coordinating the rating and credit enhancement, and distributing the tranches to institutional accounts.</p>
        </div>
        <div style="padding:34px 30px 40px;border-bottom:1px solid rgba(23,25,28,0.18);">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:#8a6d40;margin-bottom:26px;">03</div>
          <h3 style="font-family:'Spectral',Georgia,serif;font-weight:400;font-size:22px;line-height:1.2;margin:0 0 14px;">The credit warehouse</h3>
          <p style="font-family:'IBM Plex Sans',sans-serif;font-size:14.5px;line-height:1.6;color:#494d53;margin:0;">A revolving facility that funds origination between securitisations. The loan transfers off the originator at the moment it is written, so it is never carried on a single balance sheet.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== THE MODEL / FLOW ===== -->
  <section id="model" style="border-top:1px solid rgba(23,25,28,0.1);">
    <div style="max-width:1160px;margin:0 auto;padding:92px 40px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:24px;margin-bottom:54px;">
        <div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.18em;color:#8a6d40;text-transform:uppercase;margin-bottom:20px;">03 &mdash; The model, end to end</div>
          <h2 style="font-family:'Spectral',Georgia,serif;font-weight:300;font-size:clamp(28px,3.4vw,42px);line-height:1.12;letter-spacing:-0.01em;margin:0;max-width:20ch;">A revolving rail: originate, pool, rate, place, recycle.</h2>
        </div>
        <p style="font-family:'IBM Plex Sans',sans-serif;font-size:14.5px;line-height:1.6;color:#494d53;margin:0;max-width:34ch;">Each cohort of lending is funded by the proceeds of the prior cohort&rsquo;s securitisation. Counterparties are shown generically.</p>
      </div>

      <div style="position:relative;border-top:1px solid #17191c;">
        <div class="flow-grid" style="display:grid;grid-template-columns:repeat(6,1fr);">
          <div style="padding:0 18px 0 14px;border-right:1px solid rgba(23,25,28,0.12);position:relative;">
            <div style="width:9px;height:9px;background:#17191c;border-radius:50%;position:absolute;top:-5px;left:0;"></div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8a6d40;margin:22px 0 14px;">01</div>
            <h3 style="font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:14px;letter-spacing:0.01em;margin:0 0 10px;line-height:1.25;">Origination</h3>
            <p style="font-family:'IBM Plex Sans',sans-serif;font-size:12.5px;line-height:1.5;color:#5d6168;margin:0 0 28px;">A borrower posts BTC to a qualified custodian; the loan is written to the conforming standard.</p>
          </div>
          <div style="padding:0 18px 0 14px;border-right:1px solid rgba(23,25,28,0.12);position:relative;">
            <div style="width:9px;height:9px;background:#17191c;border-radius:50%;position:absolute;top:-5px;left:0;"></div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8a6d40;margin:22px 0 14px;">02</div>
            <h3 style="font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:14px;letter-spacing:0.01em;margin:0 0 10px;line-height:1.25;">Atomic transfer</h3>
            <p style="font-family:'IBM Plex Sans',sans-serif;font-size:12.5px;line-height:1.5;color:#5d6168;margin:0 0 28px;">The loan transfers into a bankruptcy-remote warehouse at origination &mdash; the originator never holds it.</p>
          </div>
          <div style="padding:0 18px 0 14px;border-right:1px solid rgba(23,25,28,0.12);position:relative;">
            <div style="width:9px;height:9px;background:#17191c;border-radius:50%;position:absolute;top:-5px;left:0;"></div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8a6d40;margin:22px 0 14px;">03</div>
            <h3 style="font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:14px;letter-spacing:0.01em;margin:0 0 10px;line-height:1.25;">Pool &amp; true sale</h3>
            <p style="font-family:'IBM Plex Sans',sans-serif;font-size:12.5px;line-height:1.5;color:#5d6168;margin:0 0 28px;">Seasoned loans are pooled and true-sold into a securitisation vehicle that issues notes in tranches.</p>
          </div>
          <div style="padding:0 18px 0 14px;border-right:1px solid rgba(23,25,28,0.12);position:relative;">
            <div style="width:9px;height:9px;background:#17191c;border-radius:50%;position:absolute;top:-5px;left:0;"></div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8a6d40;margin:22px 0 14px;">04</div>
            <h3 style="font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:14px;letter-spacing:0.01em;margin:0 0 10px;line-height:1.25;">Rate &amp; enhance</h3>
            <p style="font-family:'IBM Plex Sans',sans-serif;font-size:12.5px;line-height:1.5;color:#5d6168;margin:0 0 28px;">Rating agencies rate the notes; structural and credit enhancement supports the senior tranche.</p>
          </div>
          <div style="padding:0 18px 0 14px;border-right:1px solid rgba(23,25,28,0.12);position:relative;">
            <div style="width:9px;height:9px;background:#17191c;border-radius:50%;position:absolute;top:-5px;left:0;"></div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8a6d40;margin:22px 0 14px;">05</div>
            <h3 style="font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:14px;letter-spacing:0.01em;margin:0 0 10px;line-height:1.25;">Placement</h3>
            <p style="font-family:'IBM Plex Sans',sans-serif;font-size:12.5px;line-height:1.5;color:#5d6168;margin:0 0 28px;">Insurer and reinsurer accounts buy the senior tranche; structured-credit funds buy the mezzanine.</p>
          </div>
          <div style="padding:0 18px 0 14px;position:relative;">
            <div style="width:9px;height:9px;background:#17191c;border-radius:50%;position:absolute;top:-5px;left:0;"></div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8a6d40;margin:22px 0 14px;">06</div>
            <h3 style="font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:14px;letter-spacing:0.01em;margin:0 0 10px;line-height:1.25;">Recycle</h3>
            <p style="font-family:'IBM Plex Sans',sans-serif;font-size:12.5px;line-height:1.5;color:#5d6168;margin:0 0 28px;">Dollar proceeds return to the warehouse to fund the next cohort of originations.</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding-top:18px;border-top:1px solid rgba(23,25,28,0.12);">
          <span style="font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:0.14em;color:#8a6d40;text-transform:uppercase;">Recycle &#x267B;</span>
          <span style="font-family:'IBM Plex Sans',sans-serif;font-size:12.5px;color:#5d6168;">Dollar securitisation proceeds return to the warehouse to fund the next cohort of originations.</span>
        </div>
      </div>

      <div class="tags-wrap" style="display:flex;flex-wrap:wrap;gap:10px 8px;margin-top:48px;">
        <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.04em;color:#3a3d42;border:1px solid rgba(23,25,28,0.2);padding:7px 13px;">Conforming originators</span>
        <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.04em;color:#3a3d42;border:1px solid rgba(23,25,28,0.2);padding:7px 13px;">Qualified custodian</span>
        <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.04em;color:#3a3d42;border:1px solid rgba(23,25,28,0.2);padding:7px 13px;">Warehouse SPV</span>
        <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.04em;color:#3a3d42;border:1px solid rgba(23,25,28,0.2);padding:7px 13px;">Securitisation SPV</span>
        <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.04em;color:#3a3d42;border:1px solid rgba(23,25,28,0.2);padding:7px 13px;">Rating agencies</span>
        <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.04em;color:#3a3d42;border:1px solid rgba(23,25,28,0.2);padding:7px 13px;">Insurer &amp; reinsurer accounts</span>
        <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.04em;color:#3a3d42;border:1px solid rgba(23,25,28,0.2);padding:7px 13px;">Structured-credit funds</span>
      </div>
    </div>
  </section>

  <!-- ===== PRINCIPLE / NEUTRALITY ===== -->
  <section id="principle" style="background:#17191c;color:#ece8e0;">
    <div style="max-width:1160px;margin:0 auto;padding:104px 40px;">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.18em;color:#b79256;text-transform:uppercase;margin-bottom:34px;">04 &mdash; The principle</div>
      <h2 style="font-family:'Spectral',Georgia,serif;font-weight:300;font-size:clamp(30px,4.6vw,58px);line-height:1.08;letter-spacing:-0.015em;margin:0;max-width:18ch;">DCC originates no loans and allocates no capital.</h2>
      <p style="font-family:'IBM Plex Sans',sans-serif;font-size:clamp(16px,1.7vw,19px);line-height:1.62;color:#a9aaa6;max-width:62ch;margin:36px 0 0;">It cannot tilt the standard toward its own book, because it has no book. Neutrality is built into the structure &mdash; which is what lets every originator and every capital source rely on it.</p>
    </div>
  </section>

  <!-- ===== CONTACT / CTA ===== -->
  <section id="contact" style="background:#17191c;color:#ece8e0;">
    <div class="contact-grid" style="max-width:1160px;margin:0 auto;padding:104px 40px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:64px;align-items:end;">
      <div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.18em;color:#b79256;text-transform:uppercase;margin-bottom:28px;">Contact</div>
        <h2 style="font-family:'Spectral',Georgia,serif;font-weight:300;font-size:clamp(34px,5vw,60px);line-height:1.04;letter-spacing:-0.015em;margin:0;">Get in touch.</h2>
        <p style="font-family:'IBM Plex Sans',sans-serif;font-size:17px;line-height:1.6;color:#a9aaa6;max-width:46ch;margin:28px 0 0;">Reach out to discuss the conforming standard, the securitisation mechanics, and where it fits your origination or your mandate.</p>
      </div>
      <div style="justify-self:start;">
        <a href="mailto:contact@digitalcollateralcorporation.com" class="btn-cta" style="display:inline-block;font-family:'IBM Plex Sans',sans-serif;font-size:15px;font-weight:500;background:#ece8e0;color:#17191c;padding:16px 34px;">Get in touch &rarr;</a>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:0.04em;color:#8c8d89;margin-top:22px;">contact@digitalcollateralcorporation.com</div>
      </div>
    </div>
  </section>

  <!-- ===== FOOTER ===== -->
  <footer style="background:#17191c;color:#75766f;border-top:1px solid rgba(255,255,255,0.1);">
    <div style="max-width:1160px;margin:0 auto;padding:40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:18px;">
      <div style="display:flex;align-items:center;gap:13px;">
        <span style="width:28px;height:28px;border:1px solid #75766f;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:0.04em;color:#a9aaa6;">DCC</span>
        <span style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#a9aaa6;">Digital Collateral Corporation</span>
      </div>
      <div style="font-family:'IBM Plex Sans',sans-serif;font-size:12px;line-height:1.5;color:#75766f;max-width:54ch;text-align:right;">This page describes infrastructure under development. It is informational only and is not an offer to sell, or a solicitation to buy, any security. &copy; 2026 Digital Collateral Corporation.</div>
    </div>
  </footer>

</div>`;
