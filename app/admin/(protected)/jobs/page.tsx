// app/admin/(protected)/jobs/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SyncJobsButton from "@/components/admin/SyncJobsButton";
import DeleteJobButton from "@/components/admin/DeleteJobButton";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ search?: string }>;
};

function getRegionLabel(location: string, isRemote: boolean) {
  const text = `${location || ""}`.toLowerCase();

  if (
    isRemote ||
    text.includes("remote") ||
    text.includes("worldwide") ||
    text.includes("anywhere")
  ) {
    return "🌍 远程";
  }

  if (
    text.includes("china") ||
    text.includes("beijing") ||
    text.includes("shanghai") ||
    text.includes("shenzhen") ||
    text.includes("hangzhou") ||
    text.includes("guangzhou") ||
    text.includes("chengdu") ||
    text.includes("中国") ||
    text.includes("北京") ||
    text.includes("上海") ||
    text.includes("深圳") ||
    text.includes("杭州") ||
    text.includes("广州") ||
    text.includes("成都")
  ) {
    return "🇨🇳 国内";
  }

  return "🇺🇸 北美";
}

function getJobTypeLabel(
  employmentType: string | null,
  level: string | null,
  title: string
) {
  const text = `${employmentType || ""} ${level || ""} ${title || ""}`.toLowerCase();

  if (
    text.includes("intern") ||
    text.includes("internship") ||
    text.includes("co-op") ||
    text.includes("coop") ||
    text.includes("internship")
  ) {
    return "🌱 实习";
  }

  if (
    text.includes("new grad") ||
    text.includes("new graduate") ||
    text.includes("graduate") ||
    text.includes("early career") ||
    text.includes("university") ||
    text.includes("campus")
  ) {
    return "🎓 校招";
  }

  return "💼 全职";
}

function getAtsLabel(ats: string) {
  switch (ats.toLowerCase()) {
    case "greenhouse":
      return "Greenhouse";
    case "lever":
      return "Lever";
    case "ashby":
      return "Ashby";
    case "custom":
      return "Custom";
    default:
      return ats || "Unknown";
  }
}

export default async function AdminJobsPage({ searchParams }: Props) {
  const { search } = (await searchParams) || {};
  const trimmedSearch = search?.trim();

  const jobs = await prisma.job.findMany({
    where: trimmedSearch
      ? {
          OR: [
            {
              title: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              companyName: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              location: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              track: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,
  });

  const activeJobs = jobs.filter((job) => job.isActive);

  return (
    <div className="space-y-6">
      {/* 顶部标题与操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Job Management
            </h1>

            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
              共 {activeJobs.length} 个在招岗位
            </span>

            {jobs.length !== activeJobs.length && (
              <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">
                数据库共 {jobs.length} 条
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            监控与管理全站招聘信息，岗位数据来自公司官方招聘站点及 ATS。
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <SyncJobsButton />
        </div>
      </div>

      {/* 搜索栏 */}
      <section>
        <form method="GET" className="flex gap-3">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="🔍 搜索岗位名称、公司、地点或技术方向..."
            className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
          />

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            搜索
          </button>

          {search && (
            <Link
              href="/admin/jobs"
              className="flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              清空
            </Link>
          )}
        </form>
      </section>

      {/* 岗位数据表 */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-16 text-center text-gray-400 space-y-3">
            <p className="text-base font-bold text-gray-700">
              {search ? "没有找到匹配的岗位" : "暂无岗位数据"}
            </p>

            <p className="text-xs text-gray-400">
              点击右上角【🔄 抓取同步大厂岗位】开始同步官方招聘数据。
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">
                    COMPANY / REGION
                  </th>

                  <th className="px-6 py-4 text-left">
                    JOB TITLE
                  </th>

                  <th className="px-6 py-4 text-left">
                    TYPE & TRACK
                  </th>

                  <th className="px-6 py-4 text-left">
                    LOCATION / SALARY
                  </th>

                  <th className="px-6 py-4 text-left">
                    SOURCE
                  </th>

                  <th className="px-6 py-4 text-right">
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {jobs.map((job) => {
                  const companyName =
                    job.companyName || "Unknown Company";

                  const regionLabel = getRegionLabel(
                    job.location,
                    job.isRemote
                  );

                  const typeLabel = getJobTypeLabel(
                    job.employmentType,
                    job.level,
                    job.title
                  );

                  return (
                    <tr
                      key={job.id}
                      className={`hover:bg-gray-50/70 transition ${
                        !job.isActive ? "opacity-50" : ""
                      }`}
                    >
                      {/* 公司与区域 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">
                              🏢 {companyName}
                            </span>

                            <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-gray-100 text-gray-600">
                              {regionLabel}
                            </span>
                          </div>

                          <span className="text-[10px] text-gray-400 font-mono">
                            {job.companySlug || "—"}
                          </span>
                        </div>
                      </td>

                      {/* 岗位标题 */}
                      <td className="px-6 py-4 max-w-sm">
                        <div className="flex items-center gap-2">
                          {!job.isActive && (
                            <span className="text-[10px] rounded bg-gray-100 text-gray-500 px-1.5 py-0.5 font-semibold">
                              CLOSED
                            </span>
                          )}

                          <div className="font-bold text-gray-900 line-clamp-2">
                            {job.title}
                          </div>
                        </div>

                        {job.jobUrl && (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline font-mono truncate block mt-1"
                          >
                            官方岗位页 ↗
                          </a>
                        )}

                        {job.applyUrl &&
                          job.applyUrl !== job.jobUrl && (
                            <a
                              href={job.applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-gray-400 hover:text-blue-600 truncate block mt-0.5"
                            >
                              投递链接 ↗
                            </a>
                          )}
                      </td>

                      {/* 类型与方向 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1.5">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-100 inline-block">
                            {typeLabel}
                          </span>

                          <div className="text-xs text-gray-600 font-medium">
                            {job.track || "—"}
                          </div>

                          {job.level && (
                            <div className="text-[10px] text-gray-400">
                              Level: {job.level}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 地点与薪资 */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <div className="text-gray-700 font-medium max-w-[260px] truncate">
                          {job.location || "—"}
                        </div>

                        {job.salary && (
                          <div className="text-emerald-600 font-mono font-semibold mt-1">
                            {job.salary}
                          </div>
                        )}

                        {job.isRemote && (
                          <div className="text-[10px] text-green-600 mt-1 font-semibold">
                            Remote
                          </div>
                        )}
                      </td>

                      {/* 来源 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-gray-700">
                            {getAtsLabel(job.ats)}
                          </div>

                          <div className="text-[10px] text-gray-400 font-mono">
                            {job.externalJobId || "—"}
                          </div>
                        </div>
                      </td>

                      {/* 操作 */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-3">
                          {(job.applyUrl || job.jobUrl) && (
                            <a
                              href={job.applyUrl || job.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline"
                            >
                              投递页 ↗
                            </a>
                          )}

                          <DeleteJobButton
                            id={job.id}
                            title={job.title}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}