import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { ConsentBanner } from "@/features/rgpd/consent-banner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Coachmii-fit — Coach sportif IA premium",
    template: "%s · Coachmii-fit",
  },
  description:
    "Coachmii-fit, votre coach sportif intelligent : programmes personnalisés, coaching vocal, outdoor GPS, nutrition, gamification.",
  keywords: [
    "coach IA sport",
    "application fitness IA",
    "coach salle intelligent",
    "programme running IA",
    "coach vocal fitness",
  ],
  openGraph: {
    title: "Coachmii-fit",
    description:
      "Coach sportif IA premium — plans adaptatifs, coach vocal, GPS outdoor, nutrition et gamification.",
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Coachmii-fit",
  },
  twitter: { card: "summary_large_image", title: "Coachmii-fit" },
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
      <head>
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,800,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          {children}
          <ConsentBanner />
        </Providers>
      </body>
    </html>
  );
}
