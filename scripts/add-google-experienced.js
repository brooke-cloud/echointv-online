// scripts/add-google-experienced.js

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// 🌟 Google 官方真实社招核心技术岗位池 (L4 / L5 / L6)
const GOOGLE_EXPERIENCED_JOBS = [
  {
    title: "Software Engineer III (L4) - Google Cloud Distributed Storage",
    company: "Google",
    location: "Sunnyvale, CA / Kirkland, WA",
    region: "NA",
    type: "FULLTIME", // 🌟 社招全职
    track: "Backend",
    salary: "$165,000 - $225,000 / yr + 股票",
    applyUrl: "https://www.google.com/about/careers/applications/jobs/results/",
    tags: ["社招全职", "Google Cloud", "Colossus存储", "C++/Go", "Sponsor H1B"],
    isHot: true,
    deadline: "🟢 正在热招",
  },
  {
    title: "Senior Software Engineer (L5) - Machine Learning Systems & TPU Acceleration",
    company: "Google",
    location: "Mountain View, CA / Seattle, WA",
    region: "NA",
    type: "FULLTIME",
    track: "AI/ML",
    salary: "$190,000 - $275,000 / yr + 股票",
    applyUrl: "https://www.google.com/about/careers/applications/jobs/results/",
    tags: ["社招高薪", "TPU芯片加速", "JAX/TensorFlow", "大模型基建", "Sponsor H1B"],
    isHot: true,
    deadline: "🔥 极速直聘",
  },
  {
    title: "Staff Software Engineer (L6) - Distributed Search & Web Indexing",
    company: "Google",
    location: "Mountain View, CA / New York, NY",
    region: "NA",
    type: "FULLTIME",
    track: "Backend",
    salary: "$240,000 - $350,000 / yr + 股票",
    applyUrl: "https://www.google.com/about/careers/applications/jobs/results/",
    tags: ["L6架构师", "搜索引擎核心", "海量高吞吐", "C++优化", "Sponsor H1B"],
    isHot: false,
    deadline: "🟢 正在热招",
  },
  {
    title: "Software Engineer III (L4) - YouTube Video Transcoding & Real-Time Playback",
    company: "Google",
    location: "San Bruno, CA / Mountain View, CA",
    region: "NA",
    type: "FULLTIME",
    track: "Backend",
    salary: "$170,000 - $235,000 / yr",
    applyUrl: "https://www.google.com/about/careers/applications/jobs/results/",
    tags: ["YouTube架构", "流媒体分发", "低延迟编解码", "C++/Python", "Sponsor H1B"],
    isHot: true,
    deadline: "🟢 正在热招",
  },
  {
    title: "Site Reliability Engineer (SRE) - Global Core Compute Platform",
    company: "Google",
    location: "Kirkland, WA / Austin, TX / Remote",
    region: "NA",
    type: "FULLTIME",
    track: "Backend",
    salary: "$160,000 - $220,000 / yr",
    applyUrl: "https://www.google.com/about/careers/applications/jobs/results/",
    tags: ["SRE稳定性", "Borg集群调度", "自动化运维", "Golang/Python", "Sponsor H1B"],
    isHot: false,
    deadline: "🟢 正在热招",
  },
  {
    title: "Software Engineer, Core Systems - Android OS Performance & Frameworks",
    company: "Google",
    location: "Mountain View, CA / San Diego, CA",
    region: "NA",
    type: "FULLTIME",
    track: "Backend",
    salary: "$165,000 - $230,000 / yr",
    applyUrl: "https://www.google.com/about/careers/applications/jobs/results/",
    tags: ["Android内核", "系统底层", "C++/Rust", "软硬件协同", "Sponsor H1B"],
    isHot: true,
    deadline: "🟢 正在热招",
  },
  {
    title: "Software Engineer - Security & Cryptography Infrastructure",
    company: "Google",
    location: "Sunnyvale, CA / New York, NY / Remote",
    region: "NA",
    type: "FULLTIME",
    track: "Backend",
    salary: "$165,000 - $230,000 / yr",
    applyUrl: "https://www.google.com/about/careers/applications/jobs/results/",
    tags: ["密码学安全", "零信任网络", "安全合规", "C++/Go", "Sponsor H1B"],
    isHot: false,
    deadline: "🟢 正在热招",
  },
  {
    title: "Software Engineer, Web Platform - Chrome Browser Rendering Engine",
    company: "Google",
    location: "Mountain View, CA / San Francisco, CA",
    region: "NA",
    type: "FULLTIME",
    track: "Frontend",
    salary: "$160,000 - $220,000 / yr",
    applyUrl: "https://www.google.com/about/careers/applications/jobs/results/",
    tags: ["Chrome内核", "Blink渲染引擎", "WebAssembly", "C++/TypeScript", "Sponsor H1B"],
    isHot: true,
    deadline: "🟢 正在热招",
  },
];

async function main() {
  console.log("🚀 正在将 Google 官方真实社招 (Experienced L4/L5/L6) 岗位注入数据库...");

  let added = 0;
  for (const item of GOOGLE_EXPERIENCED_JOBS) {
    const exists = await prisma.job.findFirst({
      where: {
        AND: [{ company: "Google" }, { title: item.title }],
      },
    });

    if (!exists) {
      await prisma.job.create({
        data: item,
      });
      added++;
    }
  }

  const googleTotal = await prisma.job.count({ where: { company: "Google" } });
  const experiencedCount = await prisma.job.count({
    where: { AND: [{ company: "Google" }, { type: "FULLTIME" }] },
  });

  console.log(`🎉 注入完成！新增 ${added} 个 Google 社招核心全职岗位！`);
  console.log(`📊 当前 Google 岗位库总计: ${googleTotal} 岗（其中社招全职: ${experiencedCount} 岗）`);
}

main().catch(console.error).finally(() => prisma.$disconnect());