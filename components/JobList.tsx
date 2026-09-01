// components/JobList.tsx

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Building2,
  ExternalLink,
  Flame,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Sprout,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface JobItem {
  id: number;
  title: string;
  company: string;
  location: string;
  region: string; // "NA" | "CN" | "REMOTE"
  type: string;   // "NEWGRAD" | "FULLTIME" | "INTERN"
  track: string;  // "Backend" | "Frontend" | "AI/ML" | "Fullstack" | "Data"
  salary?: string | null;
  applyUrl: string;
  tags?: string[];
  isHot?: boolean;
  deadline?: string | null;
  createdAt: any;
}

// 🌟 核心顶尖大厂白名单（彻底剔除传统制造、军工与零售外包）
const TARGET_BIG_TECH = [
  "Google",
  "Meta",
  "Amazon",
  "Apple",
  "Microsoft",
  "Netflix",
  "OpenAI",
  "Anthropic",
  "NVIDIA",
  "Scale AI",
  "Stripe",
  "Databricks",
  "Tesla",
  "TikTok",
  "ByteDance",
  "Uber",
  "Airbnb",
  "Figma",
  "Roblox",
  "Jane Street",
  "Citadel",
  "Two Sigma",
  "Hudson River Trading",
  "Snowflake",
  "Coinbase",
  "Palantir",
  "Cloudflare",
  "Datadog",
  "Pinterest",
  "Discord",
  "Reddit",
  "Instacart",
  "DoorDash",
  "Tencent",
  "Alibaba",
];

export default function JobList({ initialJobs }: { initialJobs: JobItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("ALL");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedTrack, setSelectedTrack] = useState("ALL");
  const [onlySponsor, setOnlySponsor] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  // 🌟 1. 严格只从核心大厂中提取状态矩阵，杜绝几百个公司刷屏
  const companyMatrix = useMemo(() => {
    const map = new Map<string, { newGrad: boolean; intern: boolean; fulltime: boolean; count: number }>();
    
    initialJobs.forEach((j) => {
      const comp = j.company.trim();
      
      // 检查是否属于知名科技大厂白名单（或包含关键词）
      const isTarget = TARGET_BIG_TECH.some(
        (target) => comp.toLowerCase() === target.toLowerCase() || comp.toLowerCase().includes(target.toLowerCase())
      );
      if (!isTarget) return; // 过滤非核心企业

      // 归一化企业名称
      const matchedName =
        TARGET_BIG_TECH.find((target) => comp.toLowerCase().includes(target.toLowerCase())) || comp;

      const current = map.get(matchedName) || { newGrad: false, intern: false, fulltime: false, count: 0 };
      current.count += 1;
      if (j.type === "NEWGRAD") current.newGrad = true;
      if (j.type === "INTERN") current.intern = true;
      if (j.type === "FULLTIME") current.fulltime = true;
      map.set(matchedName, current);
    });

    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [initialJobs]);

  // 默认仅展示前 12 家最核心大厂，支持展开
  const visibleCompanies = showAllCompanies ? companyMatrix : companyMatrix.slice(0, 12);

  const regions = [
    { label: "全部地区", value: "ALL" },
    { label: "🇺🇸 北美 / 海外", value: "NA" },
    { label: "🇨🇳 国内 / 亚太", value: "CN" },
    { label: "🌍 Remote 远程", value: "REMOTE" },
  ];

  const types = [
    { label: "全部类型", value: "ALL" },
    { label: "🎓 2026/2027 校招 (New Grad)", value: "NEWGRAD" },
    { label: "🌱 暑期/日常实习 (Intern)", value: "INTERN" },
    { label: "💼 社招全职 (Experienced)", value: "FULLTIME" },
  ];

  const tracks = [
    { label: "全部方向", value: "ALL" },
    { label: "后端 / 分布式", value: "Backend" },
    { label: "AI / 机器学习", value: "AI/ML" },
    { label: "前端 / 全栈", value: "Frontend" },
    { label: "数据工程 / 统计", value: "Data" },
  ];

  // 实时多维过滤
  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.tags?.some((t) => t.toLowerCase().includes(q));

      const matchCompany =
        selectedCompany === "ALL" ||
        job.company.toLowerCase().includes(selectedCompany.toLowerCase()) ||
        selectedCompany.toLowerCase().includes(job.company.toLowerCase());

      const matchRegion =
        selectedRegion === "ALL" || job.region.toUpperCase() === selectedRegion;

      const matchType =
        selectedType === "ALL" || job.type.toUpperCase() === selectedType;

      const matchTrack =
        selectedTrack === "ALL" || job.track.toLowerCase() === selectedTrack.toLowerCase();

      const matchSponsor =
        !onlySponsor ||
        job.tags?.some((t) => t.toLowerCase().includes("sponsor") || t.toLowerCase().includes("h1b"));

      return matchSearch && matchCompany && matchRegion && matchType && matchTrack && matchSponsor;
    });
  }, [initialJobs, searchQuery, selectedCompany, selectedRegion, selectedType, selectedTrack, onlySponsor]);

  const handleClear = () => {
    setSearchQuery("");
    setSelectedCompany("ALL");
    setSelectedRegion("ALL");
    setSelectedType("ALL");
    setSelectedTrack("ALL");
    setOnlySponsor(false);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCompany !== "ALL" ||
    selectedRegion !== "ALL" ||
    selectedType !== "ALL" ||
    selectedTrack !== "ALL" ||
    onlySponsor;

  return (
    <div className="space-y-8">
      {/* 🌟 1. 精简高颜值大厂在招状态速览雷达 (只展示精选 12-18 家明星大厂) */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 p-6 sm:p-7 rounded-3xl border border-blue-100/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📡</span>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                核心大厂招聘状态总览
              </h2>
              <p className="text-xs text-gray-500">
                实时追踪 Google、Meta、Amazon、OpenAI、Nvidia 等主流名企开放通道：
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedCompany !== "ALL" && (
              <button
                onClick={() => setSelectedCompany("ALL")}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                显示全部 ➔
              </button>
            )}

            {companyMatrix.length > 12 && (
              <button
                type="button"
                onClick={() => setShowAllCompanies(!showAllCompanies)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 transition shadow-sm"
              >
                <span>{showAllCompanies ? "收起部分" : `更多名企 (${companyMatrix.length})`}</span>
                {showAllCompanies ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* 🌟 紧凑整齐的 2 行精选大厂卡片网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {visibleCompanies.map(([comp, status]) => {
            const isSelected = selectedCompany.toLowerCase() === comp.toLowerCase();

            return (
              <button
                key={comp}
                type="button"
                onClick={() => setSelectedCompany(isSelected ? "ALL" : comp)}
                className={`p-3 rounded-2xl border text-left transition ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400"
                    : "bg-white text-gray-800 border-gray-200/80 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm">
                  <span className="truncate">{comp}</span>
                  <span className={`text-[11px] font-mono ${isSelected ? "text-blue-100" : "text-blue-600"}`}>
                    {status.count}岗
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {status.newGrad && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isSelected ? "bg-white/20 text-white" : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      校招
                    </span>
                  )}
                  {status.intern && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isSelected ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      实习
                    </span>
                  )}
                  {status.fulltime && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      社招
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 2. 实时搜索与多维过滤控制器 */}
      <div className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 搜索岗位名称 (如 SDE 2026, Machine Learning)、目标公司、城市或技术栈..."
            className="w-full pl-12 pr-20 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 bg-white shadow-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-3.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-xl transition font-medium"
            >
              清空
            </button>
          )}
        </div>

        {/* 筛选选项卡容器 */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm space-y-5">
          {/* 地区 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0">
              地区分类
            </span>
            <div className="flex flex-wrap gap-2">
              {regions.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setSelectedRegion(r.value)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                    selectedRegion === r.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* 招聘类型 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0">
              招聘类型
            </span>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                    selectedType === t.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 技术方向与工签开关 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0">
                技术方向
              </span>
              <div className="flex flex-wrap gap-2">
                {tracks.map((tr) => (
                  <button
                    key={tr.value}
                    onClick={() => setSelectedTrack(tr.value)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                      selectedTrack === tr.value
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none self-start sm:self-auto bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/80 hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={onlySponsor}
                onChange={(e) => setOnlySponsor(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span>仅看 Sponsor H1B 工签</span>
            </label>
          </div>
        </div>
      </div>

      {/* 统计栏 */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm font-semibold text-gray-700">
          共筛选出 <span className="text-blue-600 font-bold">{filteredJobs.length}</span> 个在招大厂岗位
          {selectedCompany !== "ALL" && (
            <span className="ml-2 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-normal">
              已锁定：{selectedCompany}
            </span>
          )}
        </span>

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="text-xs px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition font-medium"
          >
            重置全部筛选
          </button>
        )}
      </div>

      {/* 🌟 3. 岗位卡片流 */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-gray-200 text-center text-gray-400 space-y-3 shadow-sm">
            <div className="text-4xl">🔍</div>
            <p className="text-base font-bold text-gray-700">暂无匹配的招聘岗位</p>
            <p className="text-xs text-gray-400">尝试更换搜索关键字或重置筛选条件</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isNewGrad = job.type === "NEWGRAD";
            const isIntern = job.type === "INTERN";

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* 岗位核心信息 */}
                <div className="space-y-3 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCompany(job.company)}
                      className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      {job.company}
                    </button>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isNewGrad
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : isIntern
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {isNewGrad ? "🎓 2026 校招" : isIntern ? "🌱 实习" : "💼 社招全职"}
                    </span>

                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700">
                      {job.region === "NA" ? "🇺🇸 北美" : job.region === "CN" ? "🇨🇳 国内" : "🌍 Remote"}
                    </span>

                    {job.isHot && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                        <Flame className="h-3 w-3" />
                        急招
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span>{job.location}</span>
                    </div>

                    {job.salary && (
                      <div className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-mono">
                        💰 {job.salary}
                      </div>
                    )}

                    {job.tags && job.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {job.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              tag.includes("H1B") || tag.includes("Sponsor")
                                ? "bg-amber-50 text-amber-800 border-amber-200 font-semibold"
                                : "bg-gray-50 text-gray-600 border-gray-200/70"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 右侧：状态 + 官方直通链接 + 真题直达 */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 flex-shrink-0">
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{job.deadline || "🟢 正在热招"}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/problem?company=${encodeURIComponent(job.company)}`}
                      className="hidden sm:inline-flex items-center gap-1 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 text-xs font-bold transition bg-gray-50"
                    >
                      <span>真题库</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>

                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 whitespace-nowrap"
                    >
                      <span>官网投递</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}