"use client";

import { useState } from "react";

interface DriveFile {
  id: string;
  name: string;
  icon: string;
  size: string;
  isFolder?: boolean;
  depth?: number;
}

export function RoomManager({
  initialLinks,
  summaryAnalytics,
  detailedAnalytics,
  driveFiles,
}: {
  initialLinks: any[];
  summaryAnalytics: Record<string, any>;
  detailedAnalytics: Record<string, any>;
  driveFiles: DriveFile[];
}) {
  const [links, setLinks] = useState(initialLinks);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [allowedEmails, setAllowedEmails] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>(driveFiles.map((f) => f.id));
  const [allowDownload, setAllowDownload] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedLink, setExpandedLink] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingFiles, setEditingFiles] = useState<string | null>(null);
  const [editFileIds, setEditFileIds] = useState<string[]>([]);

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
        allowedFileIds: selectedFiles.length < driveFiles.length ? selectedFiles : undefined,
        allowDownload,
      }),
    });
    if (res.ok) {
      const { link } = await res.json();
      setLinks([link, ...links]);
      setCreating(false);
      setLabel("");
      setAllowedEmails("");
      setSelectedFiles(driveFiles.map((f) => f.id));
      setAllowDownload(true);
    }
    setSaving(false);
  }

  async function handleRevoke(id: string) {
    await fetch(`/api/room/${id}`, { method: "DELETE" });
    setLinks(links.map((l) => (l.id === id ? { ...l, is_active: false } : l)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this link and all its analytics? This cannot be undone.")) return;
    await fetch(`/api/room/${id}?permanent=1`, { method: "DELETE" });
    setLinks(links.filter((l) => l.id !== id));
  }

  async function handleRename(id: string) {
    if (!editValue.trim()) { setEditingLabel(null); return; }
    await fetch(`/api/room/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: editValue.trim() }),
    });
    setLinks(links.map((l) => (l.id === id ? { ...l, label: editValue.trim() } : l)));
    setEditingLabel(null);
  }

  async function handleSaveFiles(id: string) {
    const allFileIds = driveFiles.filter((f) => !f.isFolder).map((f) => f.id);
    const fileIds = editFileIds.length === allFileIds.length ? null : editFileIds;
    await fetch(`/api/room/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowed_file_ids: fileIds }),
    });
    setLinks(links.map((l) => (l.id === id ? { ...l, allowed_file_ids: fileIds ? JSON.stringify(fileIds) : null } : l)));
    setEditingFiles(null);
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${window.location.origin}/room/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  function toggleFile(fileId: string) {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((f) => f !== fileId) : [...prev, fileId]
    );
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
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Series A — Investor X" className="w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-[#8a6d40]" />
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

          {/* File selection */}
          <div className="mb-4">
            <label className="mb-2 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
              Files to include
            </label>
            <div className="mb-2 flex gap-3">
              <button type="button" onClick={() => setSelectedFiles(driveFiles.filter((f) => !f.isFolder).map((f) => f.id))} className="cursor-pointer border-none bg-transparent text-[11px] text-[#8a6d40] underline">All</button>
              <button type="button" onClick={() => setSelectedFiles([])} className="cursor-pointer border-none bg-transparent text-[11px] text-[#5d6168] underline">None</button>
            </div>
            <div className="space-y-1">
              {driveFiles.map((file) => {
                if (file.isFolder) {
                  return (
                    <div key={file.id} className="flex items-center gap-2 px-3 py-1.5" style={{ paddingLeft: `${(file.depth || 0) * 20 + 12}px` }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a6d40" strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
                      <span className="font-['IBM_Plex_Mono',monospace] text-[11px] font-medium uppercase tracking-wider text-[#3a3d42]">{file.name}</span>
                    </div>
                  );
                }
                const iconBg = file.icon === "PDF" ? "#c44" : file.icon === "IMG" ? "#3a7c5f" : file.icon === "XLS" ? "#2d6a4f" : file.icon === "DOC" ? "#1b4332" : "#5d6168";
                return (
                  <label
                    key={file.id}
                    className={`flex cursor-pointer items-center gap-3 border px-3 py-2 ${
                      selectedFiles.includes(file.id) ? "border-[#8a6d40]/40 bg-[#8a6d40]/5" : "border-black/8 bg-white"
                    }`}
                    style={{ marginLeft: `${(file.depth || 0) * 20}px` }}
                  >
                    <input type="checkbox" checked={selectedFiles.includes(file.id)} onChange={() => toggleFile(file.id)} className="accent-[#8a6d40]" />
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center font-['IBM_Plex_Mono',monospace] text-[8px] text-white" style={{ backgroundColor: iconBg }}>{file.icon}</div>
                    <span className="text-[13px] text-[#17191c]">{file.name}</span>
                    <span className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#b9b2a4]">{file.size}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Download toggle */}
          <div className="mb-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={allowDownload} onChange={(e) => setAllowDownload(e.target.checked)} className="accent-[#8a6d40]" />
              <span className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">Allow file downloads</span>
            </label>
            <p className="ml-6 mt-0.5 text-[11px] text-[#b9b2a4]">
              {allowDownload ? "Viewers can download files" : "View-only — no download buttons shown"}
            </p>
          </div>

          {/* Email restriction */}
          <div className="mb-5">
            <label className="mb-1.5 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">Restrict to emails (optional)</label>
            <textarea value={allowedEmails} onChange={(e) => setAllowedEmails(e.target.value)} placeholder={"investor@fund.com\npartner@vc.com"} rows={3} className="w-full max-w-sm border border-black/15 px-3 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] outline-none focus:border-[#8a6d40]" />
          </div>

          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saving || !label || selectedFiles.length === 0} className="cursor-pointer bg-[#17191c] px-5 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34] disabled:opacity-40">
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

      {/* Links list */}
      <div className="space-y-3">
        {links.map((link) => {
          const expired = new Date(link.expires_at) < now;
          const revoked = !link.is_active;
          const status = revoked ? "Revoked" : expired ? "Expired" : "Active";
          const statusColor = revoked ? "text-red-600" : expired ? "text-amber-600" : "text-emerald-700";
          const stats = summaryAnalytics[link.id];
          const detail = detailedAnalytics[link.id];
          const emails = typeof link.allowed_emails === "string" ? JSON.parse(link.allowed_emails) : link.allowed_emails;
          const fileIds = typeof link.allowed_file_ids === "string" ? JSON.parse(link.allowed_file_ids) : link.allowed_file_ids;
          const isExpanded = expandedLink === link.id;

          return (
            <div key={link.id} className="border border-black/10 bg-white">
              {/* Header row */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex-1 cursor-pointer" onClick={() => setExpandedLink(isExpanded ? null : link.id)}>
                  <div className="flex items-center gap-3">
                    {editingLabel === link.id ? (
                      <form
                        className="flex items-center gap-1.5"
                        onSubmit={(e) => { e.preventDefault(); handleRename(link.id); }}
                      >
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          onBlur={() => handleRename(link.id)}
                          onKeyDown={(e) => { if (e.key === "Escape") setEditingLabel(null); }}
                          className="border border-[#8a6d40] bg-white px-2 py-0.5 text-sm font-medium outline-none"
                        />
                      </form>
                    ) : (
                      <span
                        className="cursor-pointer text-sm font-medium hover:text-[#8a6d40]"
                        onClick={(e) => { e.stopPropagation(); setEditingLabel(link.id); setEditValue(link.label); }}
                        title="Click to rename"
                      >
                        {link.label}
                      </span>
                    )}
                    <span className={`font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider ${statusColor}`}>{status}</span>
                    {link.allow_download === false && (
                      <span className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#b9b2a4]">View only</span>
                    )}
                  </div>
                  <div className="mt-1 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">
                    {link.creator_name} &middot; expires {new Date(link.expires_at).toLocaleDateString()}
                    {fileIds ? ` · ${fileIds.length} file${fileIds.length !== 1 ? "s" : ""}` : " · All files"}
                    {emails && emails.length > 0 && ` · ${emails.length} email${emails.length > 1 ? "s" : ""}`}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {stats && (
                    <div className="text-right font-['IBM_Plex_Mono',monospace] text-[11px]">
                      <div className="text-[#17191c]">{stats.views} view{stats.views !== 1 ? "s" : ""} &middot; {stats.downloads} dl{stats.downloads !== 1 ? "s" : ""}</div>
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
                          {copied === link.token ? "Copied!" : "Copy"}
                        </button>
                        <button onClick={() => handleRevoke(link.id)} className="cursor-pointer border border-red-200 bg-white px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-red-600 hover:border-red-400">
                          Revoke
                        </button>
                      </>
                    )}
                    {!revoked && !expired && (
                      <button
                        onClick={() => {
                          if (editingFiles === link.id) { setEditingFiles(null); return; }
                          const currentFiles = typeof link.allowed_file_ids === "string" ? JSON.parse(link.allowed_file_ids) : link.allowed_file_ids;
                          setEditFileIds(currentFiles || driveFiles.filter((f) => !f.isFolder).map((f) => f.id));
                          setEditingFiles(link.id);
                        }}
                        className="cursor-pointer border border-black/15 bg-white px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#3a3d42] hover:border-black/25"
                      >
                        {editingFiles === link.id ? "Cancel edit" : "Edit files"}
                      </button>
                    )}
                    <button onClick={() => handleDelete(link.id)} className="cursor-pointer border border-red-200 bg-white px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-red-700 hover:bg-red-50 hover:border-red-400">
                      Delete
                    </button>
                    <button
                      onClick={() => setExpandedLink(isExpanded ? null : link.id)}
                      className="cursor-pointer border border-black/15 bg-white px-2 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168] hover:border-black/30"
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit files panel */}
              {editingFiles === link.id && (
                <div className="border-t border-[#8a6d40]/30 bg-[#8a6d40]/5 px-5 py-4">
                  <h4 className="mb-2 font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#8a6d40]">Edit included files</h4>
                  <div className="mb-3 space-y-1">
                    {driveFiles.map((file) => {
                      if (file.isFolder) {
                        return (
                          <div key={file.id} className="flex items-center gap-2 py-0.5" style={{ paddingLeft: `${(file.depth || 0) * 16 + 4}px` }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a6d40" strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                            <span className="font-['IBM_Plex_Mono',monospace] text-[10px] font-medium uppercase tracking-wider text-[#3a3d42]">{file.name}</span>
                          </div>
                        );
                      }
                      return (
                        <label key={file.id} className={`flex cursor-pointer items-center gap-2 border px-2 py-1.5 ${editFileIds.includes(file.id) ? "border-[#8a6d40]/40 bg-white" : "border-black/6 opacity-50"}`} style={{ marginLeft: `${(file.depth || 0) * 16}px` }}>
                          <input type="checkbox" checked={editFileIds.includes(file.id)} onChange={() => setEditFileIds((prev) => prev.includes(file.id) ? prev.filter((f) => f !== file.id) : [...prev, file.id])} className="accent-[#8a6d40]" />
                          <span className="text-[12px]">{file.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <button onClick={() => handleSaveFiles(link.id)} className="cursor-pointer bg-[#17191c] px-4 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34]">
                    Save changes
                  </button>
                </div>
              )}

              {/* Expanded analytics */}
              {isExpanded && detail && (
                <div className="border-t border-black/8 bg-[#faf9f6] px-5 py-4">
                  <div className="mb-4 grid grid-cols-4 gap-3">
                    <MiniStat label="Views" value={detail.summary.total_views} />
                    <MiniStat label="Downloads" value={detail.summary.total_downloads} />
                    <MiniStat label="Viewers" value={detail.summary.unique_viewers} />
                    <MiniStat label="Files" value={detail.summary.files_accessed} />
                  </div>

                  {detail.events.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#8a6d40]">Recent activity</h4>
                      <div className="max-h-[200px] overflow-y-auto">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="border-b border-black/10">
                              <th className="py-1.5 text-left font-['IBM_Plex_Mono',monospace] text-[10px] font-medium uppercase tracking-wider text-[#5d6168]">When</th>
                              <th className="py-1.5 text-left font-['IBM_Plex_Mono',monospace] text-[10px] font-medium uppercase tracking-wider text-[#5d6168]">Who</th>
                              <th className="py-1.5 text-left font-['IBM_Plex_Mono',monospace] text-[10px] font-medium uppercase tracking-wider text-[#5d6168]">Action</th>
                              <th className="py-1.5 text-left font-['IBM_Plex_Mono',monospace] text-[10px] font-medium uppercase tracking-wider text-[#5d6168]">File</th>
                              <th className="py-1.5 text-left font-['IBM_Plex_Mono',monospace] text-[10px] font-medium uppercase tracking-wider text-[#5d6168]">Detail</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.events.slice(0, 30).map((ev: any, i: number) => (
                              <tr key={i} className="border-b border-black/5">
                                <td className="py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">
                                  {new Date(ev.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </td>
                                <td className="py-1.5 text-[11px] text-[#3a3d42]">{ev.email || "—"}</td>
                                <td className="py-1.5">
                                  <span className={`font-['IBM_Plex_Mono',monospace] text-[10px] px-1.5 py-0.5 ${
                                    ev.event_type === "download" ? "bg-[#2d6a4f] text-white" :
                                    ev.event_type === "view_page" ? "bg-[#8a6d40]/15 text-[#8a6d40]" :
                                    "bg-black/8 text-[#3a3d42]"
                                  }`}>
                                    {ev.event_type === "view_file" ? "opened" : ev.event_type === "view_page" ? "page" : "download"}
                                  </span>
                                </td>
                                <td className="max-w-[200px] truncate py-1.5 text-[11px] text-[#3a3d42]">{ev.file_name || ev.file_id.substring(0, 12)}</td>
                                <td className="py-1.5 font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8a6d40]">
                                  {ev.page_number ? `p.${ev.page_number}` : ""}
                                  {ev.duration_seconds ? ` ${ev.duration_seconds}s` : ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {detail.events.length === 0 && (
                    <p className="text-[12px] text-[#b9b2a4]">No activity recorded yet.</p>
                  )}
                </div>
              )}

              {isExpanded && !detail && (
                <div className="border-t border-black/8 bg-[#faf9f6] px-5 py-4">
                  <p className="text-[12px] text-[#b9b2a4]">No analytics available.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-black/8 bg-white px-3 py-2">
      <div className="font-['IBM_Plex_Mono',monospace] text-[9px] uppercase tracking-wider text-[#8a6d40]">{label}</div>
      <div className="mt-0.5 font-['Spectral',Georgia,serif] text-[20px] font-light leading-none">{value}</div>
    </div>
  );
}
