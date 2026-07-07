import "@/app/globals.css";
import { getShareLink, applyRowFilters } from "@/lib/share";
import { readPipeline } from "@/lib/sheets";
import { logView } from "@/lib/analytics";
import { headers, cookies } from "next/headers";
import { jwtVerify } from "jose";
import { EmailGate } from "./email-gate";

const STAGE_COLORS: Record<string, string> = {
  "1 - Outreach": "#b9b2a4",
  "2 - Pitch": "#a09484",
  "3 - Internal IC": "#8a6d40",
  "4 - Final DD": "#6d5530",
  "5 - Verbal Commit": "#3a7c5f",
  "6 - Signed": "#2d6a4f",
  "7 - Wired": "#1b4332",
  Advisor: "#5d6168",
  "0 - Passed": "#c44",
};

const TYPE_COLORS: Record<string, string> = {
  Angel: "#8a6d40",
  VC: "#17191c",
  Advisor: "#5d6168",
};

function parseCurrency(s: string): number {
  if (!s) return 0;
  return parseFloat(s.replace(/[$,]/g, "")) || 0;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  if (n === 0) return "$0";
  return `$${n.toLocaleString()}`;
}

export default async function ViewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await getShareLink(token);

  if (!link || !link.is_active) {
    return (
      <ViewShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-black/15">
              <span className="font-['IBM_Plex_Mono',monospace] text-xs text-[#b9b2a4]">404</span>
            </div>
            <h1 className="mb-3 font-['Spectral',Georgia,serif] text-3xl font-light">
              Link not found
            </h1>
            <p className="text-[15px] leading-relaxed text-[#5d6168]">
              This link does not exist or has been revoked. Contact Digital Collateral Corporation for access.
            </p>
          </div>
        </div>
      </ViewShell>
    );
  }

  if (new Date(link.expires_at) < new Date()) {
    return (
      <ViewShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[#8a6d40]/30">
              <span className="font-['IBM_Plex_Mono',monospace] text-xs text-[#8a6d40]">exp</span>
            </div>
            <h1 className="mb-3 font-['Spectral',Georgia,serif] text-3xl font-light">
              Link expired
            </h1>
            <p className="text-[15px] leading-relaxed text-[#5d6168]">
              This link expired on{" "}
              {new Date(link.expires_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              . Contact DCC for a new link.
            </p>
          </div>
        </div>
      </ViewShell>
    );
  }

  // Check email gate
  const allowedEmails: string[] | null =
    typeof link.allowed_emails === "string"
      ? JSON.parse(link.allowed_emails)
      : link.allowed_emails;

  if (allowedEmails && allowedEmails.length > 0) {
    // Check for viewer cookie
    const jar = await cookies();
    const viewerCookie = jar.get(`dcc_view_${token.substring(0, 16)}`)?.value;
    let verified = false;

    if (viewerCookie) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
        const { payload } = await jwtVerify(viewerCookie, secret);
        if (payload.token === token && allowedEmails.includes(payload.email as string)) {
          verified = true;
        }
      } catch {
        // Cookie invalid or expired — show gate
      }
    }

    if (!verified) {
      return (
        <ViewShell>
          <EmailGate token={token} linkLabel={link.label} />
        </ViewShell>
      );
    }
  }

  // Log the view
  const hdrs = await headers();
  const ua = hdrs.get("user-agent");
  const ref = hdrs.get("referer");
  logView(link.id, ua, ref).catch(() => {});

  const visibleFields: string[] =
    typeof link.visible_fields === "string"
      ? JSON.parse(link.visible_fields)
      : link.visible_fields;

  const rowFilters =
    typeof link.row_filters === "string"
      ? JSON.parse(link.row_filters)
      : link.row_filters || [];

  let data: { headers: string[]; rows: Record<string, string>[] };
  try {
    data = await readPipeline();
  } catch {
    return (
      <ViewShell>
        <div className="border border-red-200 bg-red-50/50 p-8 text-center">
          <p className="text-[15px] text-red-700">Unable to load data. Please try again later.</p>
        </div>
      </ViewShell>
    );
  }

  const filteredHeaders = data.headers.filter((h) => visibleFields.includes(h));
  const filteredRows = applyRowFilters(data.rows, rowFilters);

  // Compute summary stats from visible data
  const hasAmount = filteredHeaders.includes("Amount ($)");
  const hasType = filteredHeaders.includes("Type");
  const totalAmount = hasAmount
    ? filteredRows.reduce((sum, r) => sum + parseCurrency(r["Amount ($)"]), 0)
    : 0;
  const typeBreakdown: Record<string, number> = {};
  if (hasType) {
    filteredRows.forEach((r) => {
      const t = r["Type"] || "Other";
      typeBreakdown[t] = (typeBreakdown[t] || 0) + 1;
    });
  }

  return (
    <ViewShell>
      {/* Hero header */}
      <div className="mb-10 border-b border-black/8 pb-10">
        <div className="mb-2 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-[0.22em] text-[#8a6d40]">
          {link.label}
        </div>
        <h1 className="mb-4 font-['Spectral',Georgia,serif] text-[clamp(28px,4vw,44px)] font-light leading-tight">
          Investor Pipeline
        </h1>
        <p className="max-w-[54ch] text-[15px] leading-relaxed text-[#5d6168]">
          A confidential view of the Digital Collateral Corporation investor pipeline, shared with you on{" "}
          {new Date(link.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          .
        </p>
      </div>

      {/* Summary stats */}
      <div className="mb-8 flex flex-wrap gap-4">
        <StatCard label="Investors" value={String(filteredRows.length)} />
        {hasAmount && <StatCard label="Total committed" value={formatCurrency(totalAmount)} />}
        {hasType &&
          Object.entries(typeBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <StatCard key={type} label={type} value={String(count)} />
            ))}
      </div>

      {/* Data table */}
      <div className="overflow-x-auto border border-black/10 bg-white">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-black/12 bg-[#faf9f6]">
              {filteredHeaders.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3.5 text-left font-['IBM_Plex_Mono',monospace] text-[11px] font-medium uppercase tracking-wider text-[#5d6168]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-black/6 transition-colors hover:bg-[#f9f7f2]"
              >
                {filteredHeaders.map((h) => (
                  <td key={h} className="px-4 py-3.5">
                    {h === "Stage" ? (
                      <span
                        className="inline-block whitespace-nowrap px-2 py-0.5 font-['IBM_Plex_Mono',monospace] text-[10px] text-white"
                        style={{ backgroundColor: STAGE_COLORS[row[h]] || "#5d6168" }}
                      >
                        {row[h] || "-"}
                      </span>
                    ) : h === "Type" ? (
                      <span
                        className="inline-block whitespace-nowrap border px-2 py-0.5 font-['IBM_Plex_Mono',monospace] text-[10px]"
                        style={{
                          borderColor: TYPE_COLORS[row[h]] || "#5d6168",
                          color: TYPE_COLORS[row[h]] || "#5d6168",
                        }}
                      >
                        {row[h] || "-"}
                      </span>
                    ) : h === "Amount ($)" || h === "Weighted ($)" ? (
                      <span className="font-['IBM_Plex_Mono',monospace] text-[13px] tabular-nums text-[#2c2f34]">
                        {row[h] || "-"}
                      </span>
                    ) : h === "Prob" ? (
                      <span className="font-['IBM_Plex_Mono',monospace] text-[12px] text-[#8a6d40]">
                        {row[h] || "-"}
                      </span>
                    ) : h === "Profile / Notes" ? (
                      <span
                        className="block max-w-[300px] truncate text-[13px] text-[#5d6168]"
                        title={row[h] || ""}
                      >
                        {row[h] || ""}
                      </span>
                    ) : h === "Name" ? (
                      <span className="font-medium text-[#17191c]">{row[h] || ""}</span>
                    ) : (
                      <span className="text-[#2c2f34]">{row[h] || ""}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="mt-8 border-t border-black/8 pt-6">
        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] leading-relaxed text-[#b9b2a4]">
          This data is confidential and shared under the terms of your agreement with Digital Collateral Corporation.
          Do not distribute. This link expires on{" "}
          {new Date(link.expires_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          .
        </p>
      </div>
    </ViewShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-white px-5 py-4">
      <div className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#8a6d40]">
        {label}
      </div>
      <div className="mt-1.5 font-['Spectral',Georgia,serif] text-[24px] font-light leading-none text-[#17191c]">
        {value}
      </div>
    </div>
  );
}

function ViewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3efe7] font-['IBM_Plex_Sans',system-ui,sans-serif] text-[#17191c]">
      {/* Header — matches landing page */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[rgba(243,239,231,0.86)] backdrop-blur-[10px]">
        <div className="mx-auto flex h-[74px] max-w-[1160px] items-center justify-between px-10">
          <a href="/" className="flex items-center gap-[14px] no-underline text-inherit">
            <span className="flex h-[34px] w-[34px] items-center justify-center border border-[#17191c] font-['IBM_Plex_Mono',monospace] text-[11px] font-medium tracking-[0.04em]">
              DCC
            </span>
            <span className="font-['IBM_Plex_Mono',monospace] text-[10.5px] uppercase tracking-[0.22em] text-[#3a3d42]">
              Digital&nbsp;Collateral&nbsp;Corporation
            </span>
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-[1160px] px-10 py-16">{children}</main>

      {/* Footer — matches landing page */}
      <footer className="border-t border-black/8 bg-[#17191c] text-[#75766f]">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-10 py-10 flex-wrap gap-4">
          <div className="flex items-center gap-[13px]">
            <span className="flex h-7 w-7 items-center justify-center border border-[#75766f] font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.04em] text-[#a9aaa6]">
              DCC
            </span>
            <span className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.18em] text-[#a9aaa6]">
              Digital Collateral Corporation
            </span>
          </div>
          <div className="max-w-[54ch] text-right font-['IBM_Plex_Sans',sans-serif] text-[12px] leading-relaxed text-[#75766f]">
            This page describes infrastructure under development. It is informational only and is not an offer to sell, or a solicitation to buy, any security. &copy; 2026 Digital Collateral Corporation.
          </div>
        </div>
      </footer>
    </div>
  );
}
