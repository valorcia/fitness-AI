import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "PulseCoach AI — Coach sportif IA premium",
    template: "%s · PulseCoach AI",
  },
  description:
    "PulseCoach AI, votre coach sportif intelligent : programmes personnalisés, coaching vocal, outdoor GPS, nutrition, gamification.",
  keywords: [
    "coach IA sport",
    "application fitness IA",
    "coach salle intelligent",
    "programme running IA",
    "coach vocal fitness",
  ],
  openGraph: {
    title: "PulseCoach AI",
    description:
      "Coach sportif IA premium — plans adaptatifs, coach vocal, GPS outdoor, nutrition et gamification.",
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "PulseCoach AI",
  },
  twitter: { card: "summary_large_image", title: "PulseCoach AI" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050816" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
