"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "./LogoMark";

const links = [
  { href: "/", label: "Overview" },
  { href: "/models", label: "Models" },
  { href: "/methodology", label: "Methodology" },
];

/** Floating pill navbar: sticky, inset from the edges, translucent over page content. */
export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-3 z-40 px-3 pt-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-xl border border-line bg-bg/80 py-2 pl-4 pr-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] backdrop-blur-md">
        <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[17px] font-semibold tracking-tight">
          <LogoMark size={26} />
          CodingPlans
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`eyebrow whitespace-nowrap rounded-md px-2.5 py-2 transition-colors ${
                  active ? "bg-surface-2 !text-ink" : "hover:!text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden sm:block">
          <Link href="/#leaderboard" className="btn btn-primary !h-9">
            <span aria-hidden className="btn-icon text-[13px]">»</span>
            Compare plans
          </Link>
        </div>
      </div>
    </header>
  );
}
