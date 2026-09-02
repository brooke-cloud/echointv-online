// components/CompanyRadarList.tsx
'use client';

import React from 'react';
import { CompanyConfig, COMPANY_CONFIGS } from '@/lib/jobs/company-config';
import { ExternalLink, ShieldCheck, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';

export interface CompanyStats {
  slug: string;
  activeJobsCount: number;
  newGradCount?: number;
  internCount?: number;
}

interface Props {
  stats?: CompanyStats[];
  selectedCompanySlug?: string;
  selectedJobType?: string; // ALL | New Grad | Intern | Full-time
  onSelectCompany?: (slug: string) => void;
}

export const CompanyRadarList: React.FC<Props> = ({
  stats = [],
  selectedCompanySlug,
  selectedJobType = 'ALL',
  onSelectCompany,
}) => {
  const statsMap = new Map(stats.map((s) => [s.slug, s]));

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 sm:p-6 mb-8 backdrop-blur-md shadow-xl shadow-slate-950/40">
      {/* 顶部标题与权威认证标识 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              大厂招聘雷达动态看板
              <span className="text-xs font-normal text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 官方 ATS 实时验真
              </span>
            </h2>
          </div>
        </div>

        {/* 右侧类别指示 */}
        <div className="flex items-center gap-2.5 text-xs text-slate-400 flex-wrap">
          <span className="flex items-center gap-1 text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-medium">
            <GraduationCap className="w-3.5 h-3.5" /> 支持校招 NG
          </span>
          <span className="flex items-center gap-1 text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> 支持实习 Intern
          </span>
        </div>
      </div>

      {/* 公司雷达网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {COMPANY_CONFIGS.filter((c) => c.enabled).map((company) => {
          const stat = statsMap.get(company.slug);
          const totalJobs = stat?.activeJobsCount ?? 0;
          const ngJobs = stat?.newGradCount ?? 0;
          const internJobs = stat?.internCount ?? 0;

          // 动态显示当前筛选维度的岗位数
          let displayCount = totalJobs;
          let countLabel = '在招岗位';
          if (selectedJobType === 'New Grad') {
            displayCount = ngJobs;
            countLabel = '校招 NG';
          } else if (selectedJobType === 'Intern') {
            displayCount = internJobs;
            countLabel = '实习';
          }

          const hasJobs = displayCount > 0;
          const isSelected = selectedCompanySlug === company.slug;

          return (
            <div
              key={company.slug}
              onClick={() => onSelectCompany?.(isSelected ? '' : company.slug)}
              className={`group relative cursor-pointer rounded-xl p-3.5 border transition-all duration-200 ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                  : hasJobs
                  ? 'bg-slate-800/40 border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/80 hover:shadow-md'
                  : 'bg-slate-900/40 border-slate-800/50 opacity-50 hover:opacity-100'
              }`}
            >
              {/* 第一行：公司名与官网直达 */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                  {company.name}
                </span>
                <a
                  href={company.careerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-500 hover:text-indigo-400 transition-colors p-0.5"
                  title="访问公司官方招聘主页"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 第二行：ATS 类型与岗位数量 */}
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="text-slate-400 font-mono bg-slate-950/80 px-1.5 py-0.5 rounded text-[10px] border border-slate-800">
                  {company.ats}
                </span>
                <span className={`font-mono text-xs font-bold ${hasJobs ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasJobs ? `${displayCount} ${countLabel}` : '暂无HC'}
                </span>
              </div>

              {/* 第三行：NG 与 实习早鸟指标 */}
              <div className="flex items-center gap-1.5 text-[10px] pt-1 border-t border-slate-800/60">
                {ngJobs > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded font-medium">
                    NG {ngJobs}
                  </span>
                )}
                {internJobs > 0 && (
                  <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded font-medium">
                    实习 {internJobs}
                  </span>
                )}
                {ngJobs === 0 && internJobs === 0 && totalJobs > 0 && (
                  <span className="text-slate-500 text-[10px]">仅社招全职</span>
                )}
                {totalJobs === 0 && (
                  <span className="text-slate-600 text-[10px]">暂未开岗</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};