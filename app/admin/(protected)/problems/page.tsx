import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteProblem } from "./actions";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

type AdminProblemsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    search?: string; // 🌟 新增 search 参数
  }>;
};

// Problem 后台管理页面
export default async function AdminProblemsPage({
  searchParams,
}: AdminProblemsPageProps) {
  const { success, error, search } = await searchParams;

  const trimmedSearch = search?.trim();

  // 🌟 支持根据标题、公司、分类、难度或 ID 进行多字段搜索
  const problems = await prisma.problem.findMany({
    where: trimmedSearch
      ? {
          OR: [
            { title: { contains: trimmedSearch, mode: "insensitive" } },
            { company: { contains: trimmedSearch, mode: "insensitive" } },
            { category: { contains: trimmedSearch, mode: "insensitive" } },
            { difficulty: { contains: trimmedSearch, mode: "insensitive" } },
            ...(!isNaN(Number(trimmedSearch))
              ? [{ id: Number(trimmedSearch) }]
              : []),
          ],
        }
      : undefined,
    orderBy: {
      id: "desc",
    },
  });

  return (
    <main className="py-10 sm:py-12">
      {/* 页面内容容器 */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6">

        {/* 页面顶部区域 */}
        <section className="flex flex-wrap items-center justify-between gap-6">

          {/* 标题区域 */}
          <div>
            {/* 页面标题 */}
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Problems
            </h1>

            {/* 数据数量 */}
            <p className="mt-2 text-gray-500">
              {problems.length} problems in database
              {trimmedSearch && (
                <span className="ml-2 font-medium text-blue-600">
                  (匹配到 {problems.length} 条结果)
                </span>
              )}
            </p>
          </div>

          {/* 新增题目 */}
          <Link
            href="/admin/problems/new"
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Add Problem
          </Link>

        </section>

        {/* 🌟 搜索栏区域 */}
        <section className="mt-8">
          <form method="GET" className="flex gap-3">
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search problems by title, company, category, difficulty or ID..."
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Search
            </button>
            {search && (
              <Link
                href="/admin/problems"
                className="flex items-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Clear
              </Link>
            )}
          </form>
        </section>

        {/* 创建成功提示 */}
        {success === "created" && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
            Problem created successfully.
          </div>
        )}

        {/* 更新成功提示 */}
        {success === "updated" && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
            Problem updated successfully.
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            Something went wrong. Please try again.
          </div>
        )}

        {/* Problem 数据表 */}
        <section className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* 表格 */}
          <table className="min-w-[800px] w-full text-left">

            {/* 表头 */}
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            {/* 表格内容 */}
            <tbody className="divide-y divide-gray-200">
              {problems.length > 0 ? (
                problems.map((problem) => (
                  <tr
                    key={problem.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* ID */}
                    <td className="px-6 py-5 text-gray-500">
                      {problem.id}
                    </td>

                    {/* Title */}
                    <td className="max-w-sm px-6 py-5">
                      <p className="font-medium text-gray-900">
                        {problem.title}
                      </p>
                      <p className="mt-1 truncate text-sm text-gray-500">
                        /problem/{problem.slug}
                      </p>
                    </td>

                    {/* Company */}
                    <td className="px-6 py-5 text-gray-600">
                      {problem.company}
                    </td>

                    {/* Difficulty */}
                    <td className="px-6 py-5 text-gray-600">
                      {problem.difficulty}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-5 text-gray-600">
                      {problem.category}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/problem/${problem.slug}`}
                          target="_blank"
                          className="font-medium text-gray-500 transition hover:text-gray-900"
                        >
                          View
                        </Link>

                        <Link
                          href={`/admin/problems/${problem.id}/edit`}
                          className="font-medium text-blue-600 transition hover:text-blue-800"
                        >
                          Edit
                        </Link>

                        <ConfirmDeleteButton
                          action={deleteProblem.bind(
                            null,
                            problem.id
                          )}
                          itemName={problem.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >
                    <p className="font-medium text-gray-900">
                      {search ? "No problems matched your search." : "No problems yet."}
                    </p>
                    {search ? (
                      <Link
                        href="/admin/problems"
                        className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-800"
                      >
                        Clear search filter →
                      </Link>
                    ) : (
                      <Link
                        href="/admin/problems/new"
                        className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-800"
                      >
                        Add Problem →
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </section>

      </div>
    </main>
  );
}