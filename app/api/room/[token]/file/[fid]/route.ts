import { NextRequest, NextResponse } from "next/server";
import { getRoomLink } from "@/lib/room";
import { getDriveFileBuffer } from "@/lib/drive";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; fid: string }> }
) {
  const { token, fid } = await params;
  const link = await getRoomLink(token);

  if (!link || !link.is_active || new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { buffer, mimeType, name } = await getDriveFileBuffer(fid);

    const isDownload = _req.nextUrl.searchParams.get("download") === "1";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": buffer.length.toString(),
        ...(isDownload
          ? { "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"` }
          : { "Content-Disposition": "inline" }),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    console.error("Failed to fetch file:", e);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
