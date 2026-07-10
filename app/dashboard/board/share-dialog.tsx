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

export function ShareDialog({
  investorName,
  investorEmail,
  driveFiles,
  onClose,
  onCreated,
}: {
  investorName: string;
  investorEmail: string;
  driveFiles: DriveFile[];
  onClose: () => void;
  onCreated: (url: string) => void;
}) {
  const [email, setEmail] = useState(investorEmail);
  const [useEmailGate, setUseEmailGate] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [selectedFiles, setSelectedFiles] = useState<string[]>(driveFiles.filter((f) => !f.isFolder).map((f) => f.id));
  const [allowDownload, setAllowDownload] = useState(true);
  const [creating, setCreating] = useState(false);

  function toggleFile(id: string) {
    setSelectedFiles((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  }

  async function handleCreate() {
    setCreating(true);
    const emails = useEmailGate && email.includes("@") ? [email.toLowerCase().trim()] : undefined;

    const res = await fetch("/api/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: investorName,
        expiresInDays,
        allowedEmails: emails,
        allowedFileIds: selectedFiles.length < driveFiles.filter((f) => !f.isFolder).length ? selectedFiles : undefined,
        allowDownload,
      }),
    });

    if (res.ok) {
      const { link } = await res.json();
      const url = `${window.location.origin}/room/${link.token}`;
      navigator.clipboard.writeText(url);
      onCreated(url);
    }
    setCreating(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="m-4 max-h-[85vh] w-full max-w-lg overflow-y-auto bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-black/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-['Spectral',Georgia,serif] text-xl font-light">Share Data Room</h3>
              <p className="mt-0.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#8a6d40]">{investorName}</p>
            </div>
            <button onClick={onClose} className="cursor-pointer border-none bg-transparent text-[#5d6168] hover:text-[#17191c]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Email gate */}
          <div>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input type="checkbox" checked={useEmailGate} onChange={(e) => setUseEmailGate(e.target.checked)} className="accent-[#8a6d40]" />
              <span className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">Email-gated access</span>
            </label>
            {useEmailGate && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@fund.com"
                className="mt-2 w-full border border-black/15 px-3 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] outline-none focus:border-[#8a6d40]"
              />
            )}
          </div>

          {/* Expiry */}
          <div>
            <label className="mb-1 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">Expires in</label>
            <select value={expiresInDays} onChange={(e) => setExpiresInDays(Number(e.target.value))} className="border border-black/15 px-3 py-2 text-sm outline-none">
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>

          {/* Files */}
          <div>
            <label className="mb-1.5 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">Documents</label>
            <div className="mb-1.5 flex gap-3">
              <button type="button" onClick={() => setSelectedFiles(driveFiles.filter((f) => !f.isFolder).map((f) => f.id))} className="cursor-pointer border-none bg-transparent text-[11px] text-[#8a6d40] underline">All</button>
              <button type="button" onClick={() => setSelectedFiles([])} className="cursor-pointer border-none bg-transparent text-[11px] text-[#5d6168] underline">None</button>
            </div>
            <div className="max-h-[200px] space-y-1 overflow-y-auto">
              {driveFiles.map((file) => {
                if (file.isFolder) {
                  return (
                    <div key={file.id} className="flex items-center gap-2 py-1" style={{ paddingLeft: `${(file.depth || 0) * 16 + 4}px` }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a6d40" strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                      <span className="font-['IBM_Plex_Mono',monospace] text-[10px] font-medium uppercase tracking-wider text-[#3a3d42]">{file.name}</span>
                    </div>
                  );
                }
                const iconBg = file.icon === "PDF" ? "#c44" : file.icon === "IMG" ? "#3a7c5f" : file.icon === "XLS" ? "#2d6a4f" : "#5d6168";
                return (
                  <label key={file.id} className={`flex cursor-pointer items-center gap-2 border px-2 py-1.5 ${selectedFiles.includes(file.id) ? "border-[#8a6d40]/40 bg-[#8a6d40]/5" : "border-black/6"}`} style={{ marginLeft: `${(file.depth || 0) * 16}px` }}>
                    <input type="checkbox" checked={selectedFiles.includes(file.id)} onChange={() => toggleFile(file.id)} className="accent-[#8a6d40]" />
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center font-['IBM_Plex_Mono',monospace] text-[7px] text-white" style={{ backgroundColor: iconBg }}>{file.icon}</div>
                    <span className="truncate text-[12px]">{file.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Download toggle */}
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={allowDownload} onChange={(e) => setAllowDownload(e.target.checked)} className="accent-[#8a6d40]" />
            <span className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">Allow downloads</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-black/10 px-6 py-4">
          <button onClick={onClose} className="cursor-pointer border border-black/15 bg-white px-4 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] text-[#5d6168] hover:border-black/25">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={creating || selectedFiles.length === 0}
            className="cursor-pointer bg-[#17191c] px-5 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34] disabled:opacity-40"
          >
            {creating ? "Creating..." : "Create & copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}
