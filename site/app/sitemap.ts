import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://marketfilter.biz";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: `${base}/news`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/stories`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/filings`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/method`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/sources`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
