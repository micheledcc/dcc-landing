import "@/app/globals.css";
import { getAuth } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuth();

  return (
    <div className="min-h-screen bg-[#f3efe7] font-['IBM_Plex_Sans',system-ui,sans-serif] text-[#17191c]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f3efe7]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 no-underline text-inherit"
            >
              <span className="flex h-8 w-8 items-center justify-center border border-[#17191c] font-['IBM_Plex_Mono',monospace] text-[10px] font-medium tracking-wide">
                DCC
              </span>
              <span className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.18em] text-[#3a3d42]">
                Dashboard
              </span>
            </Link>
            <nav className="ml-8 flex gap-6">
              <Link
                href="/dashboard"
                className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168] no-underline hover:text-[#17191c]"
              >
                Pipeline
              </Link>
              <Link
                href="/dashboard/share"
                className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168] no-underline hover:text-[#17191c]"
              >
                Share Links
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-['IBM_Plex_Mono',monospace] text-[11px] text-[#8a6d40]">
              {auth?.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { cookies } = await import("next/headers");
        const jar = await cookies();
        jar.set("dcc_auth", "", { path: "/", maxAge: 0 });
        const { redirect } = await import("next/navigation");
        redirect("/login");
      }}
    >
      <button
        type="submit"
        className="cursor-pointer border border-black/15 bg-transparent px-3 py-1.5 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168] hover:border-black/30 hover:text-[#17191c]"
      >
        Sign out
      </button>
    </form>
  );
}
