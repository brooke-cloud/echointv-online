// components/CompanyJobsClient.tsx

"use client";

import { useState, useMemo } from "react";
import {
  MapPin,
  ExternalLink,
  Flame,
  GraduationCap,
  Sprout,
  Briefcase,
  Search,
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  region: string;
  type: string; // "NEWGRAD" | "INTERN" | "FULLTIME"
  track: string;
  salary?: string | null;
  applyUrl: string;
  tags?: string[];
  isHot?: boolean;
  deadline?: string | null;
}

// ============================================================
// 🎨 标签配色方案
// ============================================================
const TAG_COLORS: Record<string, string> = {
  // ---- 技术栈 ----
  'React': 'bg-sky-50 text-sky-700 border-sky-200',
  'Vue': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Angular': 'bg-rose-50 text-rose-700 border-rose-200',
  'Node.js': 'bg-lime-50 text-lime-700 border-lime-200',
  'Python': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Java': 'bg-amber-50 text-amber-700 border-amber-200',
  'Go': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Rust': 'bg-orange-50 text-orange-700 border-orange-200',
  'C++': 'bg-blue-50 text-blue-700 border-blue-200',
  'C#': 'bg-violet-50 text-violet-700 border-violet-200',
  'PHP': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  'Ruby': 'bg-red-50 text-red-700 border-red-200',
  'Swift': 'bg-rose-50 text-rose-700 border-rose-200',
  'Kotlin': 'bg-purple-50 text-purple-700 border-purple-200',
  'TypeScript': 'bg-blue-50 text-blue-700 border-blue-200',
  'JavaScript': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'HTML': 'bg-orange-50 text-orange-700 border-orange-200',
  'CSS': 'bg-sky-50 text-sky-700 border-sky-200',
  'SQL': 'bg-teal-50 text-teal-700 border-teal-200',
  'MongoDB': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'PostgreSQL': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'MySQL': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Redis': 'bg-rose-50 text-rose-700 border-rose-200',
  'Docker': 'bg-sky-50 text-sky-700 border-sky-200',
  'Kubernetes': 'bg-blue-50 text-blue-700 border-blue-200',
  'AWS': 'bg-amber-50 text-amber-700 border-amber-200',
  'Azure': 'bg-sky-50 text-sky-700 border-sky-200',
  'GCP': 'bg-blue-50 text-blue-700 border-blue-200',
  'Linux': 'bg-gray-50 text-gray-700 border-gray-200',

  // ---- 岗位类型 ----
  'Full Stack': 'bg-purple-50 text-purple-700 border-purple-200',
  'Frontend': 'bg-orange-50 text-orange-700 border-orange-200',
  'Backend': 'bg-blue-50 text-blue-700 border-blue-200',
  'DevOps': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'SRE': 'bg-teal-50 text-teal-700 border-teal-200',
  'ML': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  'AI': 'bg-violet-50 text-violet-700 border-violet-200',
  'Data': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Cloud': 'bg-sky-50 text-sky-700 border-sky-200',
  'Security': 'bg-red-50 text-red-700 border-red-200',
  'Mobile': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'iOS': 'bg-rose-50 text-rose-700 border-rose-200',
  'Android': 'bg-lime-50 text-lime-700 border-lime-200',
  'Game': 'bg-purple-50 text-purple-700 border-purple-200',
  'Embedded': 'bg-amber-50 text-amber-700 border-amber-200',

  // ---- 工作性质 ----
  'Remote': 'bg-teal-50 text-teal-700 border-teal-200',
  'Hybrid': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Onsite': 'bg-gray-50 text-gray-700 border-gray-200',
  'H1B': 'bg-violet-50 text-violet-700 border-violet-200',
  'H1B Sponsor': 'bg-purple-50 text-purple-700 border-purple-200',
  'Visa': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'OPT': 'bg-blue-50 text-blue-700 border-blue-200',
  'CPT': 'bg-sky-50 text-sky-700 border-sky-200',

  // ---- 公司类型 ----
  'FAANG': 'bg-rose-50 text-rose-700 border-rose-200',
  'Startup': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Fintech': 'bg-amber-50 text-amber-700 border-amber-200',
  'Unicorn': 'bg-purple-50 text-purple-700 border-purple-200',

  // ---- 时间/状态 ----
  'Urgent': 'bg-red-50 text-red-700 border-red-200',
  'Hot': 'bg-orange-50 text-orange-700 border-orange-200',
  'New': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Featured': 'bg-amber-50 text-amber-700 border-amber-200',

  // ---- 薪资/级别 ----
  'Entry': 'bg-green-50 text-green-700 border-green-200',
  'Junior': 'bg-sky-50 text-sky-700 border-sky-200',
  'Senior': 'bg-purple-50 text-purple-700 border-purple-200',
  'Lead': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Staff': 'bg-violet-50 text-violet-700 border-violet-200',
  'Principal': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',

  // ---- 业务领域 ----
  'E-commerce': 'bg-amber-50 text-amber-700 border-amber-200',
  'Social': 'bg-blue-50 text-blue-700 border-blue-200',
  'Gaming': 'bg-purple-50 text-purple-700 border-purple-200',
  'Healthcare': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Finance': 'bg-rose-50 text-rose-700 border-rose-200',
  'Education': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Logistics': 'bg-orange-50 text-orange-700 border-orange-200',
  'AI/ML': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  'Blockchain': 'bg-violet-50 text-violet-700 border-violet-200',
  'IoT': 'bg-teal-50 text-teal-700 border-teal-200',
};

// 默认颜色（当标签没有匹配到配色时使用）
const DEFAULT_TAG_COLOR = 'bg-gray-50 text-gray-600 border-gray-200';

// 获取标签颜色
function getTagColor(tag: string): string {
  // 精确匹配
  if (TAG_COLORS[tag]) return TAG_COLORS[tag];
  
  // 忽略大小写匹配
  const lowerTag = tag.toLowerCase();
  for (const [key, color] of Object.entries(TAG_COLORS)) {
    if (key.toLowerCase() === lowerTag) return color;
  }
  
  // 部分匹配（比如 "Senior Software Engineer" 匹配 "Senior"）
  for (const [key, color] of Object.entries(TAG_COLORS)) {
    if (lowerTag.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTag)) {
      return color;
    }
  }
  
  return DEFAULT_TAG_COLOR;
}

export default function CompanyJobsClient({
  initialJobs,
  companyName,
}: {
  initialJobs: Job[];
  companyName: string;
}) {
  const [selectedType, setSelectedType] = useState<"ALL" | "NEWGRAD" | "INTERN" | "FULLTIME">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // 各分类统计
  const counts = useMemo(() => {
    return {
      all: initialJobs.length,
      newGrad: initialJobs.filter((j) => j.type === "NEWGRAD").length,
      intern: initialJobs.filter((j) => j.type === "INTERN").length,
      fulltime: initialJobs.filter((j) => j.type === "FULLTIME").length,
    };
  }, [initialJobs]);

  const typeTabs = [
    { label: "全部", value: "ALL", count: counts.all },
    { label: "🎓 2026 校招 (New Grad)", value: "NEWGRAD", count: counts.newGrad },
    { label: "🌱 暑期/日常实习 (Intern)", value: "INTERN", count: counts.intern },
    { label: "💼 社招全职 (Experienced)", value: "FULLTIME", count: counts.fulltime },
  ];

  // 过滤当前岗位
  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.tags?.some((t) => t.toLowerCase().includes(q));

      const matchType =
        selectedType === "ALL" || job.type.toUpperCase() === selectedType;

      return matchSearch && matchType;
    });
  }, [initialJobs, searchQuery, selectedType]);

  return (
    <div className="space-y-6">
      {/* 🌟 1. 顶部标题 + 统计 + 筛选选项卡 */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
            当前开放岗位列表 ({filteredJobs.length})
          </h2>
          <span className="text-xs text-gray-400">
            点击【官网投递】直接进入官方网申系统
          </span>
        </div>

        {/* 🌟 核心：实习、校招、社招 快捷筛选按钮组 */}
        <div className="flex flex-wrap items-center gap-2">
          {typeTabs.map((tab) => {
            const isSelected = selectedType === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedType(tab.value as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 2. 岗位卡片流 */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-gray-200 text-center text-gray-400 space-y-2 shadow-sm">
            <p className="text-base font-bold text-gray-700">
              暂无该分类下的开放岗位
            </p>
            <p className="text-xs text-gray-400">
              请尝试切换其他招聘类型标签（如点击"全部"）
            </p>
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
                <div className="space-y-2.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 招聘类型 */}
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

                    {/* 地区 */}
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700">
                      {job.region === "NA" ? "🇺🇸 北美" : job.region === "CN" ? "🇨🇳 国内" : "🌍 Remote"}
                    </span>

                    {/* 急招 */}
                    {job.isHot && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                        <Flame className="h-3 w-3" />
                        急招
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span>{job.location}</span>
                    </div>

                    {job.salary && (
                      <div className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-mono">
                        💰 {job.salary}
                      </div>
                    )}

                    {/* 🎨 彩色标签区域 - 这里是修改的核心 */}
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {job.tags.map((tag: string, idx: number) => {
                          const colorClass = getTagColor(tag);
                          return (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${colorClass}`}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 官方直投 */}
                <div className="flex items-center justify-end flex-shrink-0">
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-95 whitespace-nowrap"
                  >
                    <span>官网投递直达</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}