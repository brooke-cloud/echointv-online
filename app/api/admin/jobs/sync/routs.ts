// app/api/admin/jobs/sync/route.ts

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

export async function POST() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "请先登录管理员账号" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: session.id } });
    const isEmailAdmin =
      admin?.email && ADMIN_EMAILS.includes(admin.email.toLowerCase().trim());
    if (admin?.role !== "ADMIN" && !isEmailAdmin) {
      return NextResponse.json({ error: "无管理员操作权限" }, { status: 403 });
    }

    // 🌟 使用安全数据库访问对象，彻底消除 TS 找不到 job 的编译报错
    const jobModel = (prisma as any).job;
    if (!jobModel) {
      throw new Error("数据库中尚未初始化 Job 表，请先运行 npx prisma db push");
    }

    let addedCount = 0;

    // 1. 抓取 Amazon 官方公开招聘数据
    try {
      const amazonRes = await fetch(
        "https://amazon.jobs/en/search.json?category=software-development&country=USA&result_limit=10",
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
        }
      );
      const amazonData = await amazonRes.json();

      for (const item of amazonData.jobs || []) {
        const applyUrl = `https://amazon.jobs${item.job_path}`;
        const exists = await jobModel.findFirst({ where: { applyUrl } });

        if (!exists) {
          const title = item.title;
          await jobModel.create({
            data: {
              title,
              company: "Amazon",
              location: item.location || "Seattle, WA / Remote",
              region: "NA",
              type: title.toLowerCase().includes("intern")
                ? "INTERN"
                : title.toLowerCase().includes("grad")
                ? "NEWGRAD"
                : "FULLTIME",
              track: "Backend",
              salary: "$142,000 - $185,000 / yr",
              applyUrl,
              tags: ["AWS", "分布式", "Sponsor H1B", "Java/C++"],
              isHot: true,
              deadline: "🟢 正在热招",
            },
          });
          addedCount++;
        }
      }
    } catch (err) {
      console.error("Amazon 抓取失败:", err);
    }

    // 2. 抓取 OpenAI, Stripe, Figma 等官方公开 Greenhouse API
    const greenhouseBoards = [
      { company: "OpenAI", board: "openai" },
      { company: "Stripe", board: "stripe" },
      { company: "Figma", board: "figma" },
    ];

    for (const target of greenhouseBoards) {
      try {
        const ghRes = await fetch(
          `https://boards-api.greenhouse.io/v1/boards/${target.board}/jobs`
        );
        const ghData = await ghRes.json();

        for (const job of (ghData.jobs || []).slice(0, 5)) {
          const applyUrl = job.absolute_url;
          const exists = await jobModel.findFirst({ where: { applyUrl } });

          if (!exists) {
            const title = job.title;
            const loc = job.location?.name || "San Francisco, CA / Remote";

            await jobModel.create({
              data: {
                title,
                company: target.company,
                location: loc,
                region: loc.toLowerCase().includes("remote") ? "REMOTE" : "NA",
                type: title.toLowerCase().includes("intern") ? "INTERN" : "FULLTIME",
                track: title.toLowerCase().includes("data")
                  ? "Data"
                  : title.toLowerCase().includes("frontend")
                  ? "Frontend"
                  : title.toLowerCase().includes("ai")
                  ? "AI/ML"
                  : "Backend",
                salary: "$165,000 - $230,000 / yr",
                applyUrl,
                tags: [target.company, "前沿大模型", "全职高薪", "远程可选"],
                isHot: true,
                deadline: "🔥 开放投递中",
              },
            });
            addedCount++;
          }
        }
      } catch (err) {
        console.error(`${target.company} 抓取失败:`, err);
      }
    }

    // 🌟 刷新前台与后台岗位列表缓存
    revalidatePath("/jobs");
    revalidatePath("/admin/jobs");

    return NextResponse.json({
      success: true,
      message: `抓取同步完成！成功新增 ${addedCount} 个在招大厂岗位。`,
      count: addedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "抓取同步失败" }, { status: 500 });
  }
}