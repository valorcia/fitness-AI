import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 hero-gradient" />
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <nav className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/coachme-mark.svg" alt="" className="h-7 w-7" />
            <span className="font-display text-lg tracking-tight">CoachMe</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/#features" className="hover:text-foreground">Fonctionnalités</Link>
            <Link href="/#pricing" className="hover:text-foreground">Tarifs</Link>
            <Link href="/blog" className="hover:text-foreground">Blog</Link>
            <Link href="/legal/privacy" className="hover:text-foreground">Confidentialité</Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Essayer</Link>
            </Button>
          </div>
        </nav>
      </header>
      <main className="container py-16">{children}</main>
      <footer className="border-t border-border/40 py-10">
        <div className="container flex flex-col items-start justify-between gap-6 text-sm text-muted-foreground md:flex-row">
          <div>
            <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <Dumbbell className="h-4 w-4 text-primary" /> CoachMe
            </div>
            <p className="max-w-sm">
              Le coach sportif intelligent pour votre performance, votre santé et votre plaisir du mouvement.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Link href="/legal/terms">Conditions</Link>
            <Link href="/legal/privacy">Confidentialité</Link>
            <Link href="/legal/processors">Sous-traitants</Link>
          </div>
          <div className="text-xs">© {new Date().getFullYear()} CoachMe. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}
