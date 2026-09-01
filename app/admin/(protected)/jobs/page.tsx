// app/admin/(protected)/jobs/page.tsx
import { Job } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SyncJobsButton from "@/components/admin/SyncJobsButton";
import DeleteJobButton from "@/components/admin/DeleteJobButton";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ search?: string }>;
};

export default async function AdminJobsPage({ searchParams }: Props) {
  const { search } = (await searchParams) || {};
  const trimmedSearch = search?.trim();

  // 搜索与查询全量在招岗位
  const prismaClient = prisma as any;
  const jobs = await prismaClient.job.findMany({
    where: trimmedSearch
      ? {
          OR: [
            { title: { contains: trimmedSearch, mode: "insensitive" } },
            { company: { contains: trimmedSearch, mode: "insensitive" } },
            { location: { contains: trimmedSearch, mode: "insensitive" } },
            { track: { contains: trimmedSearch, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* 顶部标题与操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900">Job Management</h1>
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
              共 {jobs.length} 个在招岗位
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            监控与管理全站国内外大厂招聘信息，支持一键实时爬取与同步各大厂官方岗位。
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
            placeholder="🔍 搜索岗位名称、公司 (如 Amazon / Google / OpenAI)、地点或技术方向..."
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
              {search ? "没有找到匹配的岗位" : "暂无在招岗位数据"}
            </p>
            <p className="text-xs text-gray-400">点击右上角【🔄 抓取同步大厂岗位】即可一键入库！</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">COMPANY / REGION</th>
                  <th className="px-6 py-4 text-left">JOB TITLE (岗位名称)</th>
                  <th className="px-6 py-4 text-left">TYPE & TRACK</th>
                  <th className="px-6 py-4 text-left">LOCATION / SALARY</th>
                  <th className="px-6 py-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {jobs.map((job: Job) => (
                  <tr key={job.id} className="hover:bg-gray-50/70 transition">
                    {/* 公司与区域 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          🏢 {job.company}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-gray-100 text-gray-600">
                          {job.region === "NA" ? "🇺🇸 北美" : job.region === "CN" ? "🇨🇳 国内" : "🌍 远程"}
                        </span>
                      </div>
                    </td>

                    {/* 岗位标题与投递链接 */}
                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-bold text-gray-900 line-clamp-1">{job.title}</div>
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline font-mono truncate block mt-0.5"
                      >
                        {job.applyUrl}
                      </a>
                    </td>

                    {/* 类型与方向 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-100 inline-block">
                          {job.type === "NEWGRAD" ? "🎓 校招" : job.type === "INTERN" ? "🌱 实习" : "💼 全职"}
                        </span>
                        <div className="text-xs text-gray-500 font-medium">{job.track}</div>
                      </div>
                    </td>

                    {/* 地点与薪资 */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="text-gray-700 font-medium">{job.location}</div>
                      {job.salary && (
                        <div className="text-emerald-600 font-mono font-semibold mt-0.5">
                          {job.salary}
                        </div>
                      )}
                    </td>

                    {/* 操作按钮 */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          投递页 ↗
                        </a>
                        <DeleteJobButton id={job.id} title={job.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}