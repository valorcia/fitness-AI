import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  Apple,
  Calendar,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Library,
  MapPinned,
  Settings,
  ShieldAlert,
  Trophy,
  Users,
  MessageCircleMore,
  Clock,
  ListIcon,
  Wand2,
  PlugZap,
} from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomNav } from "./bottom-nav";
import { ThemeToggle } from "./theme-toggle";
import { CoachHeaderButton } from "./coach-header-button";
import { getCurrentCoach } from "@/lib/coach/current-coach";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workout", label: "Séance", icon: Activity },
  { href: "/planning", label: "Planification", icon: Wand2 },
  { href: "/exercises", label: "Exercices", icon: Library },
  { href: "/calendar", label: "Calendrier", icon: Calendar },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
  { href: "/outdoor", label: "Outdoor", icon: MapPinned },
  { href: "/progression", label: "Progression", icon: Trophy },
  { href: "/community", label: "Communauté", icon: Users },
  { href: "/coach", label: "Coach", icon: MessageCircleMore },
  { href: "/settings/devices", label: "Appareils", icon: PlugZap },
  { href: "/subscription", label: "Abonnement", icon: CreditCard },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await auth();
  const coach = session?.user?.id ? await getCurrentCoach(session.user.id) : null;
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 border-b border-border px-5 py-4 text-base font-semibold"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/coachmii-fit-mark.svg" alt="" className="h-8 w-8" />
          <span className="font-display text-lg tracking-tight">Coachmii-fit</span>
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
              className="mt-4 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-amber-700 transition hover:bg-amber-500/15"
            >
              <ShieldAlert className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
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

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
          <Link href="/dashboard" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-secondary" aria-label="Récent">
            <Clock className="h-5 w-5" />
          </Link>
          {coach ? (
            <CoachHeaderButton
              portraitUrl={coach.portraitUrl}
              coachName={coach.displayName}
              fallbackKey={coach.avatarKey}
            />
          ) : (
            <div className="text-base font-semibold">Entraînements</div>
          )}
          <Link href="/exercises" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-secondary" aria-label="Catalogue">
            <ListIcon className="h-5 w-5" />
          </Link>
        </header>

        {/* Desktop top header */}
        <header className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:flex md:px-6">
          <span className="text-sm text-muted-foreground">
            Bonjour, {session?.user?.name?.split(" ")[0] ?? "athlète"} 👋
          </span>
          <div className="flex items-center gap-3">
            {coach && (
              <CoachHeaderButton
                portraitUrl={coach.portraitUrl}
                coachName={coach.displayName}
                fallbackKey={coach.avatarKey}
              />
            )}
            <ThemeToggle />
            <Button size="sm" variant="outline" asChild>
              <Link href="/safety/sos">SOS</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
