import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.pulsecoach.ai" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "api.iconify.design" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self)" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ];
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

const sentryOpts = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  disableLogger: true,
  hideSourceMaps: true,
};

export default process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryOpts)
  : nextConfig;
