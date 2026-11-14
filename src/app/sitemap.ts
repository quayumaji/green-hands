import type { MetadataRoute } from "next";
import { getMenu, withFallback } from "@/lib/api";
import { FALLBACK_MENU } from "@/data/fallback";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: menu } = await withFallback(getMenu, FALLBACK_MENU, "menu");
  const now = new Date();
  const pages: MetadataRoute.Sitemap = ["", "/menu", "/about", "/gallery", "/contact"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: p === "/menu" ? "daily" : "monthly",
    priority: p === "" || p === "/menu" ? 1 : 0.7,
  }));
  for (const c of menu.categories) for (const i of c.items) pages.push({ url: `${SITE_URL}/menu/${i.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.6 });
  return pages;
}
