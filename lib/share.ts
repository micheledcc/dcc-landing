import crypto from "crypto";
import { sql } from "./db";

export interface RowFilter {
  field: string;
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains";
  value: string;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createShareLink(params: {
  label: string;
  createdById: string;
  expiresInDays: number;
  visibleFields: string[];
  rowFilters?: RowFilter[];
  allowedEmails?: string[];
}) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + params.expiresInDays);
  const emails = params.allowedEmails?.length
    ? JSON.stringify(params.allowedEmails.map((e) => e.toLowerCase().trim()))
    : null;

  const result = await sql`
    INSERT INTO share_links (token, label, created_by_id, expires_at, visible_fields, row_filters, allowed_emails)
    VALUES (${token}, ${params.label}, ${params.createdById}, ${expiresAt.toISOString()}, ${JSON.stringify(params.visibleFields)}, ${JSON.stringify(params.rowFilters || [])}, ${emails})
    RETURNING id, token, label, expires_at, visible_fields, row_filters, allowed_emails, is_active, created_at
  `;

  return result.rows[0];
}

export function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
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

function parseCurrency(s: string): number {
  if (!s) return 0;
  return parseFloat(s.replace(/[$,]/g, "")) || 0;
}

function parsePercent(s: string): number {
  if (!s) return 0;
  return parseFloat(s.replace(/%/g, "")) || 0;
}

export function applyRowFilters(
  rows: Record<string, string>[],
  filters: RowFilter[]
): Record<string, string>[] {
  if (!filters || filters.length === 0) return rows;

  return rows.filter((row) =>
    filters.every((f) => {
      const raw = row[f.field] || "";
      const numVal = raw.includes("$")
        ? parseCurrency(raw)
        : raw.includes("%")
          ? parsePercent(raw)
          : parseFloat(raw);
      const numTarget = parseFloat(f.value);
      const isNum = !isNaN(numVal) && !isNaN(numTarget);

      switch (f.op) {
        case "eq":
          return raw.toLowerCase() === f.value.toLowerCase();
        case "neq":
          return raw.toLowerCase() !== f.value.toLowerCase();
        case "gt":
          return isNum && numVal > numTarget;
        case "gte":
          return isNum && numVal >= numTarget;
        case "lt":
          return isNum && numVal < numTarget;
        case "lte":
          return isNum && numVal <= numTarget;
        case "contains":
          return raw.toLowerCase().includes(f.value.toLowerCase());
        default:
          return true;
      }
    })
  );
}
