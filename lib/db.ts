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

  // Migrations for existing databases
  await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member'`.catch(() => {});
  await sql`ALTER TABLE share_links ADD COLUMN IF NOT EXISTS row_filters JSONB DEFAULT '[]'`.catch(() => {});
}
