"use client";

import { useState } from "react";

interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export function TeamManager({
  initialMembers,
  currentUserId,
}: {
  initialMembers: Member[];
  currentUserId: string;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    setError("");
    setSaving(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setMembers([...members, data.member]);
      setAdding(false);
      setName("");
      setEmail("");
      setPassword("");
    } else {
      setError(data.error || "Failed to add member");
    }
    setSaving(false);
  }

  async function handleRemove(id: string) {
    const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMembers(members.filter((m) => m.id !== id));
    }
  }

  return (
    <div>
      <p className="mb-6 text-sm text-[#5d6168]">
        Manage who can log in to the dashboard. Team members can view the
        pipeline and create share links.
      </p>

      {/* Members list */}
      <div className="mb-6 space-y-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between border border-black/10 bg-white px-5 py-4"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{m.name}</span>
                {m.role === "owner" && (
                  <span className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#8a6d40]">
                    Owner
                  </span>
                )}
                {m.id === currentUserId && (
                  <span className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#5d6168]">
                    You
                  </span>
                )}
              </div>
              <div className="mt-0.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">
                {m.email} &middot; joined{" "}
                {new Date(m.created_at).toLocaleDateString()}
              </div>
            </div>
            {m.role !== "owner" && m.id !== currentUserId && (
              <button
                onClick={() => handleRemove(m.id)}
                className="cursor-pointer border border-red-200 bg-white px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-red-600 hover:border-red-400"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add member */}
      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="cursor-pointer bg-[#17191c] px-5 py-2.5 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34]"
        >
          + Add team member
        </button>
      ) : (
        <div className="border border-[#8a6d40]/30 bg-white p-6">
          <h3 className="mb-4 font-['IBM_Plex_Mono',monospace] text-[12px] uppercase tracking-wider text-[#8a6d40]">
            New team member
          </h3>
          <div className="mb-3 grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-[#8a6d40]"
              />
            </div>
            <div>
              <label className="mb-1 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-[#8a6d40]"
              />
            </div>
            <div>
              <label className="mb-1 block font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168]">
                Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 8 characters"
                className="w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-[#8a6d40]"
              />
            </div>
          </div>
          {error && (
            <p className="mb-3 text-sm text-red-600">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={saving || !name || !email || !password}
              className="cursor-pointer bg-[#17191c] px-5 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34] disabled:opacity-40"
            >
              {saving ? "Adding..." : "Add member"}
            </button>
            <button
              onClick={() => { setAdding(false); setError(""); }}
              className="cursor-pointer border border-black/15 bg-white px-4 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#5d6168] hover:border-black/30"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
