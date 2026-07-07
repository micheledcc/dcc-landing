import "@/app/globals.css";
import { getRoomLink } from "@/lib/room";
import { listDriveFolder, getFileIcon, formatFileSize } from "@/lib/drive";
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

  let files;
  try {
    files = await listDriveFolder(link.drive_folder_id, allowedFileIds);
  } catch {
    return <Shell><p className="text-red-600">Unable to load files. Please try again later.</p></Shell>;
  }

  const pdfs = files.filter((f) => f.mimeType === "application/pdf");
  const images = files.filter((f) => f.mimeType.startsWith("image/"));
  const others = files.filter((f) => f.mimeType !== "application/pdf" && !f.mimeType.startsWith("image/"));

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
          {files.length} document{files.length !== 1 ? "s" : ""} available for review. Click to view or download.
        </p>
      </div>

      {/* File Grid */}
      <div className="grid gap-3">
        {[...pdfs, ...images, ...others].map((file) => {
          const icon = getFileIcon(file.mimeType);
          const size = formatFileSize(file.size);
          const isViewable = file.mimeType === "application/pdf" || file.mimeType.startsWith("image/");
          const canDownload = link.allow_download !== false;
          const href = isViewable
            ? `/room/${token}/${file.id}${viewerEmail ? `?email=${encodeURIComponent(viewerEmail)}` : ""}`
            : canDownload
              ? `/api/room/${token}/file/${file.id}?download=1`
              : "#";

          return (
            <Link
              key={file.id}
              href={href}
              {...(!isViewable ? { target: "_blank" } : {})}
              className="flex items-center gap-5 border border-black/10 bg-white px-6 py-5 no-underline text-inherit transition-colors hover:border-black/20 hover:bg-[#faf9f6]"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center font-['IBM_Plex_Mono',monospace] text-[11px] font-medium tracking-wide text-white"
                style={{
                  backgroundColor:
                    icon === "PDF" ? "#c44" : icon === "IMG" ? "#3a7c5f" : icon === "XLS" ? "#2d6a4f" : icon === "DOC" ? "#1b4332" : "#5d6168",
                }}
              >
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-medium text-[#17191c]">{file.name}</div>
                <div className="mt-0.5 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">
                  {size} &middot; {isViewable ? "Click to view" : canDownload ? "Click to download" : "View only"}
                </div>
              </div>
              <div className="shrink-0 font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#b9b2a4]">
                {isViewable ? "View &rarr;" : "Download"}
              </div>
            </Link>
          );
        })}
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
        <div className="mx-auto flex h-[74px] max-w-[1160px] items-center px-10">
          <span className="flex h-[34px] w-[34px] items-center justify-center border border-[#17191c] font-['IBM_Plex_Mono',monospace] text-[11px] font-medium tracking-[0.04em]">DCC</span>
          <span className="ml-[14px] font-['IBM_Plex_Mono',monospace] text-[10.5px] uppercase tracking-[0.22em] text-[#3a3d42]">Digital&nbsp;Collateral&nbsp;Corporation</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1160px] px-10 py-16">{children}</main>
      <footer className="border-t border-black/8 bg-[#17191c] text-[#75766f]">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-10 py-10 flex-wrap gap-4">
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
