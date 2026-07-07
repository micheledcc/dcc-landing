import "@/app/globals.css";
import { getRoomLink } from "@/lib/room";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { PdfViewer } from "./pdf-viewer";
import { ImageViewer } from "./image-viewer";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FileViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string; fileId: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { token, fileId } = await params;
  const { email: queryEmail } = await searchParams;
  const link = await getRoomLink(token);

  if (!link || !link.is_active || new Date(link.expires_at) < new Date()) {
    return <Shell token={token}><p>Room not found or expired.</p></Shell>;
  }

  // Email gate check for gated rooms
  const allowedEmails: string[] | null =
    typeof link.allowed_emails === "string" ? JSON.parse(link.allowed_emails) : link.allowed_emails;
  let viewerEmail = queryEmail || undefined;

  if (allowedEmails && allowedEmails.length > 0) {
    const jar = await cookies();
    const viewerCookie = jar.get(`dcc_room_${token.substring(0, 16)}`)?.value;

    if (viewerCookie) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
        const { payload } = await jwtVerify(viewerCookie, secret);
        if (payload.token === token) viewerEmail = payload.email as string;
      } catch {}
    }
  }

  // Get file metadata from the files list
  const filesRes = await fetch(
    `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/room/${token}/files`,
    { cache: "no-store" }
  ).catch(() => null);

  let fileName = "Document";
  let mimeType = "";

  if (filesRes?.ok) {
    const { files } = await filesRes.json();
    const file = files?.find((f: any) => f.id === fileId);
    if (file) {
      fileName = file.name;
      mimeType = file.mimeType;
    }
  }

  const fileUrl = `/api/room/${token}/file/${fileId}`;
  const downloadUrl = `${fileUrl}?download=1`;
  const isPdf = mimeType === "application/pdf" || fileName.endsWith(".pdf");
  const isImage = mimeType.startsWith("image/");

  return (
    <Shell token={token}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/room/${token}`}
            className="mb-2 inline-block font-['IBM_Plex_Mono',monospace] text-[11px] text-[#8a6d40] no-underline hover:underline"
          >
            &larr; Back to data room
          </Link>
          <h1 className="font-['Spectral',Georgia,serif] text-2xl font-light">{fileName}</h1>
        </div>
        <a
          href={downloadUrl}
          className="flex items-center gap-2 border border-black/15 bg-white px-4 py-2 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#3a3d42] no-underline hover:border-black/25"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
        </a>
      </div>

      {isPdf && (
        <PdfViewer
          fileUrl={fileUrl}
          token={token}
          fileId={fileId}
          fileName={fileName}
          email={viewerEmail}
        />
      )}

      {isImage && (
        <ImageViewer
          fileUrl={fileUrl}
          token={token}
          fileId={fileId}
          fileName={fileName}
          email={viewerEmail}
        />
      )}

      {!isPdf && !isImage && (
        <div className="flex min-h-[40vh] items-center justify-center border border-black/10 bg-white">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-[#5d6168] font-['IBM_Plex_Mono',monospace] text-sm text-white">
              FILE
            </div>
            <p className="mb-4 text-[15px] text-[#5d6168]">This file type cannot be previewed.</p>
            <a
              href={downloadUrl}
              className="inline-block bg-[#17191c] px-6 py-3 font-['IBM_Plex_Mono',monospace] text-[12px] text-[#f3efe7] no-underline hover:bg-[#2c2f34]"
            >
              Download {fileName}
            </a>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children, token }: { children: React.ReactNode; token: string }) {
  return (
    <div className="min-h-screen bg-[#f3efe7] font-['IBM_Plex_Sans',system-ui,sans-serif] text-[#17191c]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[rgba(243,239,231,0.86)] backdrop-blur-[10px]">
        <div className="mx-auto flex h-[74px] max-w-[1160px] items-center px-10">
          <Link href={`/room/${token}`} className="flex items-center gap-[14px] no-underline text-inherit">
            <span className="flex h-[34px] w-[34px] items-center justify-center border border-[#17191c] font-['IBM_Plex_Mono',monospace] text-[11px] font-medium tracking-[0.04em]">DCC</span>
            <span className="font-['IBM_Plex_Mono',monospace] text-[10.5px] uppercase tracking-[0.22em] text-[#3a3d42]">Data Room</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1160px] px-10 py-8">{children}</main>
    </div>
  );
}
