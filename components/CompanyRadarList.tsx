// components/CompanyRadarList.tsx

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Sprout,
  Briefcase,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface CompanyStatusItem {
  name: string;
  slug: string;
  isOpen: boolean;
  statusText: string;
  category: "FAANG" | "AI" | "QUANT" | "UNICORN" | "APAC" | "TECH";
  headquarters: string;
  openRolesCount: number;
  hasNewGrad: boolean;
  hasIntern: boolean;
  hasFulltime: boolean;
  visaPolicy: string;
  description: string;
}

export default function CompanyRadarList({
  companies,
  totalJobsCount,
}: {
  companies: CompanyStatusItem[];
  totalJobsCount: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = [
    { label: "全部大厂", value: "ALL" },
    { label: "🔥 FAANG 巨头", value: "FAANG" },
    { label: "🤖 AI & 大模型", value: "AI" },
    { label: "📈 顶级量化对冲", value: "QUANT" },
    { label: "🦄 独角兽与云原生", value: "UNICORN" },
    { label: "🌏 国内出海名企", value: "APAC" },
  ];

  // 统计数据
  const openCount = companies.filter((c) => c.isOpen).length;
  const closedCount = companies.filter((c) => !c.isOpen).length;

  // 实时多维过滤
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.headquarters.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);

      const matchStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "OPEN" && c.isOpen) ||
        (selectedStatus === "CLOSED" && !c.isOpen);

      const matchCategory =
        selectedCategory === "ALL" || c.category === selectedCategory;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [companies, searchQuery, selectedStatus, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* 🌟 1. 核心数据看板 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50/70 p-6 rounded-3xl border border-emerald-200/80 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>正在开放招聘大厂</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-900">{openCount} 家名企</div>
          <div className="text-xs text-emerald-700/80">包含 2026 校招、暑期实习与社招</div>
        </div>

        <div className="bg-rose-50/70 p-6 rounded-3xl border border-rose-200/80 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
            <XCircle className="h-4 w-4 text-rose-600" />
            <span>暂停招聘 / 招满关闭</span>
          </div>
          <div className="text-3xl font-extrabold text-rose-900">{closedCount} 家企业</div>
          <div className="text-xs text-rose-700/80">已招满或暂无软件研发通道</div>
        </div>

        <div className="bg-blue-50/70 p-6 rounded-3xl border border-blue-200/80 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>已收录官方在招岗位</span>
          </div>
          <div className="text-3xl font-extrabold text-blue-900">{totalJobsCount} 个在招职位</div>
          <div className="text-xs text-blue-700/80">100% 官方直通投递通道</div>
        </div>
      </div>

      {/* 🌟 2. 搜索与状态过滤器 */}
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
            placeholder="🔍 搜索大厂名称 (如 Google, Meta, Amazon, OpenAI, Jane Street) 或地点..."
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

        {/* 状态与大厂分类选项卡 */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          {/* 状态切换 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0">
              招聘状态
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  selectedStatus === "ALL"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                全部状态 ({companies.length})
              </button>
              <button
                onClick={() => setSelectedStatus("OPEN")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  selectedStatus === "OPEN"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>🟢 正在招人 ({openCount})</span>
              </button>
              <button
                onClick={() => setSelectedStatus("CLOSED")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  selectedStatus === "CLOSED"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>🔴 暂停招人/招满 ({closedCount})</span>
              </button>
            </div>
          </div>

          {/* 大厂分类 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0">
              大厂领域
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                    selectedCategory === cat.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 3. 公司大盘卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompanies.map((company) => {
          return (
            <div
              key={company.name}
              className={`rounded-3xl p-6 border shadow-sm transition flex flex-col justify-between min-h-[250px] ${
                company.isOpen
                  ? "bg-white border-gray-200/90 hover:shadow-md hover:border-blue-300"
                  : "bg-gray-50/70 border-gray-200/60 opacity-80"
              }`}
            >
              <div className="space-y-3">
                {/* 顶部：公司名 + 状态徽章 */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 leading-tight">
                      {company.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      📍 {company.headquarters}
                    </p>
                  </div>

                  {/* 状态徽章 */}
                  {company.isOpen ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>正在招人</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      <span>暂停招聘</span>
                    </span>
                  )}
                </div>

                {/* 简介 */}
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {company.description}
                </p>

                {/* 开放通道标签 */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {company.isOpen ? (
                    <>
                      {company.hasNewGrad && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          <span>2026 校招</span>
                        </span>
                      )}
                      {company.hasIntern && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                          <Sprout className="h-3 w-3" />
                          <span>暑期实习</span>
                        </span>
                      )}
                      {company.hasFulltime && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          <span>社招全职</span>
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">
                      {company.statusText}
                    </span>
                  )}
                </div>
              </div>

              {/* 底部跳转按钮 */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {company.isOpen ? `${company.openRolesCount} 个职位开放中` : "当前通道已关闭"}
                </span>

                {company.isOpen ? (
                  <Link
                    href={`/jobs/${company.slug}`}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition active:scale-95"
                  >
                    <span>查看在招岗位</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-gray-400">
                    暂无在招
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}