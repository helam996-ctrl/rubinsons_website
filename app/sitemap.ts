import { MetadataRoute } from "next";
import { prisma } from "@/lib/db/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rubinsons.com";

  // 1. Static website routes
  const staticRoutes = [
    "",
    "/contact",
    "/investors",
    "/leadership",
    "/login",
    "/showcase",
    "/stories",
    "/businesses",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Dynamic business divisions
  let businessRoutes: { url: string; lastModified: Date; changeFrequency: "weekly"; priority: number }[] = [];
  try {
    const businesses = await prisma.business.findMany({
      select: { slug: true, updatedAt: true },
    });
    businessRoutes = businesses.map((b) => ({
      url: `${baseUrl}/businesses/${b.slug}`,
      lastModified: b.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[Sitemap] Database offline during sitemap generation:", err);
  }

  // 3. Dynamic stories
  let storyRoutes: { url: string; lastModified: Date; changeFrequency: "weekly"; priority: number }[] = [];
  try {
    const stories = await prisma.story.findMany({
      select: { slug: true, updatedAt: true },
    });
    storyRoutes = stories.map((s) => ({
      url: `${baseUrl}/stories/${s.slug}`,
      lastModified: s.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("[Sitemap] Database offline during sitemap generation:", err);
  }

  return [...staticRoutes, ...businessRoutes, ...storyRoutes];
}
