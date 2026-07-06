import { sql } from "./db";

export async function logView(shareLinkId: string, userAgent: string | null, referer: string | null) {
  await sql`
    INSERT INTO share_link_views (share_link_id, user_agent, referer)
    VALUES (${shareLinkId}, ${userAgent}, ${referer})
  `;
}

export async function getViewsSummary() {
  const result = await sql`
    SELECT
      share_link_id,
      COUNT(*)::int as view_count,
      MAX(viewed_at) as last_viewed,
      COUNT(DISTINCT user_agent)::int as unique_devices
    FROM share_link_views
    GROUP BY share_link_id
  `;
  const map: Record<string, { view_count: number; last_viewed: string; unique_devices: number }> = {};
  result.rows.forEach((r) => {
    map[r.share_link_id] = {
      view_count: r.view_count,
      last_viewed: r.last_viewed,
      unique_devices: r.unique_devices,
    };
  });
  return map;
}

export async function getViewsForLink(shareLinkId: string) {
  const result = await sql`
    SELECT viewed_at, user_agent, referer
    FROM share_link_views
    WHERE share_link_id = ${shareLinkId}
    ORDER BY viewed_at DESC
    LIMIT 50
  `;
  return result.rows;
}
