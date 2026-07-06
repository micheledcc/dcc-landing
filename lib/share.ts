import crypto from "crypto";
import { sql } from "./db";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createShareLink(params: {
  label: string;
  createdById: string;
  expiresInDays: number;
  visibleFields: string[];
}) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + params.expiresInDays);

  const result = await sql`
    INSERT INTO share_links (token, label, created_by_id, expires_at, visible_fields)
    VALUES (${token}, ${params.label}, ${params.createdById}, ${expiresAt.toISOString()}, ${JSON.stringify(params.visibleFields)})
    RETURNING id, token, label, expires_at, visible_fields, is_active, created_at
  `;

  return result.rows[0];
}

export async function getShareLink(token: string) {
  const result = await sql`
    SELECT sl.*, a.name as creator_name
    FROM share_links sl
    JOIN admins a ON sl.created_by_id = a.id
    WHERE sl.token = ${token}
  `;
  return result.rows[0] || null;
}

export async function listShareLinks() {
  const result = await sql`
    SELECT sl.*, a.name as creator_name
    FROM share_links sl
    JOIN admins a ON sl.created_by_id = a.id
    ORDER BY sl.created_at DESC
  `;
  return result.rows;
}

export async function revokeShareLink(id: string) {
  await sql`UPDATE share_links SET is_active = false WHERE id = ${id}`;
}
