// components/CompanyJobsClient.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  MapPin,
  ExternalLink,
  Briefcase,
  Globe,
  DollarSign,
  Layers,
  Flame,
  CheckCircle2,
  FilterX,
  CopyX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { CompanyRadarList } from './CompanyRadarList';

export interface JobItem {
  id: string;
  reqId?: string | null;
  title: string;
  company: string;
  companySlug: string;
  location: string;
  isRemote: boolean;
  category: string;
  employmentType?: string | null;
  applyUrl: string;
  salary?: string | null;
  postedAt: string | Date;
  updatedAt?: string | Date;
  source?: string;
  region?: 'North America' | 'China' | 'Remote' | 'Other';
  track?: string;
  jobType?: 'Full-time' | 'Intern' | 'New Grad' | 'Contract' | 'Part-time';
  level?: string;
  tags?: string[];
}

interface Props {
  initialJobs: JobItem[];
  companyStats: { slug: string; activeJobsCount: number }[];
}

/**
 * 地区筛选
 */
const REGIONS = [
  { id: 'ALL', label: '全部地区' },
  { id: 'North America', label: '北美 (North America)' },
  { id: 'China', label: '中国 (China)' },
  { id: 'Remote', label: '远程 (Remote)' },
];

/**
 * 工作类型
 *
 * 重要：
 * 这里已经删除 Full-time。
 *
 * 网站现在只服务：
 * - New Grad
 * - Intern
 */
const JOB_TYPES = [
  { id: 'ALL', label: 'NG + Intern' },
  { id: 'New Grad', label: '校招 / New Grad' },
  { id: 'Intern', label: '实习 / Intern' },
];

/**
 * 技术方向
 */
const TRACKS = [
  { id: 'ALL', label: '全部方向' },
  { id: 'Backend', label: 'Backend' },
  { id: 'Frontend', label: 'Frontend' },
  { id: 'Fullstack', label: 'Fullstack' },
  { id: 'AI/ML', label: 'AI/ML' },
  { id: 'Data', label: 'Data' },
  { id: 'DevOps', label: 'DevOps' },
  { id: 'Mobile', label: 'Mobile' },
  { id: 'Security', label: 'Security' },
  { id: 'Embedded', label: 'Embedded' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const CompanyJobsClient: React.FC<Props> = ({ initialJobs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');

  /**
   * 默认 ALL。
   *
   * 但是这里的 ALL 已经不是“所有岗位”，
   * 而是“所有 NG + Intern”。
   */
  const [selectedJobType, setSelectedJobType] = useState('ALL');

  const [selectedTrack, setSelectedTrack] = useState('ALL');
  const [selectedCompanySlug, setSelectedCompanySlug] = useState('');
  const [onlyTodayNew, setOnlyTodayNew] = useState(false);
  const [dedupEnabled, setDedupEnabled] = useState(true);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const twentyFourHoursAgo = useMemo(() => {
    return Date.now() - 24 * 60 * 60 * 1000;
  }, []);

  /**
   * ============================================================
   * 0. 岗位归一化
   *
   * 核心要求：
   *
   * 只允许：
   *   New Grad
   *   Intern
   *
   * 其他：
   *   Full-time
   *   Experienced
   *   Contract
   *   Part-time
   *   未知
   *
   * 全部排除。
   * ============================================================
   */
  const normalizedJobs = useMemo(() => {
    return (initialJobs || [])
      .map((job): JobItem | null => {
        const t = (job.title || '').toLowerCase();
        const l = (job.level || '').toLowerCase();
        const e = (job.employmentType || '').toLowerCase();

        let resolvedType:
          | 'Intern'
          | 'New Grad'
          | undefined;

        /**
         * --------------------------------------------------------
         * 1. Intern
         * --------------------------------------------------------
         */
        if (
          job.jobType === 'Intern' ||
          e.includes('intern') ||
          e.includes('internship') ||
          l.includes('intern') ||
          t.includes('intern') ||
          t.includes('internship') ||
          t.includes('co-op') ||
          t.includes('coop') ||
          t.includes('co op') ||
          t.includes('summer 202') ||
          t.includes('fall 202') ||
          t.includes('spring 202') ||
          t.includes('trainee') ||
          t.includes('fellowship') ||
          t.includes('实习') ||
          t.includes('实习生')
        ) {
          resolvedType = 'Intern';
        }

        /**
         * --------------------------------------------------------
         * 2. New Grad
         * --------------------------------------------------------
         *
         * 注意：
         *
         * New Grad 很多时候 employmentType 也是 Full-time。
         *
         * 所以不能通过：
         *
         *   employmentType === Full-time
         *
         * 来判断社招。
         *
         * 必须根据 level / title / jobType 等信息判断。
         * --------------------------------------------------------
         */
        else if (
          job.jobType === 'New Grad' ||
          l.includes('new grad') ||
          l.includes('new-grad') ||
          l.includes('new graduate') ||
          l.includes('early career') ||
          l.includes('early-career') ||
          l.includes('earlycareer') ||
          l.includes('university') ||
          l.includes('graduate') ||
          l.includes('grad') ||
          l.includes('campus') ||
          l.includes('entry level') ||
          l.includes('entry-level') ||
          l.includes('entrylevel') ||
          l.includes('junior') ||
          l.includes('associate') ||
          l.includes('sde i') ||
          l.includes('sde 1') ||
          l.includes('swe i') ||
          l.includes('swe 1') ||
          e.includes('new grad') ||
          e.includes('graduate') ||
          e.includes('early career') ||
          e.includes('campus') ||
          t.includes('new grad') ||
          t.includes('new-grad') ||
          t.includes('new graduate') ||
          t.includes('early career') ||
          t.includes('early-career') ||
          t.includes('university') ||
          t.includes('university graduate') ||
          t.includes('college graduate') ||
          t.includes('college grad') ||
          t.includes('graduate') ||
          t.includes('graduate engineer') ||
          t.includes('graduate program') ||
          t.includes('campus') ||
          t.includes('campus hire') ||
          t.includes('entry level') ||
          t.includes('entry-level') ||
          t.includes('entrylevel') ||
          t.includes('junior') ||
          t.includes('sde i') ||
          t.includes('sde 1') ||
          t.includes('swe i') ||
          t.includes('swe 1') ||
          t.includes('associate software') ||
          t.includes('rotational') ||
          t.includes('apprentice') ||
          t.includes('校招') ||
          t.includes('应届') ||
          t.includes('校园招聘') ||
          t.includes('毕业生') ||
          t.includes('2025 grad') ||
          t.includes('2026 grad') ||
          t.includes('2027 grad') ||
          t.includes('2025 graduate') ||
          t.includes('2026 graduate') ||
          t.includes('2027 graduate') ||
          t.includes('class of 2025') ||
          t.includes('class of 2026') ||
          t.includes('class of 2027') ||
          t.includes('2025 start') ||
          t.includes('2026 start') ||
          t.includes('2027 start') ||
          t.includes('2025 cohort') ||
          t.includes('2026 cohort') ||
          t.includes('2027 cohort')
        ) {
          resolvedType = 'New Grad';
        }

        /**
         * --------------------------------------------------------
         * 3. 其他全部丢弃
         * --------------------------------------------------------
         *
         * 这里是本次修改最重要的地方。
         *
         * 不再：
         *
         *   resolvedType = 'Full-time'
         *
         * 因为那会把社招岗位重新放回来。
         * --------------------------------------------------------
         */
        if (!resolvedType) {
          return null;
        }

        return {
          ...job,
          jobType: resolvedType,

          /**
           * employmentType 也同步成真正的展示类型。
           *
           * 这样 NG 不会显示：
           *
           * Full-time
           *
           * 而会显示：
           *
           * New Grad
           */
          employmentType: resolvedType,

          /**
           * 同步 level。
           */
          level:
            resolvedType === 'Intern'
              ? 'Intern'
              : 'New Grad',
        };
      })
      .filter((job): job is JobItem => job !== null);
  }, [initialJobs]);

  /**
   * ============================================================
   * 1. 动态统计公司岗位
   *
   * 因为 normalizedJobs 已经只剩 NG + Intern，
   * 所以这里的 total 也只会统计 NG + Intern。
   * ============================================================
   */
  const dynamicCompanyStats = useMemo(() => {
    const statsMap = new Map<
      string,
      {
        total: number;
        ng: number;
        intern: number;
      }
    >();

    for (const job of normalizedJobs) {
      if (!job.companySlug) continue;

      const current =
        statsMap.get(job.companySlug) || {
          total: 0,
          ng: 0,
          intern: 0,
        };

      current.total++;

      if (job.jobType === 'New Grad') {
        current.ng++;
      }

      if (job.jobType === 'Intern') {
        current.intern++;
      }

      statsMap.set(job.companySlug, current);
    }

    return Array.from(statsMap.entries()).map(
      ([slug, stats]) => ({
        slug,
        activeJobsCount: stats.total,
        newGradCount: stats.ng,
        internCount: stats.intern,
      })
    );
  }, [normalizedJobs]);

  /**
   * ============================================================
   * 2. 搜索 + 筛选 + 去重
   * ============================================================
   */
  const filteredJobs = useMemo(() => {
    const matched = normalizedJobs.filter((job) => {
      /**
       * --------------------------------------------------------
       * 搜索
       * --------------------------------------------------------
       */
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();

        const matchTitle =
          job.title.toLowerCase().includes(query);

        const matchCompany =
          job.company.toLowerCase().includes(query);

        const matchLocation =
          job.location.toLowerCase().includes(query);

        const matchTags = (job.tags || []).some((tag) =>
          tag.toLowerCase().includes(query)
        );

        const matchTrack =
          (job.track || '').toLowerCase().includes(query);

        if (
          !matchTitle &&
          !matchCompany &&
          !matchLocation &&
          !matchTags &&
          !matchTrack
        ) {
          return false;
        }
      }

      /**
       * --------------------------------------------------------
       * 公司过滤
       * --------------------------------------------------------
       */
      if (
        selectedCompanySlug &&
        job.companySlug !== selectedCompanySlug
      ) {
        return false;
      }

      /**
       * --------------------------------------------------------
       * 地区过滤
       * --------------------------------------------------------
       */
      if (selectedRegion !== 'ALL') {
        if (
          selectedRegion === 'Remote' &&
          !job.isRemote &&
          job.region !== 'Remote'
        ) {
          return false;
        }

        if (
          selectedRegion !== 'Remote' &&
          job.region !== selectedRegion
        ) {
          return false;
        }
      }

      /**
       * --------------------------------------------------------
       * 工作类型过滤
       *
       * ALL = NG + Intern
       * --------------------------------------------------------
       */
      if (selectedJobType !== 'ALL') {
        if (job.jobType !== selectedJobType) {
          return false;
        }
      }

      /**
       * --------------------------------------------------------
       * 技术方向过滤
       * --------------------------------------------------------
       */
      if (selectedTrack !== 'ALL') {
        if (
          job.track !== selectedTrack &&
          job.category !== selectedTrack
        ) {
          return false;
        }
      }

      /**
       * --------------------------------------------------------
       * 今日新增
       * --------------------------------------------------------
       */
      if (onlyTodayNew) {
        const postTime = new Date(job.postedAt).getTime();

        if (
          Number.isNaN(postTime) ||
          postTime < twentyFourHoursAgo
        ) {
          return false;
        }
      }

      return true;
    });

    /**
     * ----------------------------------------------------------
     * 智能去重
     *
     * 相同：
     * 公司 + 职位名称 + 地点
     *
     * 只保留最新的一条。
     * ----------------------------------------------------------
     */
    if (!dedupEnabled) {
      return matched;
    }

    const uniqueMap = new Map<string, JobItem>();

    for (const job of matched) {
      const dedupKey =
        `${job.company.toLowerCase()}_` +
        `${job.title.toLowerCase().trim()}_` +
        `${job.location.toLowerCase().trim()}`;

      if (!uniqueMap.has(dedupKey)) {
        uniqueMap.set(dedupKey, job);
      }
    }

    return Array.from(uniqueMap.values());
  }, [
    normalizedJobs,
    searchTerm,
    selectedCompanySlug,
    selectedRegion,
    selectedJobType,
    selectedTrack,
    onlyTodayNew,
    dedupEnabled,
    twentyFourHoursAgo,
  ]);

  /**
   * ============================================================
   * 筛选条件变化时回到第一页
   * ============================================================
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCompanySlug,
    selectedRegion,
    selectedJobType,
    selectedTrack,
    onlyTodayNew,
    dedupEnabled,
    pageSize,
  ]);

  /**
   * ============================================================
   * 分页
   * ============================================================
   */
  const totalJobs = filteredJobs.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalJobs / pageSize)
  );

  const validCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (validCurrentPage - 1) * pageSize;

  const endIndex = Math.min(
    startIndex + pageSize,
    totalJobs
  );

  const paginatedJobs = filteredJobs.slice(
    startIndex,
    endIndex
  );

  /**
   * ============================================================
   * 翻页
   * ============================================================
   */
  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 1 &&
      newPage <= totalPages
    ) {
      setCurrentPage(newPage);

      const listEl = document.getElementById(
        'jobs-list-container'
      );

      if (listEl) {
        listEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  /**
   * ============================================================
   * 页码生成
   * ============================================================
   */
  const paginationRange = useMemo(() => {
    const delta = 2;

    const range: (number | string)[] = [];

    for (
      let i = Math.max(
        2,
        validCurrentPage - delta
      );
      i <=
      Math.min(
        totalPages - 1,
        validCurrentPage + delta
      );
      i++
    ) {
      range.push(i);
    }

    if (
      validCurrentPage - delta > 2
    ) {
      range.unshift('...');
    }

    if (
      validCurrentPage + delta <
      totalPages - 1
    ) {
      range.push('...');
    }

    range.unshift(1);

    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  }, [
    validCurrentPage,
    totalPages,
  ]);

  /**
   * ============================================================
   * 时间格式
   * ============================================================
   */
  const formatTimeAgo = (
    dateInput: string | Date
  ) => {
    const d = new Date(dateInput);

    if (Number.isNaN(d.getTime())) {
      return '近期发布';
    }

    const diffHours = Math.floor(
      (Date.now() - d.getTime()) /
        (1000 * 60 * 60)
    );

    if (diffHours < 1) {
      return '刚刚发布';
    }

    if (diffHours < 24) {
      return `${diffHours}小时前`;
    }

    const diffDays = Math.floor(
      diffHours / 24
    );

    if (diffDays === 1) {
      return '昨天';
    }

    if (diffDays < 30) {
      return `${diffDays}天前`;
    }

    return d.toLocaleDateString(
      'zh-CN',
      {
        month: 'numeric',
        day: 'numeric',
      }
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ======================================================
          顶部公司招聘雷达
          ====================================================== */}
      <CompanyRadarList
        stats={dynamicCompanyStats}
        selectedCompanySlug={selectedCompanySlug}
        selectedJobType={selectedJobType}
        onSelectCompany={(slug) =>
          setSelectedCompanySlug(slug)
        }
      />

      {/* ======================================================
          搜索 + 筛选控制台
          ====================================================== */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 sm:p-7 mb-8 backdrop-blur-md shadow-xl shadow-slate-950/50">

        {/* 搜索框 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">

          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="搜索职位名称、公司、技术栈 (如 Python, React, PyTorch, Golang)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-800/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">

            {/* 智能去重 */}
            <button
              onClick={() =>
                setDedupEnabled(!dedupEnabled)
              }
              title="过滤 ATS 接口重复发布的同名同地点岗位"
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                dedupEnabled
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                  : 'bg-slate-800/50 border-slate-700/70 text-slate-400 hover:text-white'
              }`}
            >
              <CopyX className="w-3.5 h-3.5" />

              <span>
                {dedupEnabled
                  ? '已自动去重'
                  : '显示重复'}
              </span>
            </button>

            {/* 今日新增 */}
            <button
              onClick={() =>
                setOnlyTodayNew(!onlyTodayNew)
              }
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                onlyTodayNew
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800/50 border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  onlyTodayNew
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-400'
                }`}
              />

              <span>
                Today&apos;s New Jobs
              </span>
            </button>
          </div>
        </div>

        {/* ====================================================
            筛选矩阵
            ==================================================== */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">

          {/* 地区 */}
          <div className="flex flex-wrap items-center gap-2">

            <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1.5 min-w-[70px]">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />

              地区:
            </span>

            {REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() =>
                  setSelectedRegion(region.id)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedRegion === region.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                {region.label}
              </button>
            ))}
          </div>

          {/* ==================================================
              工作类型

              这里只剩：
              - NG + Intern
              - New Grad
              - Intern

              没有 Full-time。
              ================================================== */}
          <div className="flex flex-wrap items-center gap-2">

            <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1.5 min-w-[70px]">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />

              类型:
            </span>

            {JOB_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() =>
                  setSelectedJobType(type.id)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedJobType === type.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* 技术方向 */}
          <div className="flex flex-wrap items-center gap-2">

            <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1.5 min-w-[70px]">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />

              方向:
            </span>

            {TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() =>
                  setSelectedTrack(track.id)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTrack === track.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                {track.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          状态统计条
          ====================================================== */}
      <div
        id="jobs-list-container"
        className="scroll-mt-6 flex flex-col sm:flex-row sm:items-center justify-between text-sm text-slate-400 mb-4 px-1 gap-3"
      >

        <div className="flex items-center gap-2 flex-wrap">

          <span>
            共{' '}
            <strong className="text-white font-mono text-base">
              {totalJobs}
            </strong>{' '}
            个岗位

            {totalJobs > 0 && (
              <span className="text-xs text-slate-400 ml-1.5">
                （显示第{' '}
                <span className="text-indigo-400 font-mono font-medium">
                  {startIndex + 1}-{endIndex}
                </span>{' '}
                条）
              </span>
            )}
          </span>

          {/* 活跃状态 */}
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />

            OPEN 活跃招聘中
          </span>

          {/* 去重状态 */}
          {dedupEnabled && (
            <span className="text-[11px] text-slate-500 font-mono">
              （已自动过滤同公司同名重复岗位）
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">

          {/* 清除公司筛选 */}
          {selectedCompanySlug && (
            <button
              onClick={() =>
                setSelectedCompanySlug('')
              }
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium transition-colors flex items-center gap-1"
            >
              <FilterX className="w-3.5 h-3.5" />

              清除公司筛选
            </button>
          )}

          {/* 每页条数 */}
          <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-xl text-xs">

            <span className="text-slate-400">
              每页:
            </span>

            <div className="flex gap-1">

              {PAGE_SIZE_OPTIONS.map(
                (size) => (
                  <button
                    key={size}
                    onClick={() =>
                      setPageSize(size)
                    }
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
                      pageSize === size
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {size}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          职位列表
          ====================================================== */}
      <div className="space-y-4">

        {paginatedJobs.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800/90 rounded-2xl">

            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />

            <p className="text-slate-300 text-base font-semibold">
              未找到符合当前筛选条件的岗位
            </p>

            <p className="text-slate-500 text-xs mt-1">
              请尝试切换地区、调整工作类型或重置搜索词
            </p>
          </div>
        ) : (
          paginatedJobs.map((job) => (
            <div
              key={job.id}
              className="group bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5"
            >

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                <div className="space-y-3 flex-1">

                  {/* ==================================================
                      第一行：
                      公司 / 方向 / Level / 类型
                      ================================================== */}
                  <div className="flex items-center flex-wrap gap-2">

                    {/* 公司 */}
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-md">
                      {job.company}
                    </span>

                    {/* 技术方向 */}
                    {job.track && (
                      <span className="text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-md">
                        {job.track}
                      </span>
                    )}

                    {/* Level */}
                    {job.level &&
                      job.level !== job.jobType && (
                        <span className="text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-md">
                          {job.level}
                        </span>
                      )}

                    {/* Job Type */}
                    {job.jobType && (
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                          job.jobType === 'New Grad'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : job.jobType === 'Intern'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {job.jobType}
                      </span>
                    )}

                    {/* Remote */}
                    {job.isRemote && (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3" />

                        Remote
                      </span>
                    )}
                  </div>

                  {/* ==================================================
                      第二行：职位名称
                      ================================================== */}
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {job.title}
                  </h3>

                  {/* ==================================================
                      第三行：
                      地点 / 薪资 / 技术栈
                      ================================================== */}
                  <div className="flex items-center flex-wrap gap-y-2 gap-x-4 text-xs text-slate-400">

                    {/* 地点 */}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />

                      {job.location}
                    </span>

                    {/* 薪资 */}
                    {job.salary && (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <DollarSign className="w-3.5 h-3.5" />

                        {job.salary}
                      </span>
                    )}

                    {/* Tags */}
                    {job.tags &&
                      job.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">

                          {job.tags.map(
                            (tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-[11px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-md"
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>

                  {/* ==================================================
                      第四行：
                      官方来源 / ATS / 发布时间
                      ================================================== */}
                  <div className="flex items-center flex-wrap gap-y-1 gap-x-4 text-[11px] text-slate-500 pt-1">

                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />

                      Official {job.company} Careers
                    </span>

                    <span className="text-slate-400 font-mono">
                      ATS:{' '}
                      {job.source?.toUpperCase() ||
                        'OFFICIAL'}
                    </span>

                    <span suppressHydrationWarning>
                      发布于{' '}
                      {formatTimeAgo(
                        job.postedAt
                      )}
                    </span>

                    {job.updatedAt && (
                      <span suppressHydrationWarning>
                        • 更新于{' '}
                        {formatTimeAgo(
                          job.updatedAt
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* ==================================================
                    官方申请按钮
                    ================================================== */}
                <div className="flex items-center lg:self-center">

                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all duration-200 cursor-pointer"
                  >
                    <span>
                      Official Apply
                    </span>

                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ======================================================
          底部分页
          ====================================================== */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-md">

          {/* 左侧：页码统计 */}
          <div className="text-xs text-slate-400">

            第{' '}
            <span className="font-mono text-white font-bold">
              {validCurrentPage}
            </span>{' '}
            /{' '}
            <span className="font-mono">
              {totalPages}
            </span>{' '}
            页，共{' '}
            <span className="font-mono text-white">
              {totalJobs}
            </span>{' '}
            条
          </div>

          {/* 中间：页码按钮 */}
          <div className="flex items-center gap-1 sm:gap-1.5">

            {/* 第一页 */}
            <button
              onClick={() =>
                handlePageChange(1)
              }
              disabled={
                validCurrentPage === 1
              }
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="第一页"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* 上一页 */}
            <button
              onClick={() =>
                handlePageChange(
                  validCurrentPage - 1
                )
              }
              disabled={
                validCurrentPage === 1
              }
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="上一页"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* 页码 */}
            {paginationRange.map(
              (page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={`dots-${index}`}
                      className="px-2 py-1 text-slate-500 text-xs font-mono"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum =
                  page as number;

                const isActive =
                  pageNum ===
                  validCurrentPage;

                return (
                  <button
                    key={pageNum}
                    onClick={() =>
                      handlePageChange(
                        pageNum
                      )
                    }
                    className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-mono font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/60'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}

            {/* 下一页 */}
            <button
              onClick={() =>
                handlePageChange(
                  validCurrentPage + 1
                )
              }
              disabled={
                validCurrentPage ===
                totalPages
              }
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="下一页"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* 最后一页 */}
            <button
              onClick={() =>
                handlePageChange(
                  totalPages
                )
              }
              disabled={
                validCurrentPage ===
                totalPages
              }
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="最后一页"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* 右侧：每页数量 */}
          <div className="text-xs text-slate-500 font-mono hidden md:block">
            {pageSize} 岗位/页
          </div>
        </div>
      )}
    </div>
  );
};