import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_APP_URL;
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/blog`, lastModified: now, priority: 0.7 },
    { url: `${base}/legal/privacy`, lastModified: now, priority: 0.3 },
  ];
}
