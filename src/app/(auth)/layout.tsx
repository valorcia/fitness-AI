import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 hero-gradient" />
      <header className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/coachme-mark.svg" alt="" className="h-7 w-7" />
          <span className="font-display text-lg tracking-tight">CoachMe</span>
        </Link>
      </header>
      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
        {children}
      </main>
    </div>
  );
}
