"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type TopTab = { href: string; label: string };

export function TopTabs({ tabs }: { tabs: TopTab[] }) {
  const pathname = usePathname();
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
      <nav className="flex min-w-max items-center gap-2 pb-1">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition",
                active
                  ? "bg-secondary text-secondary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
