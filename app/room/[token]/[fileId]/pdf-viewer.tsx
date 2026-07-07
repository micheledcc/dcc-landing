"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function PdfViewer({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1.5);
  const pageStartRef = useRef(Date.now());
  const trackedRef = useRef(false);

  const track = useCallback(
    (event: string, extra?: Record<string, any>) => {
      fetch(`/api/room/${token}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, fileId, fileName, email, ...extra }),
      }).catch(() => {});
    },
    [token, fileId, fileName, email]
  );

  // Load PDF
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const doc = await pdfjsLib.getDocument(fileUrl).promise;
      if (!cancelled) {
        setPdf(doc);
        setTotal(doc.numPages);
        setLoading(false);
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [fileUrl]);

  // Track initial view
  useEffect(() => {
    if (!trackedRef.current && pdf) {
      track("view_file");
      trackedRef.current = true;
    }
  }, [pdf, track]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    async function render() {
      const p = await pdf.getPage(page);
      const viewport = p.getViewport({ scale });
      const canvas = canvasRef.current!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await p.render({ canvasContext: ctx, viewport }).promise;
    }

    render();
  }, [pdf, page, scale]);

  // Track page duration on page change
  function changePage(newPage: number) {
    if (newPage < 1 || newPage > total) return;

    const duration = Math.round((Date.now() - pageStartRef.current) / 1000);
    if (duration > 0) {
      track("view_page", { page, duration });
    }

    setPage(newPage);
    pageStartRef.current = Date.now();
  }

  // Track duration on unload
  useEffect(() => {
    function handleUnload() {
      const duration = Math.round((Date.now() - pageStartRef.current) / 1000);
      if (duration > 0) {
        navigator.sendBeacon(
          `/api/room/${token}/track`,
          JSON.stringify({ event: "view_page", fileId, fileName, email, page, duration })
        );
      }
    }
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [token, fileId, fileName, email, page]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") changePage(page + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") changePage(page - 1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center border border-black/10 bg-white">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#8a6d40] border-t-transparent" />
          <p className="font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-3 flex items-center justify-between border border-black/10 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => changePage(page - 1)}
            disabled={page <= 1}
            className="cursor-pointer border border-black/15 bg-white px-3 py-1 font-['IBM_Plex_Mono',monospace] text-[12px] disabled:opacity-30"
          >
            &larr; Prev
          </button>
          <span className="font-['IBM_Plex_Mono',monospace] text-[12px] text-[#3a3d42]">
            Page {page} of {total}
          </span>
          <button
            onClick={() => changePage(page + 1)}
            disabled={page >= total}
            className="cursor-pointer border border-black/15 bg-white px-3 py-1 font-['IBM_Plex_Mono',monospace] text-[12px] disabled:opacity-30"
          >
            Next &rarr;
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(Math.max(0.5, scale - 0.25))} className="cursor-pointer border border-black/15 bg-white px-2 py-1 text-xs">-</button>
          <span className="font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(Math.min(3, scale + 0.25))} className="cursor-pointer border border-black/15 bg-white px-2 py-1 text-xs">+</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="overflow-auto border border-black/10 bg-[#525659] p-4">
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="shadow-lg" />
        </div>
      </div>

      {/* Page indicator */}
      <div className="mt-3 flex justify-center gap-1">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => changePage(i + 1)}
            className={`h-1.5 cursor-pointer border-none transition-all ${
              i + 1 === page ? "w-6 bg-[#8a6d40]" : "w-1.5 bg-black/15 hover:bg-black/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
