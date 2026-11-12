import { jwtVerify } from "jose";

export interface RoomAccess {
  is_active: boolean;
  expires_at: string | Date;
  allowed_emails?: string[] | string | null;
  allowed_file_ids?: string[] | string | null;
  allow_download?: boolean | null;
}

export function stringList(value: string[] | string | null | undefined): string[] | null {
  if (value == null) return null;
  const result: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(result) || !result.every((v) => typeof v === "string")) {
    throw new Error("Invalid room selection");
  }
  return result;
}

export function isRoomActive(link: RoomAccess | null | undefined, now = Date.now()): link is RoomAccess {
  return !!link?.is_active && new Date(link.expires_at).getTime() > now;
}

// The previous page-only cookie wasn't sent to /api/room. Use one versioned,
// HttpOnly cookie scoped to / for both the page and its file/list endpoints.
export function roomCookieName(token: string): string {
  return `dcc_room_v2_${token.substring(0, 16)}`;
}

export function roomSigningSecret(): Uint8Array {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function roomViewer(link: RoomAccess, token: string, cookie?: string): Promise<{ allowed: boolean; email?: string }> {
  const emails = stringList(link.allowed_emails);
  if (!emails?.length) return { allowed: true };
  if (!cookie) return { allowed: false };
  try {
    const { payload } = await jwtVerify(cookie, roomSigningSecret(), { algorithms: ["HS256"] });
    if (payload.type === "room_viewer" && payload.token === token &&
        typeof payload.email === "string" && emails.includes(payload.email)) {
      return { allowed: true, email: payload.email };
    }
  } catch {}
  return { allowed: false };
}

export function canServeRoomFile(link: RoomAccess, mimeType: string, download: boolean): boolean {
  return link.allow_download !== false || (!download && (mimeType === "application/pdf" || mimeType.startsWith("image/")));
}
