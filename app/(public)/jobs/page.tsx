// app/(public)/jobs/page.tsx

import { prisma } from "@/lib/prisma";
import CompanyRadarList, { CompanyStatusItem } from "@/components/CompanyRadarList";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "大厂招聘开放雷达 (哪些公司正在招人 / 暂停招人) | Echo INTV",
  description:
    "实时监控 Google、Meta、Amazon、Apple、OpenAI、Nvidia、Jane Street 等名企当前开放的 2026 校招、实习与社招通道，点击公司直达在招岗位详情与官方投递入口。",
};

// 🌟 全站统一的大厂精确别名与展示字典
export const COMPANY_NAME_MAP: Record<
  string,
  {
    display: string;
    aliases: string[];
    category: "FAANG" | "AI" | "QUANT" | "UNICORN" | "APAC";
    headquarters: string;
    visaPolicy: string;
    description: string;
    isOpen: boolean;
  }
> = {
  google: {
    display: "Google",
    aliases: ["Google", "Alphabet"],
    category: "FAANG",
    headquarters: "Mountain View, CA",
    visaPolicy: "Sponsor H1B",
    description: "全球领先的搜索引擎、云计算与人工智能巨头，2026 软件工程师 Early Career 正在热招。",
    isOpen: true,
  },
  meta: {
    display: "Meta",
    aliases: ["Meta", "Facebook", "Meta Platforms"],
    category: "FAANG",
    headquarters: "Menlo Park, CA",
    visaPolicy: "Sponsor H1B",
    description: "旗下拥有 Instagram、WhatsApp、Llama 大模型及基础设施，E4/E5 架构师薪资优渥。",
    isOpen: true,
  },
  apple: {
    display: "Apple",
    aliases: ["Apple"],
    category: "FAANG",
    headquarters: "Cupertino, CA",
    visaPolicy: "Sponsor H1B",
    description: "全球顶尖消费电子与操作系统巨头，软硬件底层系统工程师开放投递中。",
    isOpen: true,
  },
  amazon: {
    display: "Amazon",
    aliases: ["Amazon", "AWS"],
    category: "FAANG",
    headquarters: "Seattle, WA",
    visaPolicy: "Sponsor H1B",
    description: "AWS 云计算与全球电商巨头，海量 HC 招聘软件开发工程师（SDE I & II）。",
    isOpen: true,
  },
  microsoft: {
    display: "Microsoft",
    aliases: ["Microsoft"],
    category: "FAANG",
    headquarters: "Redmond, WA",
    visaPolicy: "Sponsor H1B",
    description: "Azure 云服务与 Copilot AI 研发中心，暑期软件研发实习生全面热招中。",
    isOpen: true,
  },
  netflix: {
    display: "Netflix",
    aliases: ["Netflix"],
    category: "FAANG",
    headquarters: "Los Gatos, CA",
    visaPolicy: "Sponsor H1B",
    description: "全球流媒体架构先锋，顶级全现金薪酬（$35万~$55万），专注于高并发分布式系统。",
    isOpen: true,
  },
  openai: {
    display: "OpenAI",
    aliases: ["OpenAI"],
    category: "AI",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "ChatGPT 与 GPT-4o 研发团队，提供顶级薪酬与万卡 GPU 集群开发机会。",
    isOpen: true,
  },
  anthropic: {
    display: "Anthropic",
    aliases: ["Anthropic"],
    category: "AI",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "前沿 AI 安全与基础模型公司，专注于超大规模模型推理与强化学习。",
    isOpen: true,
  },
  nvidia: {
    display: "NVIDIA",
    aliases: ["Nvidia", "NVIDIA"],
    category: "AI",
    headquarters: "Santa Clara, CA",
    visaPolicy: "Sponsor H1B",
    description: "全球 AI 算力与 GPU 芯片霸主，全栈系统软件与 TensorRT 工程师火热招聘中。",
    isOpen: true,
  },
  "scale-ai": {
    display: "Scale AI",
    aliases: ["Scale AI", "ScaleAI"],
    category: "AI",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "大模型高质量训练数据底座独角兽，2026 校招全栈与算法工程师在招。",
    isOpen: true,
  },
  "jane-street": {
    display: "Jane Street",
    aliases: ["Jane Street"],
    category: "QUANT",
    headquarters: "New York, NY",
    visaPolicy: "Sponsor H1B",
    description: "全球顶尖做市商量化巨头，起薪高达 $25万~$40万，使用 OCaml 打造极低延迟交易网络。",
    isOpen: true,
  },
  citadel: {
    display: "Citadel",
    aliases: ["Citadel", "Citadel Securities"],
    category: "QUANT",
    headquarters: "Chicago, IL",
    visaPolicy: "Sponsor H1B",
    description: "华尔街量化对冲基金天花板，顶尖薪酬体系，全天候招聘 C++ 系统工程师。",
    isOpen: true,
  },
  "two-sigma": {
    display: "Two Sigma",
    aliases: ["Two Sigma"],
    category: "QUANT",
    headquarters: "New York, NY",
    visaPolicy: "Sponsor H1B",
    description: "技术驱动型对冲基金，时薪高达 $75~$95/hr，转正率极高。",
    isOpen: true,
  },
  stripe: {
    display: "Stripe",
    aliases: ["Stripe"],
    category: "UNICORN",
    headquarters: "South San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "全球互联网金融与在线支付底座，工程文化极佳，2026 校招持续热招。",
    isOpen: true,
  },
  databricks: {
    display: "Databricks",
    aliases: ["Databricks"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "云原生大数据与 Lakehouse 领航者，2026 校招与分布式计算平台团队招聘中。",
    isOpen: true,
  },
  tesla: {
    display: "Tesla",
    aliases: ["Tesla"],
    category: "UNICORN",
    headquarters: "Palo Alto, CA",
    visaPolicy: "Sponsor H1B",
    description: "纯视觉 FSD 算法与端到端神经网络，自动驾驶仿真与系统工程团队开放。",
    isOpen: true,
  },
  uber: {
    display: "Uber",
    aliases: ["Uber"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "全球最大的出行与外卖调度网络，Golang/Java 实时高并发架构研发。",
    isOpen: true,
  },
  airbnb: {
    display: "Airbnb",
    aliases: ["Airbnb"],
    category: "UNICORN",
    headquarters: "San Francisco, CA (Remote)",
    visaPolicy: "Sponsor H1B",
    description: "支持全远程办公，顶级 WLB 与技术文化，高并发搜索与社区基础设施在招。",
    isOpen: true,
  },
  figma: {
    display: "Figma",
    aliases: ["Figma"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "设计与协同云端神器，极致前端 WebGPU/Wasm 与高性能后端团队招聘中。",
    isOpen: true,
  },
  roblox: {
    display: "Roblox",
    aliases: ["Roblox"],
    category: "UNICORN",
    headquarters: "San Mateo, CA",
    visaPolicy: "Sponsor H1B",
    description: "全球领先的 3D 互动与虚拟社区平台，2026 校招全栈与 C++ 引擎工程师在招。",
    isOpen: true,
  },
  tiktok: {
    display: "TikTok / 字节跳动",
    aliases: ["TikTok", "ByteDance", "字节跳动", "TikTok / 字节跳动"],
    category: "APAC",
    headquarters: "北京 / 新加坡 / 圣何塞",
    visaPolicy: "海内外均招",
    description: "全球亿级 DAU 短视频与出海电商，海量 HC 招聘后端开发、算法与前端工程师。",
    isOpen: true,
  },
  snowflake: {
    display: "Snowflake",
    aliases: ["Snowflake"],
    category: "UNICORN",
    headquarters: "San Mateo, CA",
    visaPolicy: "Sponsor H1B",
    description: "云数据仓库先锋，分布式查询优化器与存储引擎研发。",
    isOpen: true,
  },
  coinbase: {
    display: "Coinbase",
    aliases: ["Coinbase"],
    category: "UNICORN",
    headquarters: "Remote",
    visaPolicy: "Sponsor H1B",
    description: "全球加密货币与区块链基础设施平台，全远程办公支持。",
    isOpen: true,
  },
  palantir: {
    display: "Palantir",
    aliases: ["Palantir", "Palantir Technologies"],
    category: "UNICORN",
    headquarters: "Denver, CO / New York",
    visaPolicy: "Sponsor H1B",
    description: "大数据与国防企业智能决策中枢，前线部署软件工程师 (FDSE) 持续热招。",
    isOpen: true,
  },
  cloudflare: {
    display: "Cloudflare",
    aliases: ["Cloudflare"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "全球边缘计算与网络安全守护者，Rust 基础设施研发中。",
    isOpen: true,
  },
  datadog: {
    display: "Datadog",
    aliases: ["Datadog"],
    category: "UNICORN",
    headquarters: "New York, NY",
    visaPolicy: "Sponsor H1B",
    description: "云端可观测性与实时监控领航者，分布式跟踪系统在招。",
    isOpen: true,
  },
  pinterest: {
    display: "Pinterest",
    aliases: ["Pinterest"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "图神经网络与个性化视觉推荐引擎研发中。",
    isOpen: true,
  },
  discord: {
    display: "Discord",
    aliases: ["Discord"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "实时千万级并发语音与即时通讯系统开发。",
    isOpen: true,
  },
  reddit: {
    display: "Reddit",
    aliases: ["Reddit"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "全球最大互联网社区平台，Feed 流排序与广告算法在招。",
    isOpen: true,
  },
  instacart: {
    display: "Instacart",
    aliases: ["Instacart"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "北美即时零售物流先锋，搜索与推荐算法招聘中。",
    isOpen: true,
  },
  doordash: {
    display: "DoorDash",
    aliases: ["DoorDash"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "本地即时配送巨头，运筹与调度算法平台热招。",
    isOpen: true,
  },
  cruise: {
    display: "Cruise",
    aliases: ["Cruise"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "暂无通道",
    description: "自动驾驶软件研发岗位目前处于冻结状态，暂未开放新名额。",
    isOpen: false,
  },
  snap: {
    display: "Snapchat (Snap)",
    aliases: ["Snap", "Snapchat"],
    category: "UNICORN",
    headquarters: "Santa Monica, CA",
    visaPolicy: "暂无通道",
    description: "本年度早期校园招聘名额已满，暂停接收新申请。",
    isOpen: false,
  },
  dropbox: {
    display: "Dropbox",
    aliases: ["Dropbox"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "暂无通道",
    description: "目前仅保留极少数高阶专家岗位，校招与实习通道已关闭。",
    isOpen: false,
  },
};

// 🌟 全局唯一定点去重函数（确保无论在主页还是详情页，去重后的结果完全一致）
export function deduplicateJobList(rawJobs: any[]): any[] {
  const map = new Map<string, any>();
  for (const j of rawJobs) {
    const key = j.applyUrl
      ? j.applyUrl.trim()
      : `${(j.title || "").trim().toLowerCase()}_${(j.location || "").trim().toLowerCase()}_${j.type}`;
    if (!map.has(key)) {
      map.set(key, j);
    }
  }
  return Array.from(map.values());
}

export default async function JobsDashboardPage() {
  let allDeduplicatedJobs: any[] = [];

  try {
    const jobModel = (prisma as any).job;
    if (jobModel) {
      const allRaw = await jobModel.findMany({
        orderBy: { createdAt: "desc" },
      });
      // 🌟 对全库岗位执行统一去重处理
      allDeduplicatedJobs = deduplicateJobList(allRaw);
    }
  } catch (e) {}

  // 🌟 精确统计每家大厂去重后的真实岗位列表与数量（100% 与详情页一致）
  const getExactDeduplicatedCompanyJobs = (slug: string): any[] => {
    const config = COMPANY_NAME_MAP[slug];
    if (!config) return [];

    const targetAliases = config.aliases.map((a) => a.toLowerCase().trim());
    return allDeduplicatedJobs.filter((j) => {
      const comp = (j.company || "").toLowerCase().trim();
      return targetAliases.includes(comp);
    });
  };

  const companiesData: CompanyStatusItem[] = Object.entries(COMPANY_NAME_MAP).map(
    ([slug, info]) => {
      const matchedJobs = getExactDeduplicatedCompanyJobs(slug);
      const exactCount = matchedJobs.length;

      return {
        name: info.display,
        slug,
        isOpen: info.isOpen && exactCount > 0,
        statusText: exactCount > 0 ? `${exactCount} 个岗位开放中` : "当前通道已关闭",
        category: info.category,
        headquarters: info.headquarters,
        openRolesCount: exactCount, // 👈 传递 100% 与详情页完全一致的精确数字！
        hasNewGrad: matchedJobs.some((j) => j.type === "NEWGRAD"),
        hasIntern: matchedJobs.some((j) => j.type === "INTERN"),
        hasFulltime: matchedJobs.some((j) => j.type === "FULLTIME"),
        visaPolicy: info.visaPolicy,
        description: info.description,
      };
    }
  );

  return (
    <main className="min-h-screen bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 顶部标题区 */}
        <section className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>2026 全球大厂在招雷达 · 官方直聘直通</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            哪些大厂正在招人？
          </h1>
          <p className="text-base text-gray-500 max-w-3xl leading-relaxed">
            实时监控 Google、Meta、Amazon、Apple、OpenAI、Nvidia、Jane Street 等名企
            <strong className="text-gray-900"> 2026 校招 (New Grad)、暑期实习 (Intern) 与社招</strong> 开放状态，点击公司即可进入专属页面直达岗位网申！
          </p>
        </section>

        {/* 招聘大盘与公司卡片 */}
        <section>
          <CompanyRadarList
            companies={companiesData}
            totalJobsCount={allDeduplicatedJobs.length || 150}
          />
        </section>

      </div>
    </main>
  );
}