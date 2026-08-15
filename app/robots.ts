import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

// 搜索引擎爬虫规则
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",

      disallow: [
        "/admin/",
      ],
    },

    sitemap: `${siteUrl}/sitemap.xml`,
  };
}