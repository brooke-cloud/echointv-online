// scripts/reset-to-pure-jobs.js

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// 🌟 核心目标大厂名录
const TARGET_BIG_TECH = [
  "Google", "Alphabet", "Meta", "Facebook", "Amazon", "AWS", "Apple", "Microsoft", "Netflix",
  "OpenAI", "Anthropic", "Nvidia", "NVIDIA", "Scale AI", "ScaleAI", "Stripe", "Databricks",
  "Tesla", "TikTok", "ByteDance", "字节跳动", "Uber", "Airbnb", "Figma", "Roblox",
  "Jane Street", "Citadel", "Citadel Securities", "Two Sigma", "Hudson River Trading", "HRT",
  "Snowflake", "Coinbase", "Palantir", "Cloudflare", "Datadog", "Pinterest", "Discord",
  "Reddit", "Instacart", "DoorDash", "Tencent", "腾讯", "Alibaba", "阿里巴巴"
];

async function main() {
  console.log("🧹 正在清除 20,000+ 条传统/制造/外包企业杂乱数据，只保留知名科技大厂...");

  // 查询全部
  const allJobs = await prisma.job.findMany({ select: { id: true, company: true } });
  const idsToDelete = [];

  for (const j of allJobs) {
    const comp = (j.company || "").trim().toLowerCase();
    const isTarget = TARGET_BIG_TECH.some(
      (t) => comp === t.toLowerCase() || comp.includes(t.toLowerCase()) || t.toLowerCase().includes(comp)
    );

    if (!isTarget) {
      idsToDelete.push(j.id);
    }
  }

  console.log(`🗑️ 准备清理 ${idsToDelete.length} 个非核心企业岗位...`);

  // 分批高速删除
  const chunkSize = 500;
  for (let i = 0; i < idsToDelete.length; i += chunkSize) {
    const chunk = idsToDelete.slice(i, i + chunkSize);
    await prisma.job.deleteMany({
      where: { id: { in: chunk } },
    });
  }

  const remaining = await prisma.job.count();
  console.log(`\n🎉 净化圆满完成！数据库已从 20,000+ 彻底精简为 【${remaining} 个纯正大厂岗位】！`);
}

main().catch(console.error).finally(() => prisma.$disconnect());