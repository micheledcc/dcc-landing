import { getAuth } from "@/lib/auth";
import { readPipeline } from "@/lib/sheets";
import { DashboardView } from "./dashboard-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const auth = await getAuth();
  if (!auth) return null;

  let data: { headers: string[]; rows: Record<string, string>[] };
  try {
    data = await readPipeline();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return (
      <div>
        <h1 className="mb-4 font-['Spectral',Georgia,serif] text-3xl font-light">
          Investor Pipeline
        </h1>
        <div className="border border-red-300 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-medium">Could not load pipeline data</p>
          <p className="mt-1 text-red-600">{msg}</p>
          <p className="mt-3 text-xs text-red-500">
            Check that GOOGLE_CLIENT_ID, GOOGLE_SHEET_ID, and
            GOOGLE_SHEET_RANGE are set correctly.
          </p>
        </div>
      </div>
    );
  }

  return <DashboardView headers={data.headers} rows={data.rows} />;
}
