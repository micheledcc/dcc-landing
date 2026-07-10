import { getAuth } from "@/lib/auth";
import { readPipeline, readAllPipeline } from "@/lib/sheets";
import { DashboardView } from "./dashboard-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const auth = await getAuth();
  if (!auth) return null;

  let allRows: Awaited<ReturnType<typeof readAllPipeline>> = [];
  let commitmentHeaders: string[] = [];

  try {
    const [all, commitments] = await Promise.all([
      readAllPipeline(),
      readPipeline(),
    ]);
    allRows = all;
    commitmentHeaders = commitments.headers;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return (
      <div>
        <h1 className="mb-4 font-['Spectral',Georgia,serif] text-3xl font-light">
          Pipeline
        </h1>
        <div className="border border-red-300 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-medium">Could not load pipeline data</p>
          <p className="mt-1 text-red-600">{msg}</p>
        </div>
      </div>
    );
  }

  return <DashboardView allRows={allRows} commitmentHeaders={commitmentHeaders} />;
}
