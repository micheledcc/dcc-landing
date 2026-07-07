"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer border border-black/15 bg-transparent p-1.5 text-[#5d6168] hover:border-black/30"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-14 z-50 border-b border-black/10 bg-[#f3efe7] px-4 py-3 shadow-sm">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded px-3 py-2.5 font-['IBM_Plex_Mono',monospace] text-[12px] uppercase tracking-wider text-[#5d6168] no-underline hover:bg-black/5 hover:text-[#17191c]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
