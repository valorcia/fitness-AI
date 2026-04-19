"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  Users,
  MessageCircleMore,
  BookOpenText,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Entraînements", icon: Dumbbell, match: ["/dashboard", "/workout", "/calendar", "/exercises", "/nutrition"] },
  { href: "/community", label: "Feed", icon: Users, match: ["/community"] },
  { href: "/coach", label: "Message", icon: MessageCircleMore, match: ["/coach"] },
  { href: "/manual", label: "Manuel", icon: BookOpenText, match: ["/manual"] },
  { href: "/settings", label: "Plus", icon: MoreHorizontal, match: ["/settings", "/subscription", "/progression", "/safety"] },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
      <ul className="flex items-stretch justify-around safe-area-bottom">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match.some((p) => pathname === p || pathname.startsWith(`${p}/`));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} strokeWidth={active ? 2.3 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
