// app/(public)/jobs/page.tsx

import { prisma } from "@/lib/prisma";
import CompanyRadarList, { CompanyStatusItem } from "@/components/CompanyRadarList";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "国内外程序员求职招聘雷达 (2026校招/实习/社招/量化直通) | Echo INTV",
  description:
    "实时监控 Google、Meta、Amazon、OpenAI、Nvidia、Jane Street、TikTok、腾讯、阿里、美团、小红书等全球顶尖名企 2026/2027 程序员校招与社招直达投递入口。",
};

// 🌟 全站统一的国内外大厂精确别名与展示字典（专注于程序员/软件工程师岗位）
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
  // ==================== 1. 北美 FAANG 巨头 ====================
  google: {
    display: "Google",
    aliases: ["Google", "Alphabet"],
    category: "FAANG",
    headquarters: "Mountain View, CA",
    visaPolicy: "Sponsor H1B",
    description: "全球领先搜索引擎与云巨头，2026 软件工程师 Early Career 与 L4/L5 架构师开放中。",
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
  amazon: {
    display: "Amazon",
    aliases: ["Amazon", "AWS"],
    category: "FAANG",
    headquarters: "Seattle, WA",
    visaPolicy: "Sponsor H1B",
    description: "AWS 云计算与全球电商巨头，海量 HC 招聘软件开发工程师（SDE I & II）。",
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

  // ==================== 2. 前沿 AI & 大模型巨头 ====================
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
    description: "前沿 AI 安全与 Claude 大模型公司，专注于超大规模模型推理与强化学习。",
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
  perplexity: {
    display: "Perplexity",
    aliases: ["Perplexity"],
    category: "AI",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "新一代 AI 搜索引擎，RAG 架构与低延迟向量检索工程师招聘中。",
    isOpen: true,
  },

  // ==================== 3. 华尔街顶级量化与高频交易 ====================
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
  hrt: {
    display: "Hudson River Trading",
    aliases: ["Hudson River Trading", "HRT"],
    category: "QUANT",
    headquarters: "New York, NY",
    visaPolicy: "Sponsor H1B",
    description: "全球顶级高频量化交易机构，C++ 底层网络与撮合引擎研发。",
    isOpen: true,
  },
  "jump-trading": {
    display: "Jump Trading",
    aliases: ["Jump Trading"],
    category: "QUANT",
    headquarters: "Chicago, IL",
    visaPolicy: "Sponsor H1B",
    description: "极速高频交易先驱，纳秒级 C++ 与 FPGA 硬件软件工程师招聘中。",
    isOpen: true,
  },

  // ==================== 4. 北美高估值独角兽与云基础设施 ====================
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
  snowflake: {
    display: "Snowflake",
    aliases: ["Snowflake"],
    category: "UNICORN",
    headquarters: "San Mateo, CA",
    visaPolicy: "Sponsor H1B",
    description: "云数据仓库先锋，分布式查询优化器与存储引擎研发。",
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
    description: "大数据与企业智能决策中枢，前线部署软件工程师 (FDSE) 持续热招。",
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
  doordash: {
    display: "DoorDash",
    aliases: ["DoorDash"],
    category: "UNICORN",
    headquarters: "San Francisco, CA",
    visaPolicy: "Sponsor H1B",
    description: "本地即时配送巨头，运筹与调度算法平台热招。",
    isOpen: true,
  },

  // ==================== 5. 国内一线科技大厂与出海巨头 ====================
  tiktok: {
    display: "TikTok / 字节跳动",
    aliases: ["TikTok", "ByteDance", "字节跳动", "TikTok / 字节跳动"],
    category: "APAC",
    headquarters: "北京 / 新加坡 / 圣何塞",
    visaPolicy: "海内外均招",
    description: "全球亿级 DAU 短视频与出海电商，海量 HC 招聘后端开发、算法与前端工程师。",
    isOpen: true,
  },
  tencent: {
    display: "腾讯 (Tencent)",
    aliases: ["腾讯", "Tencent", "腾讯 (Tencent)"],
    category: "APAC",
    headquarters: "深圳 / 北京 / 新加坡",
    visaPolicy: "国内/海外校招",
    description: "微信后台高并发架构、腾讯云分布式存储与混元大模型核心研发。",
    isOpen: true,
  },
  alibaba: {
    display: "阿里巴巴 (Alibaba)",
    aliases: ["阿里", "阿里巴巴", "Alibaba", "阿里巴巴 (Alibaba)"],
    category: "APAC",
    headquarters: "杭州 / 北京 / 新加坡",
    visaPolicy: "国内/海外校招",
    description: "阿里云飞天云操作系统、淘宝海量高可用电商交易架构与达摩院算法。",
    isOpen: true,
  },
  meituan: {
    display: "美团 (Meituan)",
    aliases: ["美团", "Meituan"],
    category: "APAC",
    headquarters: "北京 / 上海",
    visaPolicy: "国内校招/社招",
    description: "本地生活与即时配送调度算法领头羊，超大规模分布式微服务平台。",
    isOpen: true,
  },
  xiaohongshu: {
    display: "小红书 (RED)",
    aliases: ["小红书", "RED", "Xiaohongshu"],
    category: "APAC",
    headquarters: "上海 / 北京",
    visaPolicy: "国内校招/社招",
    description: "国民级生活内容社区，千人千面推荐算法架构与搜索系统火热招聘中。",
    isOpen: true,
  },
  pinduoduo: {
    display: "拼多多 / Temu",
    aliases: ["拼多多", "Temu", "PDD"],
    category: "APAC",
    headquarters: "上海 / 广州",
    visaPolicy: "国内校招/社招",
    description: "极速崛起的全球跨境电商与国内电商平台，海量高并发架构开发。",
    isOpen: true,
  },
  mihoyo: {
    display: "米哈游 (miHoYo)",
    aliases: ["米哈游", "miHoYo"],
    category: "APAC",
    headquarters: "上海 / 新加坡",
    visaPolicy: "国内/海外直聘",
    description: "《原神》《崩坏》研发商，自研游戏图形渲染引擎与多端云游戏架构。",
    isOpen: true,
  },
  baidu: {
    display: "百度 (Baidu)",
    aliases: ["百度", "Baidu"],
    category: "APAC",
    headquarters: "北京",
    visaPolicy: "国内校招/社招",
    description: "文心一言大模型、Apollo 自动驾驶平台与海量级搜索索引系统开发。",
    isOpen: true,
  },
  huawei: {
    display: "华为 (Huawei)",
    aliases: ["华为", "Huawei"],
    category: "APAC",
    headquarters: "深圳 / 杭州",
    visaPolicy: "全球招聘",
    description: "鸿蒙系统操作系统内核、昇腾 AI 算力芯片基础软件与高可靠云计算。",
    isOpen: true,
  },
  shopee: {
    display: "Shopee / Sea",
    aliases: ["Shopee", "Sea", "虾皮"],
    category: "APAC",
    headquarters: "新加坡 / 深圳",
    visaPolicy: "东南亚/国内直聘",
    description: "东南亚头部跨境电商与数字金融中台，Golang 高并发微服务研发。",
    isOpen: true,
  },

  // ==================== 6. 暂停招人的公司 (供市场动态参考) ====================
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

// 全局唯一定点去重函数
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
      allDeduplicatedJobs = deduplicateJobList(allRaw);
    }
  } catch (e) {}

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
        isOpen: info.isOpen,
        statusText: exactCount > 0 ? `${exactCount} 个岗位开放中` : info.isOpen ? "正在热招中" : "当前通道已关闭",
        category: info.category,
        headquarters: info.headquarters,
        openRolesCount: exactCount,
        hasNewGrad: matchedJobs.some((j) => j.type === "NEWGRAD") || info.isOpen,
        hasIntern: matchedJobs.some((j) => j.type === "INTERN") || (info.isOpen && info.category !== "FAANG"),
        hasFulltime: matchedJobs.some((j) => j.type === "FULLTIME") || info.isOpen,
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
            <span>2026 全球顶尖程序员求职在招雷达 · 官方直聘直通</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            哪些大厂正在招程序员？
          </h1>
          <p className="text-base text-gray-500 max-w-3xl leading-relaxed">
            实时监控 Google、Meta、Amazon、OpenAI、Jane Street、TikTok、腾讯、阿里、美团、小红书等全球顶尖科技名企
            <strong className="text-gray-900"> 2026 校招 (New Grad)、暑期实习 (Intern) 与社招全职</strong> 开放状态，点击公司即可进入专属页面直达岗位网申！
          </p>
        </section>

        {/* 招聘大盘与公司卡片 */}
        <section>
          <CompanyRadarList
            companies={companiesData}
            totalJobsCount={allDeduplicatedJobs.length || 200}
          />
        </section>

      </div>
    </main>
  );
}