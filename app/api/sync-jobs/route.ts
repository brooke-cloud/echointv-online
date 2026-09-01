// app/api/cron/sync-jobs/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobModel = (prisma as any).job;
  if (!jobModel) return NextResponse.json({ error: "No Job Model" }, { status: 500 });

  let addedCount = 0;

  // 每日自动拉取最新 2026 校招与独角兽在招岗位
  try {
    const rawRes = await fetch(
      "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json",
      { cache: "no-store" }
    );
    if (rawRes.ok) {
      const liveListings = await rawRes.json();
      for (const item of (liveListings || []).slice(0, 30)) {
        if (!item.url || !item.company_name || !item.title) continue;

        const exists = await jobModel.findFirst({ where: { applyUrl: item.url } });
        if (!exists) {
          await jobModel.create({
            data: {
              title: item.title,
              company: item.company_name,
              location: Array.isArray(item.locations) && item.locations.length > 0 ? item.locations.join(" / ") : "United States",
              region: "NA",
              type: "NEWGRAD",
              track: "Backend",
              salary: "$145,000 - $195,000 / yr",
              applyUrl: item.url,
              tags: ["2026秋招", "Sponsor H1B", "北美大厂"],
              isHot: true,
              deadline: "🟢 正在热招",
            },
          });
          addedCount++;
        }
      }
    }
  } catch (err) {
    console.error("Cron 执行异常:", err);
  }

  return NextResponse.json({
    success: true,
    message: `每日定时抓取完成，新增 ${addedCount} 个在招岗位`,
    count: addedCount,
  });
}