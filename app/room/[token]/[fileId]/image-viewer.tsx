"use client";

import { useEffect, useRef } from "react";

export function ImageViewer({
  fileUrl,
  token,
  fileId,
  fileName,
  email,
}: {
  fileUrl: string;
  token: string;
  fileId: string;
  fileName: string;
  email?: string;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch(`/api/room/${token}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "view_file", fileId, fileName, email }),
    }).catch(() => {});
  }, [token, fileId, fileName, email]);

  return (
    <div className="border border-black/10 bg-white p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fileUrl}
        alt={fileName}
        className="mx-auto max-h-[80vh] max-w-full object-contain"
      />
    </div>
  );
}
