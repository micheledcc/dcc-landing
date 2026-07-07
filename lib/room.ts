import crypto from "crypto";
import { sql } from "./db";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createRoomLink(params: {
  label: string;
  createdById: string;
  driveFolderId: string;
  expiresInDays: number;
  allowedEmails?: string[];
  allowedFileIds?: string[];
}) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + params.expiresInDays);
  const emails = params.allowedEmails?.length
    ? JSON.stringify(params.allowedEmails.map((e) => e.toLowerCase().trim()))
    : null;
  const fileIds = params.allowedFileIds?.length
    ? JSON.stringify(params.allowedFileIds)
    : null;

  const result = await sql`
    INSERT INTO room_links (token, label, created_by_id, drive_folder_id, expires_at, allowed_emails, allowed_file_ids)
    VALUES (${token}, ${params.label}, ${params.createdById}, ${params.driveFolderId}, ${expiresAt.toISOString()}, ${emails}, ${fileIds})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getRoomLink(token: string) {
  const result = await sql`
    SELECT rl.*, a.name as creator_name
    FROM room_links rl
    JOIN admins a ON rl.created_by_id = a.id
    WHERE rl.token = ${token}
  `;
  return result.rows[0] || null;
}

export async function listRoomLinks() {
  const result = await sql`
    SELECT rl.*, a.name as creator_name
    FROM room_links rl
    JOIN admins a ON rl.created_by_id = a.id
    ORDER BY rl.created_at DESC
  `;
  return result.rows;
}

export async function revokeRoomLink(id: string) {
  await sql`UPDATE room_links SET is_active = false WHERE id = ${id}`;
}

export async function logRoomEvent(params: {
  roomLinkId: string;
  email?: string;
  eventType: "view_file" | "view_page" | "download";
  fileId: string;
  fileName?: string;
  pageNumber?: number;
  durationSeconds?: number;
  userAgent?: string;
}) {
  await sql`
    INSERT INTO room_events (room_link_id, email, event_type, file_id, file_name, page_number, duration_seconds, user_agent)
    VALUES (${params.roomLinkId}, ${params.email || null}, ${params.eventType}, ${params.fileId}, ${params.fileName || null}, ${params.pageNumber || null}, ${params.durationSeconds || null}, ${params.userAgent || null})
  `;
}

export async function getRoomAnalytics(roomLinkId: string) {
  const events = await sql`
    SELECT event_type, file_id, file_name, email, page_number, duration_seconds, created_at
    FROM room_events
    WHERE room_link_id = ${roomLinkId}
    ORDER BY created_at DESC
    LIMIT 500
  `;

  const summary = await sql`
    SELECT
      COUNT(*) FILTER (WHERE event_type = 'view_file')::int as total_views,
      COUNT(*) FILTER (WHERE event_type = 'download')::int as total_downloads,
      COUNT(DISTINCT email) FILTER (WHERE email IS NOT NULL)::int as unique_viewers,
      COUNT(DISTINCT file_id)::int as files_accessed
    FROM room_events
    WHERE room_link_id = ${roomLinkId}
  `;

  return {
    events: events.rows,
    summary: summary.rows[0],
  };
}

export async function getAllRoomAnalytics() {
  const result = await sql`
    SELECT
      room_link_id,
      COUNT(*) FILTER (WHERE event_type = 'view_file')::int as views,
      COUNT(*) FILTER (WHERE event_type = 'download')::int as downloads,
      COUNT(DISTINCT email) FILTER (WHERE email IS NOT NULL)::int as viewers,
      MAX(created_at) as last_activity
    FROM room_events
    GROUP BY room_link_id
  `;
  const map: Record<string, any> = {};
  result.rows.forEach((r) => {
    map[r.room_link_id] = r;
  });
  return map;
}
