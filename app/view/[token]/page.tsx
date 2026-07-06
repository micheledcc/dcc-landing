import { getShareLink, applyRowFilters } from "@/lib/share";
import { readPipeline } from "@/lib/sheets";
import { logView } from "@/lib/analytics";
import { headers } from "next/headers";

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
        <div className="text-center">
          <h1 className="mb-3 text-2xl font-light" style={{ fontFamily: "'Spectral', Georgia, serif" }}>
            Link not found
          </h1>
          <p className="text-[#5d6168]">
            This link does not exist or has been revoked.
          </p>
        </div>
      </ViewShell>
    );
  }

  if (new Date(link.expires_at) < new Date()) {
    return (
      <ViewShell>
        <div className="text-center">
          <h1 className="mb-3 text-2xl font-light" style={{ fontFamily: "'Spectral', Georgia, serif" }}>
            Link expired
          </h1>
          <p className="text-[#5d6168]">
            This link expired on{" "}
            {new Date(link.expires_at).toLocaleDateString()}. Contact DCC for a
            new link.
          </p>
        </div>
      </ViewShell>
    );
  }

  // Log the view
  const hdrs = await headers();
  const ua = hdrs.get("user-agent");
  const ref = hdrs.get("referer");
  logView(link.id, ua, ref).catch(() => {}); // fire and forget

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
        <p className="text-red-600">Unable to load data. Please try again later.</p>
      </ViewShell>
    );
  }

  const filteredHeaders = data.headers.filter((h) =>
    visibleFields.includes(h)
  );

  const filteredRows = applyRowFilters(data.rows, rowFilters);

  return (
    <ViewShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div
            className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#8a6d40]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {link.label}
          </div>
          <h1
            className="text-2xl font-light"
            style={{ fontFamily: "'Spectral', Georgia, serif" }}
          >
            Investor Pipeline
          </h1>
        </div>
        <span
          className="text-[11px] text-[#5d6168]"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {filteredRows.length} {filteredRows.length === 1 ? "row" : "rows"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/15">
              {filteredHeaders.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[#5d6168]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, i) => (
              <tr key={i} className="border-b border-black/8">
                {filteredHeaders.map((h) => (
                  <td
                    key={h}
                    className="max-w-[240px] truncate px-3 py-3 text-[#2c2f34]"
                  >
                    {row[h] || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ViewShell>
  );
}

function ViewShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#f3efe7] text-[#17191c]"
      style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}
    >
      <header className="border-b border-black/10">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <span
            className="flex h-7 w-7 items-center justify-center border border-[#17191c] text-[9px] font-medium tracking-wide"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            DCC
          </span>
          <span
            className="ml-3 text-[10px] uppercase tracking-[0.18em] text-[#3a3d42]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Digital Collateral Corporation
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
