import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://softlivi.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/templates", "/contact", "/privacy", "/terms"],
      disallow: ["/api/", "/dashboard", "/planner", "/goals", "/journal", "/analytics", "/reminders", "/cycle", "/settings", "/marketplace", "/onboarding", "/admin"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
