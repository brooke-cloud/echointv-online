import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.echointv.shop";

// 生成网站 Sitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, problems] = await Promise.all([
    prisma.post.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    }),

    prisma.problem.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
  ]);


  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${siteUrl}/problem`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];


  const blogPages: MetadataRoute.Sitemap =
    posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    }));


const problemPages:
  MetadataRoute.Sitemap =
    problems.map((problem) => ({
      url:
        `${siteUrl}/problem/${problem.slug}`,
      lastModified:
        problem.updatedAt,
      changeFrequency:
        "monthly",
      priority: 0.8,
    }));


  return [
    ...staticPages,
    ...blogPages,
    ...problemPages,
  ];
}