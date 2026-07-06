import { getAuth } from "@/lib/auth";
import { listShareLinks } from "@/lib/share";
import { readPipeline } from "@/lib/sheets";
import { getViewsSummary } from "@/lib/analytics";
import { ShareManager } from "./share-manager";

export const dynamic = "force-dynamic";

export default async function SharePage() {
  const auth = await getAuth();
  if (!auth) return null;

  const [links, viewsSummary] = await Promise.all([
    listShareLinks(),
    getViewsSummary(),
  ]);

  let headers: string[] = [];
  try {
    const data = await readPipeline();
    headers = data.headers.filter((h) => !h.startsWith("_"));
  } catch {
    // If sheets aren't connected yet, allow empty headers
  }

  return (
    <div>
      <h1 className="mb-6 font-['Spectral',Georgia,serif] text-3xl font-light">
        Share Links
      </h1>
      <ShareManager
        initialLinks={links as any[]}
        availableFields={headers}
        viewsSummary={viewsSummary}
      />
    </div>
  );
}
