"use client";

import { useState } from "react";

interface RowFilter {
  field: string;
  op: string;
  value: string;
}

interface ViewsSummary {
  [linkId: string]: {
    view_count: number;
    last_viewed: string;
    unique_devices: number;
  };
}

export function ShareManager({
  initialLinks,
  availableFields,
  viewsSummary,
}: {
  initialLinks: any[];
  availableFields: string[];
  viewsSummary: ViewsSummary;
}) {
  const [links, setLinks] = useState(initialLinks);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(14);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [rowFilters, setRowFilters] = useState<RowFilter[]>([]);
  const [allowedEmails, setAllowedEmails] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCreate() {
    setSaving(true);
    const emails = allowedEmails
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@"));
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        expiresInDays,
        visibleFields: selectedFields,
        rowFilters,
        allowedEmails: emails.length > 0 ? emails : undefined,
      }),
    });
    if (res.ok) {
      const { link } = await res.json();
      setLinks([link, ...links]);
      setCreating(false);
      setLabel("");
      setSelectedFields([]);
      setRowFilters([]);
      setAllowedEmails("");
    }
    setSaving(false);
  }

  async function handleRevoke(id: string) {
    await fetch(`/api/share/${id}`, { method: "DELETE" });
    setLinks(links.map((l) => (l.id === id ? { ...l, is_active: false } : l)));
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/view/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  function toggleField(field: string) {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  }

  function addFilter() {
    setRowFilters([...rowFilters, { field: availableFields[0] || "", op: "eq", value: "" }]);
  }

  function updateFilter(i: number, updates: Partial<RowFilter>) {
    setRowFilters(rowFilters.map((f, j) => (j === i ? { ...f, ...updates } : f)));
  }

  function removeFilter(i: number) {
    setRowFilters(rowFilters.filter((_, j) => j !== i));
  }

  const now = new Date();

  return (
    <div>
      {/* Create button */}
      {!creating && (
        <button
          onClick={() => setCreating(true)}
          className="mb-6 cursor-pointer bg-[#17191c] px-5 py-2.5 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34]"
        >
          + New share link
        </button>
      )}

      {/* Create form */}
      {creating && (
        <div className="mb-8 border border-[#8a6d40]/30 bg-white p-6">
          <h3 className="mb-4 font-['IBM_Plex_Mono',monospace] text-[12px] uppercase tracking-wider text-[#8a6d40]">
            New share link
          </h3>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
                Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Investor X data room"
                className="w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-[#8a6d40]"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
                Expires in
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full border border-black/15 px-3 py-2 text-sm outline-none"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          </div>

          {/* Visible Fields */}
          <div className="mb-5">
            <label className="mb-2 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
              Visible columns
            </label>
            <div className="mb-2 flex gap-3">
              <button type="button" onClick={() => setSelectedFields([...availableFields])} className="cursor-pointer border-none bg-transparent text-[11px] text-[#8a6d40] underline">Select all</button>
              <button type="button" onClick={() => setSelectedFields([])} className="cursor-pointer border-none bg-transparent text-[11px] text-[#5d6168] underline">Clear</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableFields.map((field) => (
                <label
                  key={field}
                  className={`flex cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 text-[12px] ${
                    selectedFields.includes(field)
                      ? "border-[#8a6d40] bg-[#8a6d40]/10 text-[#17191c]"
                      : "border-black/12 text-[#5d6168]"
                  }`}
                >
                  <input type="checkbox" checked={selectedFields.includes(field)} onChange={() => toggleField(field)} className="sr-only" />
                  {field}
                </label>
              ))}
            </div>
          </div>

          {/* Row Filters */}
          <div className="mb-5">
            <label className="mb-2 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
              Row filters (optional)
            </label>
            {rowFilters.map((f, i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <select
                  value={f.field}
                  onChange={(e) => updateFilter(i, { field: e.target.value })}
                  className="border border-black/15 px-2 py-1.5 text-sm outline-none"
                >
                  {availableFields.map((af) => (
                    <option key={af} value={af}>{af}</option>
                  ))}
                </select>
                <select
                  value={f.op}
                  onChange={(e) => updateFilter(i, { op: e.target.value })}
                  className="border border-black/15 px-2 py-1.5 text-sm outline-none"
                >
                  <option value="eq">equals</option>
                  <option value="neq">not equals</option>
                  <option value="gt">&gt;</option>
                  <option value="gte">&gt;=</option>
                  <option value="lt">&lt;</option>
                  <option value="lte">&lt;=</option>
                  <option value="contains">contains</option>
                </select>
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => updateFilter(i, { value: e.target.value })}
                  placeholder="value"
                  className="flex-1 border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-[#8a6d40]"
                />
                <button
                  onClick={() => removeFilter(i)}
                  className="cursor-pointer border border-red-200 bg-white px-2 py-1 text-xs text-red-500 hover:border-red-400"
                >
                  x
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFilter}
              className="cursor-pointer border border-dashed border-black/20 bg-transparent px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168] hover:border-black/40"
            >
              + Add filter
            </button>
          </div>

          {/* Email restriction */}
          <div className="mb-5">
            <label className="mb-2 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
              Restrict to emails (optional)
            </label>
            <p className="mb-2 text-[12px] text-[#5d6168]">
              If set, viewers must verify their email before accessing data. One email per line.
            </p>
            <textarea
              value={allowedEmails}
              onChange={(e) => setAllowedEmails(e.target.value)}
              placeholder={"investor@fund.com\npartner@vc.com"}
              rows={3}
              className="w-full max-w-sm border border-black/15 px-3 py-2 text-sm outline-none focus:border-[#8a6d40]"
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px" }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={saving || !label || selectedFields.length === 0}
              className="cursor-pointer bg-[#17191c] px-5 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34] disabled:cursor-default disabled:opacity-40"
            >
              {saving ? "Creating..." : "Create link"}
            </button>
            <button
              onClick={() => setCreating(false)}
              className="cursor-pointer border border-black/15 bg-white px-4 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#5d6168] hover:border-black/30"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Links list */}
      {links.length === 0 && !creating && (
        <p className="text-sm text-[#5d6168]">No share links created yet.</p>
      )}

      {links.length > 0 && (
        <div className="space-y-3">
          {links.map((link) => {
            const expired = new Date(link.expires_at) < now;
            const revoked = !link.is_active;
            const status = revoked ? "Revoked" : expired ? "Expired" : "Active";
            const statusColor = revoked ? "text-red-600" : expired ? "text-amber-600" : "text-emerald-700";
            const views = viewsSummary[link.id];
            const fields = typeof link.visible_fields === "string" ? JSON.parse(link.visible_fields) : link.visible_fields || [];
            const filters = typeof link.row_filters === "string" ? JSON.parse(link.row_filters) : link.row_filters || [];
            const emails = typeof link.allowed_emails === "string" ? JSON.parse(link.allowed_emails) : link.allowed_emails || null;

            return (
              <div key={link.id} className="border border-black/10 bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{link.label}</span>
                      <span className={`font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider ${statusColor}`}>
                        {status}
                      </span>
                    </div>
                    <div className="mt-1 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">
                      {link.creator_name} &middot; expires{" "}
                      {new Date(link.expires_at).toLocaleDateString()} &middot;{" "}
                      {fields.length} fields
                      {filters.length > 0 && ` · ${filters.length} filter${filters.length > 1 ? "s" : ""}`}
                      {emails && emails.length > 0 && ` · ${emails.length} email${emails.length > 1 ? "s" : ""} gated`}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Analytics */}
                    {views && (
                      <div className="text-right font-['IBM_Plex_Mono',monospace] text-[11px]">
                        <div className="text-[#17191c]">
                          {views.view_count} view{views.view_count !== 1 ? "s" : ""}
                        </div>
                        <div className="text-[#8a6d40]">
                          {views.unique_devices} device{views.unique_devices !== 1 ? "s" : ""} &middot;{" "}
                          {new Date(views.last_viewed).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {!views && !revoked && !expired && (
                      <span className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#b9b2a4]">
                        No views yet
                      </span>
                    )}
                    {/* Actions */}
                    <div className="flex gap-2">
                      {!revoked && !expired && (
                        <>
                          <button
                            onClick={() => copyLink(link.token)}
                            className="cursor-pointer border border-black/15 bg-white px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#3a3d42] hover:border-black/30"
                          >
                            {copied === link.token ? "Copied!" : "Copy link"}
                          </button>
                          <button
                            onClick={() => handleRevoke(link.id)}
                            className="cursor-pointer border border-red-200 bg-white px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-red-600 hover:border-red-400"
                          >
                            Revoke
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
