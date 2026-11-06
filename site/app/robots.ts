import type { MetadataRoute } from "next";

// Static export: mark as fully static.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://marketfilter.biz/sitemap.xml",
  };
}
