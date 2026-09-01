// scripts/keep-only-big-tech.js

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// 顶尖大厂白名单
const TARGET_BIG_TECH = [
  "Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix",
  "OpenAI", "Anthropic", "NVIDIA", "Scale AI", "Stripe", "Databricks",
  "Tesla", "TikTok", "ByteDance", "Uber", "Airbnb", "Figma", "Roblox",
  "Jane Street", "Citadel", "Two Sigma", "Hudson River Trading",
  "Snowflake", "Coinbase", "Palantir", "Cloudflare", "Datadog",
  "Pinterest", "Discord", "Reddit", "Instacart", "DoorDash", "Tencent", "Alibaba",
];

async function main() {
  console.log("🧹 正在净化数据库，清除所有非知名科技企业的杂乱岗位...");

  // 删除不属于目标大厂白名单的岗位
  const allJobs = await prisma.job.findMany();
  let deletedCount = 0;

  for (const j of allJobs) {
    const isTarget = TARGET_BIG_TECH.some(
      (target) => j.company.toLowerCase().includes(target.toLowerCase()) || target.toLowerCase().includes(j.company.toLowerCase())
    );

    if (!isTarget) {
      await prisma.job.delete({ where: { id: j.id } });
      deletedCount++;
    }
  }

  const remaining = await prisma.job.count();
  console.log(`✅ 净化完成！删除了 ${deletedCount} 个传统/制造/外包企业岗位，当前保留了 ${remaining} 个顶级大厂在招岗位！`);
}

main().catch(console.error).finally(() => prisma.$disconnect());