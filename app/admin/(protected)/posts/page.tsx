

import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Admin Dashboard
export default async function AdminPage() {
  const [
    problemCount,
    postCount,
    companies,
    categories,
    recentProblems,
    recentPosts,
  ] = await Promise.all([
    prisma.problem.count(),

    prisma.post.count(),

    prisma.problem.findMany({
      select: {
        company: true,
      },
      distinct: ["company"],
    }),

    prisma.problem.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    }),

    prisma.problem.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  return (
    <main className="py-10 sm:py-12">

      {/* Dashboard 内容容器 */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6">

        {/* Dashboard 页面顶部 */}
        <section>

          {/* 页面标题 */}
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Dashboard
          </h1>

          {/* 页面说明 */}
          <p className="mt-3 text-gray-600">
            Overview of your FastPrep content and database.
          </p>

        </section>

        {/* 数据统计卡片区域 */}
        <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* Problem 总数 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            {/* 统计名称 */}
            <p className="text-sm font-medium text-gray-500">
              Total Problems
            </p>

            {/* 统计数字 */}
            <p className="mt-3 text-4xl font-bold text-gray-900">
              {problemCount}
            </p>

            {/* 管理入口 */}
            <Link
              href="/admin/problems"
              className="mt-5 inline-block text-sm font-medium text-blue-600 transition hover:text-blue-800"
            >
              Manage Problems →
            </Link>

          </div>

          {/* Blog 总数 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            {/* 统计名称 */}
            <p className="text-sm font-medium text-gray-500">
              Blog Posts
            </p>

            {/* 统计数字 */}
            <p className="mt-3 text-4xl font-bold text-gray-900">
              {postCount}
            </p>

            {/* 管理入口 */}
            <Link
              href="/admin/posts"
              className="mt-5 inline-block text-sm font-medium text-blue-600 transition hover:text-blue-800"
            >
              Manage Blog →
            </Link>

          </div>

          {/* Company 数量 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            {/* 统计名称 */}
            <p className="text-sm font-medium text-gray-500">
              Companies
            </p>

            {/* 统计数字 */}
            <p className="mt-3 text-4xl font-bold text-gray-900">
              {companies.length}
            </p>

            {/* 统计说明 */}
            <p className="mt-5 text-sm text-gray-500">
              Unique companies
            </p>

          </div>

          {/* Category 数量 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            {/* 统计名称 */}
            <p className="text-sm font-medium text-gray-500">
              Categories
            </p>

            {/* 统计数字 */}
            <p className="mt-3 text-4xl font-bold text-gray-900">
              {categories.length}
            </p>

            {/* 统计说明 */}
            <p className="mt-5 text-sm text-gray-500">
              Unique problem categories
            </p>

          </div>

        </section>

        {/* 最近内容区域 */}
        <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* 最近新增 Problem */}
          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

            {/* 区域顶部 */}
            <div className="flex flex-wrap items-center justify-between gap-4">

              {/* 区域标题 */}
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Recent Problems
              </h2>

              {/* 查看全部 */}
              <Link
                href="/admin/problems"
                className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
              >
                View All
              </Link>

            </div>

            {/* 最近 Problem 列表 */}
            <div className="mt-6 divide-y divide-gray-200">

              {recentProblems.length > 0 ? (
                recentProblems.map((problem) => (

                  <div
                    key={problem.id}
                    className="flex min-w-0 items-center justify-between gap-4 py-4"
                  >

                    {/* Problem 信息 */}
                    <div className="min-w-0">

                      {/* Problem 标题 */}
                      <p className="truncate font-medium text-gray-900">
                        {problem.title}
                      </p>

                      {/* Company 和 Difficulty */}
                      <p className="mt-1 truncate text-sm text-gray-500">
                        {problem.company} · {problem.difficulty}
                      </p>

                    </div>

                    {/* 编辑入口 */}
                    <Link
                      href={`/admin/problems/${problem.id}/edit`}
                      className="shrink-0 text-sm font-medium text-blue-600 transition hover:text-blue-800"
                    >
                      Edit
                    </Link>

                  </div>

                ))
              ) : (

                <p className="py-8 text-gray-500">
                  No problems yet.
                </p>

              )}

            </div>

          </div>

          {/* 最近 Blog */}
          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

            {/* 区域顶部 */}
            <div className="flex flex-wrap items-center justify-between gap-4">

              {/* 区域标题 */}
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Recent Blog Posts
              </h2>

              {/* 查看全部 */}
              <Link
                href="/admin/posts"
                className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
              >
                View All
              </Link>

            </div>

            {/* 最近 Blog 列表 */}
            <div className="mt-6 divide-y divide-gray-200">

              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (

                  <div
                    key={post.id}
                    className="flex min-w-0 items-center justify-between gap-4 py-4"
                  >

                    {/* Blog 信息 */}
                    <div className="min-w-0">

                      {/* Blog 标题 */}
                      <p className="truncate font-medium text-gray-900">
                        {post.title}
                      </p>

                      {/* 分类和日期 */}
                      <p className="mt-1 truncate text-sm text-gray-500">
                        {post.category} · {post.date}
                      </p>

                    </div>

                    {/* 编辑入口 */}
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="shrink-0 text-sm font-medium text-blue-600 transition hover:text-blue-800"
                    >
                      Edit
                    </Link>

                  </div>

                ))
              ) : (

                <p className="py-8 text-gray-500">
                  No Blog posts yet.
                </p>

              )}

            </div>

          </div>

        </section>

        {/* 快速操作区域 */}
        <section className="mt-10">

          {/* 区域标题 */}
          <h2 className="text-xl font-bold text-gray-900">
            Quick Actions
          </h2>

          {/* 快速操作按钮 */}
          <div className="mt-5 flex flex-wrap gap-4">

            {/* 新增 Problem */}
            <Link
              href="/admin/problems/new"
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Add Problem
            </Link>

            {/* 新增 Blog */}
            <Link
              href="/admin/posts/new"
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
            >
              Add Blog Post
            </Link>

            {/* 查看网站 */}
            <Link
              href="/"
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
            >
              View Website
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}