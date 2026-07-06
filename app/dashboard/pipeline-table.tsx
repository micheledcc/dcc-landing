"use client";

import { useState } from "react";

export function PipelineTable({
  headers,
  initialRows,
}: {
  headers: string[];
  initialRows: Record<string, string>[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const displayHeaders = headers.filter(
    (h) => !h.startsWith("_")
  );
  const allHeaders = headers;

  async function handleAddRow() {
    setSaving(true);
    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row: newRow }),
    });
    if (res.ok) {
      setRows([...rows, { ...newRow }]);
      setNewRow({});
      setAdding(false);
    }
    setSaving(false);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black/15">
            {allHeaders.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-3 py-3 text-left font-['IBM_Plex_Mono',monospace] text-[11px] font-medium uppercase tracking-wider text-[#5d6168]"
              >
                {h.startsWith("_") ? h.slice(1) : h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-black/8 hover:bg-black/[0.02]"
            >
              {allHeaders.map((h) => (
                <td
                  key={h}
                  className="max-w-[240px] truncate px-3 py-3 text-[#2c2f34]"
                >
                  {row[h] || ""}
                </td>
              ))}
            </tr>
          ))}

          {adding && (
            <tr className="border-b border-[#8a6d40]/30 bg-[#8a6d40]/5">
              {allHeaders.map((h) =>
                h.startsWith("_") ? (
                  <td key={h} className="px-3 py-2 text-xs text-[#8a6d40]">
                    auto
                  </td>
                ) : (
                  <td key={h} className="px-3 py-2">
                    <input
                      type="text"
                      value={newRow[h] || ""}
                      onChange={(e) =>
                        setNewRow({ ...newRow, [h]: e.target.value })
                      }
                      placeholder={h}
                      className="w-full border border-black/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-[#8a6d40]"
                    />
                  </td>
                )
              )}
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 flex gap-3">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="cursor-pointer border border-black/15 bg-white px-4 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#3a3d42] hover:border-black/30"
          >
            + Add row
          </button>
        ) : (
          <>
            <button
              onClick={handleAddRow}
              disabled={saving}
              className="cursor-pointer bg-[#17191c] px-4 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#f3efe7] hover:bg-[#2c2f34] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setNewRow({});
              }}
              className="cursor-pointer border border-black/15 bg-white px-4 py-2 font-['IBM_Plex_Mono',monospace] text-[12px] tracking-wide text-[#5d6168] hover:border-black/30"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
