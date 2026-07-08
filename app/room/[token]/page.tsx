import "@/app/globals.css";
import { getRoomLink } from "@/lib/room";
import { listDriveFolderTree, getFileIcon, formatFileSize, type DriveFile } from "@/lib/drive";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { EmailGate } from "@/app/view/[token]/email-gate";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await getRoomLink(token);

  if (!link || !link.is_active) {
    return <Shell><ErrorState code="404" title="Room not found" msg="This data room does not exist or has been revoked." /></Shell>;
  }

  if (new Date(link.expires_at) < new Date()) {
    return <Shell><ErrorState code="exp" title="Link expired" msg={`This link expired on ${new Date(link.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`} /></Shell>;
  }

  // Email gate check
  const allowedEmails: string[] | null =
    typeof link.allowed_emails === "string" ? JSON.parse(link.allowed_emails) : link.allowed_emails;
  let viewerEmail: string | undefined;

  if (allowedEmails && allowedEmails.length > 0) {
    const jar = await cookies();
    const viewerCookie = jar.get(`dcc_room_${token.substring(0, 16)}`)?.value;
    let verified = false;

    if (viewerCookie) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
        const { payload } = await jwtVerify(viewerCookie, secret);
        if (payload.token === token && allowedEmails.includes(payload.email as string)) {
          verified = true;
          viewerEmail = payload.email as string;
        }
      } catch {}
    }

    if (!verified) {
      return (
        <Shell>
          <EmailGate token={token} linkLabel={link.label} apiPrefix="/api/room" />
        </Shell>
      );
    }
  }

  // Load files
  const allowedFileIds =
    typeof link.allowed_file_ids === "string" ? JSON.parse(link.allowed_file_ids) : link.allowed_file_ids;

  let tree: DriveFile[];
  try {
    tree = await listDriveFolderTree(link.drive_folder_id, allowedFileIds);
  } catch {
    return <Shell><p className="text-red-600">Unable to load files. Please try again later.</p></Shell>;
  }

  function countFiles(items: DriveFile[]): number {
    let c = 0;
    for (const f of items) { if (f.isFolder && f.children) c += countFiles(f.children); else c++; }
    return c;
  }
  const totalFiles = countFiles(tree);

  return (
    <Shell>
      <div className="mb-10 border-b border-black/8 pb-10">
        <div className="mb-2 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-[0.22em] text-[#8a6d40]">
          {link.label}
        </div>
        <h1 className="mb-4 font-['Spectral',Georgia,serif] text-[clamp(28px,4vw,44px)] font-light leading-tight">
          Data Room
        </h1>
        <p className="max-w-[54ch] text-[15px] leading-relaxed text-[#5d6168]">
          {totalFiles} document{totalFiles !== 1 ? "s" : ""} available for review. Click to view or download.
        </p>
      </div>

      {/* File Tree */}
      <div className="grid gap-2">
        <FileTree items={tree} depth={0} token={token} viewerEmail={viewerEmail} canDownload={link.allow_download !== false} />
      </div>

      <div className="mt-8 border-t border-black/8 pt-6">
        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] leading-relaxed text-[#b9b2a4]">
          This data room is confidential. Do not distribute. Expires{" "}
          {new Date(link.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
        </p>
      </div>
    </Shell>
  );
}

function FileTree({ items, depth, token, viewerEmail, canDownload }: { items: DriveFile[]; depth: number; token: string; viewerEmail?: string; canDownload: boolean }) {
  return (
    <>
      {items.map((item) => {
        if (item.isFolder) {
          return (
            <div key={item.id}>
              {/* Folder header */}
              <div className="flex items-center gap-3 px-4 py-3 md:px-6" style={{ paddingLeft: `${depth * 20 + 16}px` }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#8a6d40]/30">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a6d40" strokeWidth="1.5">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-['IBM_Plex_Mono',monospace] text-[12px] font-medium uppercase tracking-wider text-[#3a3d42]">
                    {item.name}
                  </div>
                  <div className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#b9b2a4]">
                    {item.children?.length || 0} file{(item.children?.length || 0) !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              {/* Folder children */}
              {item.children && (
                <FileTree items={item.children} depth={depth + 1} token={token} viewerEmail={viewerEmail} canDownload={canDownload} />
              )}
            </div>
          );
        }

        const icon = getFileIcon(item.mimeType);
        const size = formatFileSize(item.size);
        const isViewable = item.mimeType === "application/pdf" || item.mimeType.startsWith("image/");
        const href = isViewable
          ? `/room/${token}/${item.id}${viewerEmail ? `?email=${encodeURIComponent(viewerEmail)}` : ""}`
          : canDownload
            ? `/api/room/${token}/file/${item.id}?download=1`
            : "#";

        return (
          <Link
            key={item.id}
            href={href}
            {...(!isViewable ? { target: "_blank" } : {})}
            className="flex items-center gap-4 border border-black/10 bg-white px-4 py-4 no-underline text-inherit transition-colors hover:border-black/20 hover:bg-[#faf9f6] md:gap-5 md:px-6 md:py-5"
            style={{ marginLeft: `${depth * 20}px` }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center font-['IBM_Plex_Mono',monospace] text-[10px] font-medium tracking-wide text-white md:h-12 md:w-12 md:text-[11px]"
              style={{
                backgroundColor:
                  icon === "PDF" ? "#c44" : icon === "IMG" ? "#3a7c5f" : icon === "XLS" ? "#2d6a4f" : icon === "DOC" ? "#1b4332" : "#5d6168",
              }}
            >
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-medium text-[#17191c] md:text-[15px]">{item.name}</div>
              <div className="mt-0.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">
                {size} &middot; {isViewable ? "Click to view" : canDownload ? "Click to download" : "View only"}
              </div>
            </div>
            <div className="hidden shrink-0 font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#b9b2a4] sm:block">
              {isViewable ? "View →" : canDownload ? "Download" : ""}
            </div>
          </Link>
        );
      })}
    </>
  );
}

function ErrorState({ code, title, msg }: { code: string; title: string; msg: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-black/15">
          <span className="font-['IBM_Plex_Mono',monospace] text-xs text-[#b9b2a4]">{code}</span>
        </div>
        <h1 className="mb-3 font-['Spectral',Georgia,serif] text-3xl font-light">{title}</h1>
        <p className="text-[15px] leading-relaxed text-[#5d6168]">{msg}</p>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3efe7] font-['IBM_Plex_Sans',system-ui,sans-serif] text-[#17191c]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[rgba(243,239,231,0.86)] backdrop-blur-[10px]">
        <div className="mx-auto flex h-14 md:h-[74px] max-w-[1160px] items-center px-4 md:px-10">
          <span className="flex h-[34px] w-[34px] items-center justify-center border border-[#17191c] font-['IBM_Plex_Mono',monospace] text-[11px] font-medium tracking-[0.04em]">DCC</span>
          <span className="ml-[14px] font-['IBM_Plex_Mono',monospace] text-[10.5px] uppercase tracking-[0.22em] text-[#3a3d42]">Digital&nbsp;Collateral&nbsp;Corporation</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1160px] px-4 md:px-10 py-16">{children}</main>
      <footer className="border-t border-black/8 bg-[#17191c] text-[#75766f]">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-4 md:px-10 py-10 flex-wrap gap-4">
          <div className="flex items-center gap-[13px]">
            <span className="flex h-7 w-7 items-center justify-center border border-[#75766f] font-['IBM_Plex_Mono',monospace] text-[9.5px] tracking-[0.04em] text-[#a9aaa6]">DCC</span>
            <span className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.18em] text-[#a9aaa6]">Digital Collateral Corporation</span>
          </div>
          <div className="max-w-[54ch] text-right text-[12px] leading-relaxed">&copy; 2026 Digital Collateral Corporation. Confidential.</div>
        </div>
      </footer>
    </div>
  );
}
