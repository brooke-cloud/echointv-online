
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProblem } from "./actions";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

type AdminProblemsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

// Problem 后台管理页面
export default async function AdminProblemsPage({
  searchParams,
}: AdminProblemsPageProps) {
  const { success, error } =
    await searchParams;

  const problems =
    await prisma.problem.findMany({
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
        <section className="mt-10 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* 表格 */}
          <table className="min-w-[800px] w-full text-left">

            {/* 表头 */}
            <thead className="bg-gray-50 text-sm text-gray-500">

              {/* 表头行 */}
              <tr>

                {/* ID */}
                <th className="px-6 py-4">
                  ID
                </th>

                {/* Title */}
                <th className="px-6 py-4">
                  Title
                </th>

                {/* Company */}
                <th className="px-6 py-4">
                  Company
                </th>

                {/* Difficulty */}
                <th className="px-6 py-4">
                  Difficulty
                </th>

                {/* Category */}
                <th className="px-6 py-4">
                  Category
                </th>

                {/* Actions */}
                <th className="px-6 py-4">
                  Actions
                </th>

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

                      {/* Problem 标题 */}
                      <p className="font-medium text-gray-900">
                        {problem.title}
                      </p>

                      {/* Problem Slug */}
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

                      {/* 操作区域 */}
                      <div className="flex items-center gap-4">

                        {/* 查看前台 */}
                        <Link
                          href={`/problem/${problem.slug}`}
                          className="font-medium text-gray-500 transition hover:text-gray-900"
                        >
                          View
                        </Link>

                        {/* 编辑题目 */}
                        <Link
                          href={`/admin/problems/${problem.id}/edit`}
                          className="font-medium text-blue-600 transition hover:text-blue-800"
                        >
                          Edit
                        </Link>

                        {/* 删除题目 */}
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

                  {/* 空数据 */}
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >

                    {/* 空数据标题 */}
                    <p className="font-medium text-gray-900">
                      No problems yet.
                    </p>

                    {/* 新增题目 */}
                    <Link
                      href="/admin/problems/new"
                      className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-800"
                    >
                      Add Problem →
                    </Link>

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