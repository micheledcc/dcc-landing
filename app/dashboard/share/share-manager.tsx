"use client";

import { useState } from "react";

export interface ShareLink {
  id: string;
  token: string;
  label: string;
  creator_name: string;
  expires_at: string;
  visible_fields: string[];
  is_active: boolean;
  created_at: string;
}

export function ShareManager({
  initialLinks,
  availableFields,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialLinks: any[];
  availableFields: string[];
}) {
  const [links, setLinks] = useState(initialLinks);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(14);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCreate() {
    setSaving(true);
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        expiresInDays,
        visibleFields: selectedFields,
      }),
    });
    if (res.ok) {
      const { link } = await res.json();
      setLinks([link, ...links]);
      setCreating(false);
      setLabel("");
      setSelectedFields([]);
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

          <div className="mb-4">
            <label className="mb-1.5 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Investor X data room"
              className="w-full max-w-sm border border-black/15 px-3 py-2 text-sm outline-none focus:border-[#8a6d40]"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
              Expires in
            </label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              className="border border-black/15 px-3 py-2 text-sm outline-none"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>

          <div className="mb-5">
            <label className="mb-2 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
              Visible fields
            </label>
            <div className="flex gap-3 mb-2">
              <button
                type="button"
                onClick={() => setSelectedFields([...availableFields])}
                className="cursor-pointer text-[11px] text-[#8a6d40] underline bg-transparent border-none"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setSelectedFields([])}
                className="cursor-pointer text-[11px] text-[#5d6168] underline bg-transparent border-none"
              >
                Clear
              </button>
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
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => toggleField(field)}
                    className="sr-only"
                  />
                  {field}
                </label>
              ))}
              {availableFields.length === 0 && (
                <span className="text-xs text-[#5d6168]">
                  Connect Google Sheets first to see available fields.
                </span>
              )}
            </div>
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
            const status = revoked
              ? "Revoked"
              : expired
                ? "Expired"
                : "Active";
            const statusColor = revoked
              ? "text-red-600"
              : expired
                ? "text-amber-600"
                : "text-emerald-700";

            return (
              <div
                key={link.id}
                className="flex items-center justify-between border border-black/10 bg-white px-5 py-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{link.label}</span>
                    <span
                      className={`font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider ${statusColor}`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="mt-1 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">
                    {link.creator_name} &middot; expires{" "}
                    {new Date(link.expires_at).toLocaleDateString()} &middot;{" "}
                    {(typeof link.visible_fields === 'string' ? JSON.parse(link.visible_fields) : link.visible_fields).length} fields
                  </div>
                </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
