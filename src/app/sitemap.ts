import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://softlivi.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/pricing", "/templates", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
