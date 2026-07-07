"use client";

import { useState } from "react";

export function RoomManager({
  initialLinks,
  analytics,
}: {
  initialLinks: any[];
  analytics: Record<string, any>;
}) {
  const [links, setLinks] = useState(initialLinks);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [allowedEmails, setAllowedEmails] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCreate() {
    setSaving(true);
    const emails = allowedEmails
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@"));

    const res = await fetch("/api/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        expiresInDays,
        allowedEmails: emails.length > 0 ? emails : undefined,
      }),
    });
    if (res.ok) {
      const { link } = await res.json();
      setLinks([link, ...links]);
      setCreating(false);
      setLabel("");
      setAllowedEmails("");
    }
    setSaving(false);
  }

  async function handleRevoke(id: string) {
    await fetch(`/api/room/${id}`, { method: "DELETE" });
    setLinks(links.map((l) => (l.id === id ? { ...l, is_active: false } : l)));
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${window.location.origin}/room/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  const now = new Date();

  return (
    <div>
      {!creating && (
        <button
          onClick={() => setCreating(true)}
          className="mb-6 cursor-pointer bg-[#17191c] px-5 py-2.5 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34]"
        >
          + New data room link
        </button>
      )}

      {creating && (
        <div className="mb-8 border border-[#8a6d40]/30 bg-white p-6">
          <h3 className="mb-4 font-['IBM_Plex_Mono',monospace] text-[12px] uppercase tracking-wider text-[#8a6d40]">
            New data room link
          </h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Series A — Investor X"
                className="w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-[#8a6d40]"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">Expires in</label>
              <select value={expiresInDays} onChange={(e) => setExpiresInDays(Number(e.target.value))} className="w-full border border-black/15 px-3 py-2 text-sm outline-none">
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
              Restrict to emails (optional)
            </label>
            <textarea
              value={allowedEmails}
              onChange={(e) => setAllowedEmails(e.target.value)}
              placeholder={"investor@fund.com\npartner@vc.com"}
              rows={3}
              className="w-full max-w-sm border border-black/15 px-3 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] outline-none focus:border-[#8a6d40]"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saving || !label} className="cursor-pointer bg-[#17191c] px-5 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34] disabled:opacity-40">
              {saving ? "Creating..." : "Create link"}
            </button>
            <button onClick={() => setCreating(false)} className="cursor-pointer border border-black/15 bg-white px-4 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#5d6168] hover:border-black/30">
              Cancel
            </button>
          </div>
        </div>
      )}

      {links.length === 0 && !creating && (
        <p className="text-sm text-[#5d6168]">No data room links created yet.</p>
      )}

      <div className="space-y-3">
        {links.map((link) => {
          const expired = new Date(link.expires_at) < now;
          const revoked = !link.is_active;
          const status = revoked ? "Revoked" : expired ? "Expired" : "Active";
          const statusColor = revoked ? "text-red-600" : expired ? "text-amber-600" : "text-emerald-700";
          const stats = analytics[link.id];
          const emails = typeof link.allowed_emails === "string" ? JSON.parse(link.allowed_emails) : link.allowed_emails;

          return (
            <div key={link.id} className="border border-black/10 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{link.label}</span>
                    <span className={`font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider ${statusColor}`}>{status}</span>
                  </div>
                  <div className="mt-1 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">
                    {link.creator_name} &middot; expires {new Date(link.expires_at).toLocaleDateString()}
                    {emails && emails.length > 0 && ` · ${emails.length} email${emails.length > 1 ? "s" : ""} gated`}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {stats && (
                    <div className="text-right font-['IBM_Plex_Mono',monospace] text-[11px]">
                      <div className="text-[#17191c]">{stats.views} view{stats.views !== 1 ? "s" : ""} &middot; {stats.downloads} download{stats.downloads !== 1 ? "s" : ""}</div>
                      <div className="text-[#8a6d40]">{stats.viewers} viewer{stats.viewers !== 1 ? "s" : ""}</div>
                    </div>
                  )}
                  {!stats && !revoked && !expired && (
                    <span className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#b9b2a4]">No activity</span>
                  )}
                  <div className="flex gap-2">
                    {!revoked && !expired && (
                      <>
                        <button onClick={() => copyLink(link.token)} className="cursor-pointer border border-black/15 bg-white px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#3a3d42] hover:border-black/30">
                          {copied === link.token ? "Copied!" : "Copy link"}
                        </button>
                        <button onClick={() => handleRevoke(link.id)} className="cursor-pointer border border-red-200 bg-white px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-red-600 hover:border-red-400">
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
    </div>
  );
}
