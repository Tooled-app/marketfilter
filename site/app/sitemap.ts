import type { MetadataRoute } from "next";
import { getStories } from "@/lib/data";

// Static export: generated once at build time.
export const dynamic = "force-static";

// Generated at build time — no force-dynamic (incompatible with static export).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://marketfilter.biz";
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: `${base}/news`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/stories`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/filings`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/method`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/sources`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Every investigation, so the archive is fully discoverable.
  for (const story of getStories() ?? []) {
    pages.push({
      url: `${base}/stories/${story.id}`,
      lastModified: story.published ? new Date(story.published) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return pages;
}
