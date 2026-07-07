import { getAuth } from "@/lib/auth";
import { listDriveFolder, getFileIcon, formatFileSize } from "@/lib/drive";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const DRIVE_FOLDER_ID = "1GDls9NYWeAuk1y3UN4TyEhbgl7nFX-se";

export default async function DocumentsPage() {
  const auth = await getAuth();
  if (!auth) return null;

  let files;
  try {
    files = await listDriveFolder(DRIVE_FOLDER_ID);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return (
      <div>
        <h1 className="mb-4 font-['Spectral',Georgia,serif] text-3xl font-light">
          Documents
        </h1>
        <div className="border border-red-300 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-medium">Could not load documents from Google Drive</p>
          <p className="mt-1 text-red-600">{msg}</p>
        </div>
      </div>
    );
  }

  // Get analytics per file across ALL room links
  let fileAnalytics: Record<string, { views: number; downloads: number; viewers: number }> = {};
  try {
    const result = await sql`
      SELECT
        file_id,
        COUNT(*) FILTER (WHERE event_type = 'view_file')::int as views,
        COUNT(*) FILTER (WHERE event_type = 'download')::int as downloads,
        COUNT(DISTINCT email) FILTER (WHERE email IS NOT NULL)::int as viewers
      FROM room_events
      GROUP BY file_id
    `;
    result.rows.forEach((r) => {
      fileAnalytics[r.file_id] = { views: r.views, downloads: r.downloads, viewers: r.viewers };
    });
  } catch {}

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-['Spectral',Georgia,serif] text-3xl font-light">
            Documents
          </h1>
          <p className="mt-1 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#8a6d40] uppercase tracking-wider">
            Google Drive &middot; {files.length} files
          </p>
        </div>
        <a
          href="https://drive.google.com/drive/folders/1GDls9NYWeAuk1y3UN4TyEhbgl7nFX-se"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-black/12 bg-white px-3 py-2 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#3a3d42] no-underline hover:border-black/25"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open in Drive
        </a>
      </div>

      <div className="overflow-x-auto border border-black/10 bg-white">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-black/12 bg-[#faf9f6]">
              <th className="px-4 py-3 text-left font-['IBM_Plex_Mono',monospace] text-[11px] font-medium uppercase tracking-wider text-[#5d6168]">File</th>
              <th className="px-4 py-3 text-left font-['IBM_Plex_Mono',monospace] text-[11px] font-medium uppercase tracking-wider text-[#5d6168]">Type</th>
              <th className="px-4 py-3 text-left font-['IBM_Plex_Mono',monospace] text-[11px] font-medium uppercase tracking-wider text-[#5d6168]">Size</th>
              <th className="px-4 py-3 text-left font-['IBM_Plex_Mono',monospace] text-[11px] font-medium uppercase tracking-wider text-[#5d6168]">Views</th>
              <th className="px-4 py-3 text-left font-['IBM_Plex_Mono',monospace] text-[11px] font-medium uppercase tracking-wider text-[#5d6168]">Downloads</th>
              <th className="px-4 py-3 text-left font-['IBM_Plex_Mono',monospace] text-[11px] font-medium uppercase tracking-wider text-[#5d6168]">Viewers</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => {
              const icon = getFileIcon(file.mimeType);
              const stats = fileAnalytics[file.id];
              const iconBg =
                icon === "PDF" ? "#c44" : icon === "IMG" ? "#3a7c5f" : icon === "XLS" ? "#2d6a4f" : icon === "DOC" ? "#1b4332" : "#5d6168";

              return (
                <tr key={file.id} className="border-b border-black/6 hover:bg-[#f9f7f2]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center font-['IBM_Plex_Mono',monospace] text-[9px] font-medium text-white"
                        style={{ backgroundColor: iconBg }}
                      >
                        {icon}
                      </div>
                      <span className="font-medium text-[#17191c]">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-['IBM_Plex_Mono',monospace] text-[11px] text-[#5d6168]">
                    {icon}
                  </td>
                  <td className="px-4 py-3 font-['IBM_Plex_Mono',monospace] text-[12px] tabular-nums text-[#3a3d42]">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-4 py-3 font-['IBM_Plex_Mono',monospace] text-[12px] tabular-nums text-[#3a3d42]">
                    {stats?.views || 0}
                  </td>
                  <td className="px-4 py-3 font-['IBM_Plex_Mono',monospace] text-[12px] tabular-nums text-[#3a3d42]">
                    {stats?.downloads || 0}
                  </td>
                  <td className="px-4 py-3 font-['IBM_Plex_Mono',monospace] text-[12px] tabular-nums text-[#8a6d40]">
                    {stats?.viewers || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
