import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 hero-gradient" />
      <header className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Dumbbell className="h-5 w-5 text-primary" />
          <span className="gradient-text tracking-tight">CoachMe</span>
        </Link>
      </header>
      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
        {children}
      </main>
    </div>
  );
}
