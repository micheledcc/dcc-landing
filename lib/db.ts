import { sql } from "@vercel/postgres";

export { sql };

export async function setupDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS share_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      created_by_id UUID REFERENCES admins(id) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      visible_fields JSONB NOT NULL DEFAULT '[]',
      row_filters JSONB NOT NULL DEFAULT '[]',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS share_link_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      share_link_id UUID REFERENCES share_links(id) NOT NULL,
      viewed_at TIMESTAMPTZ DEFAULT now(),
      user_agent TEXT,
      referer TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS email_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      share_link_id UUID REFERENCES share_links(id) NOT NULL,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INT DEFAULT 0,
      verified BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS room_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      created_by_id UUID REFERENCES admins(id) NOT NULL,
      drive_folder_id TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      allowed_emails JSONB,
      allowed_file_ids JSONB,
      allow_download BOOLEAN DEFAULT true,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_room_links_token ON room_links(token)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS room_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_link_id UUID REFERENCES room_links(id) NOT NULL,
      email TEXT,
      event_type TEXT NOT NULL,
      file_id TEXT NOT NULL,
      file_name TEXT,
      page_number INT,
      duration_seconds INT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  // Migrations for existing databases
  await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member'`.catch(() => {});
  await sql`ALTER TABLE share_links ADD COLUMN IF NOT EXISTS row_filters JSONB DEFAULT '[]'`.catch(() => {});
  await sql`ALTER TABLE share_links ADD COLUMN IF NOT EXISTS allowed_emails JSONB`.catch(() => {});
  // email_codes: allow room links too (share_link_id can be null for room codes)
  await sql`ALTER TABLE email_codes ALTER COLUMN share_link_id DROP NOT NULL`.catch(() => {});
  await sql`ALTER TABLE email_codes ADD COLUMN IF NOT EXISTS room_link_id UUID REFERENCES room_links(id)`.catch(() => {});
  await sql`ALTER TABLE room_links ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT true`.catch(() => {});
}
