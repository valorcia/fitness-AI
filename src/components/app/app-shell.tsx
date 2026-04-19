import Link from "next/link";
import type { ReactNode } from "react";
import { Dumbbell, LayoutDashboard, MapPinned, Activity, Apple, Trophy, CreditCard, Settings, ShieldAlert, Calendar, Users, Library } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workout", label: "Séance", icon: Activity },
  { href: "/exercises", label: "Exercices", icon: Library },
  { href: "/calendar", label: "Calendrier", icon: Calendar },
  { href: "/outdoor", label: "Outdoor", icon: MapPinned },
  { href: "/progression", label: "Progression", icon: Trophy },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
  { href: "/community", label: "Communauté", icon: Users },
  { href: "/subscription", label: "Abonnement", icon: CreditCard },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await auth();
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-card/60 backdrop-blur-xl md:flex">
        <Link href="/" className="flex items-center gap-2 border-b border-border/60 p-5 font-semibold">
          <Dumbbell className="h-5 w-5 text-primary" />
          <span className="gradient-text tracking-tight">PulseCoach AI</span>
        </Link>
        <nav className="flex-1 space-y-1 p-3 text-sm">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="mt-4 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-amber-300 transition hover:bg-amber-500/10"
            >
              <ShieldAlert className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>
        <div className="border-t border-border/60 p-3">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 p-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{session?.user?.name ?? "Athlète"}</div>
              <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wide">
                {session?.user?.role ?? "USER"}
              </Badge>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" size="sm" variant="ghost">
                Quitter
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur md:px-6">
          <nav className="flex items-center gap-1 overflow-x-auto md:hidden">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </Link>
            ))}
          </nav>
          <span className="hidden text-sm text-muted-foreground md:block">
            Bonjour, {session?.user?.name?.split(" ")[0] ?? "athlète"} 👋
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/safety/sos">SOS</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
