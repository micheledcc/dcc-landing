import "@/app/globals.css";
import { getAuth } from "@/lib/auth";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuth();

  const navItems = [
    { href: "/dashboard", label: "Pipeline" },
    { href: "/dashboard/board", label: "Board" },
    { href: "/dashboard/documents", label: "Documents" },
    { href: "/dashboard/sharing", label: "Sharing" },
    ...(auth?.role === "owner" ? [{ href: "/dashboard/team", label: "Team" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#f3efe7] font-['IBM_Plex_Sans',system-ui,sans-serif] text-[#17191c]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f3efe7]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 no-underline text-inherit md:gap-3"
            >
              <span className="flex h-7 w-7 items-center justify-center border border-[#17191c] font-['IBM_Plex_Mono',monospace] text-[9px] font-medium tracking-wide md:h-8 md:w-8 md:text-[10px]">
                DCC
              </span>
              <span className="hidden font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.18em] text-[#3a3d42] sm:inline">
                Dashboard
              </span>
            </Link>
            {/* Desktop nav */}
            <nav className="ml-4 hidden items-center gap-5 md:ml-8 md:flex md:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-wider text-[#5d6168] no-underline hover:text-[#17191c]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden font-['IBM_Plex_Mono',monospace] text-[11px] text-[#8a6d40] sm:inline">
              {auth?.name}
            </span>
            <LogoutButton />
            {/* Mobile menu */}
            <MobileNav items={navItems} />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</main>
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
        className="cursor-pointer border border-black/15 bg-transparent px-2 py-1 font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-wider text-[#5d6168] hover:border-black/30 hover:text-[#17191c] md:px-3 md:py-1.5 md:text-[11px]"
      >
        Sign out
      </button>
    </form>
  );
}
