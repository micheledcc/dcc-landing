import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { TeamManager } from "./team-manager";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const auth = await getAuth();
  if (!auth) return null;
  if (auth.role !== "owner") redirect("/dashboard");

  const result = await sql`
    SELECT id, email, name, COALESCE(role, 'member') as role, created_at
    FROM admins ORDER BY created_at ASC
  `;

  return (
    <div>
      <h1 className="mb-6 font-['Spectral',Georgia,serif] text-3xl font-light">
        Team
      </h1>
      <TeamManager initialMembers={result.rows as any[]} currentUserId={auth.sub} />
    </div>
  );
}
