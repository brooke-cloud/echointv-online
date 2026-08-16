import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Software Engineering Interview Preparation",

  description:
    "Prepare for software engineering interviews with coding problems, interview experiences, system design guides, and technical resources.",

  alternates: {
    canonical: "/",
  },
};

// 首页
export default async function HomePage() {
  const [
    problemCount,
    postCount,
    companies,
    latestProblems,
    latestPosts,
  ] = await Promise.all([
    prisma.problem.count(),

    prisma.post.count(),

    prisma.problem.findMany({
      select: {
        company: true,
      },
      distinct: ["company"],
      orderBy: {
        company: "asc",
      },
      take: 8,
    }),

    prisma.problem.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    }),

    prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    }),
  ]);

  return (
    <main className="bg-white">

      {/* Hero */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">

        {/* Hero 内容 */}
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:py-28">

          {/* Hero 主体 */}
          <div className="mx-auto max-w-4xl text-center">

          

            {/* Hero 标题 */}
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
              Prepare smarter.

              {/* Hero 强调文字 */}
              <span className="mt-2 block text-blue-600">
                Interview with confidence.
              </span>
            </h1>

            {/* Hero 描述 */}
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg md:text-xl">
              Practice real interview problems, read interview experiences,
              and learn the skills you need for software engineering interviews.
            </p>

            {/* Hero 按钮 */}
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">

              {/* 浏览题库 */}
              <Link
                href="/problem"
                className="rounded-xl bg-blue-600 px-6 py-3.5 text-center font-medium text-white transition hover:bg-blue-700"
              >
                Browse Problems
              </Link>

              {/* 阅读 Blog */}
              <Link
                href="/blog"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-center font-medium text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
              >
                Read Interview Blog
              </Link>

            </div>

          </div>


          {/* 首页统计 */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-5">

            {/* Problem 数量 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-6">

              {/* 数字 */}
              <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {problemCount}+
              </p>

              {/* 名称 */}
              <p className="mt-2 text-sm text-gray-500">
                Interview Problems
              </p>

            </div>


            {/* Blog 数量 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-6">

              {/* 数字 */}
              <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {postCount}+
              </p>

              {/* 名称 */}
              <p className="mt-2 text-sm text-gray-500">
                Interview Articles
              </p>

            </div>


            {/* Company 数量 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-6">

              {/* 数字 */}
              <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {companies.length}+
              </p>

              {/* 名称 */}
              <p className="mt-2 text-sm text-gray-500">
                Companies Covered
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* Company 区域 */}
      <section className="border-b border-gray-200 bg-gray-50">

        {/* Company 内容 */}
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14">

          {/* 标题 */}
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500 sm:text-sm">
            Interview problems from top companies
          </p>

          {/* Company 列表 */}
          <div className="mt-7 flex flex-wrap justify-center gap-2.5 sm:mt-8 sm:gap-3">

            {companies.map((company) => (
              <span
                key={company.company}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm sm:px-5 sm:py-2.5"
              >
                {company.company}
              </span>
            ))}

          </div>

        </div>

      </section>


      {/* Featured Problems */}
      <section className="bg-white">

        {/* Problem 内容 */}
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">

          {/* Section 顶部 */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            {/* 标题区域 */}
            <div>

              {/* 小标题 */}
              <p className="font-semibold text-blue-600">
                Practice
              </p>

              {/* 主标题 */}
              <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                Latest Interview Problems
              </h2>

              {/* 描述 */}
              <p className="mt-3 max-w-2xl leading-7 text-gray-600">
                Practice coding and technical interview questions.
              </p>

            </div>

            {/* 查看全部 */}
            <Link
              href="/problem"
              className="shrink-0 font-medium text-blue-600 transition hover:text-blue-800"
            >
              View All Problems →
            </Link>

          </div>


          {/* Problem 卡片 */}
          <div className="mt-9 grid grid-cols-1 gap-5 sm:mt-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">

            {latestProblems.map((problem) => (
              <Link
                key={problem.id}
                href={`/problem/${problem.slug}`}
                className="group min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6"
              >

                {/* Problem 标签 */}
                <div className="flex flex-wrap items-center gap-2">

                  {/* Company */}
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {problem.company}
                  </span>

                  {/* Difficulty */}
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {problem.difficulty}
                  </span>

                </div>


                {/* Problem 标题 */}
                <h3 className="mt-5 break-words text-xl font-bold text-gray-900 transition group-hover:text-blue-600">
                  {problem.title}
                </h3>

                {/* Problem 描述 */}
                <p className="mt-3 line-clamp-3 break-words leading-7 text-gray-600">
                  {problem.description}
                </p>

                {/* Category */}
                <p className="mt-5 break-words text-sm font-medium text-gray-500">
                  {problem.category}
                </p>

              </Link>
            ))}

          </div>

        </div>

      </section>


      {/* Features */}
      <section className="bg-gray-50">

        {/* Features 内容 */}
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">

          {/* Section 标题 */}
          <div className="mx-auto max-w-3xl text-center">

            {/* 小标题 */}
            <p className="font-semibold text-blue-600">
              Why FastPrep
            </p>

            {/* 标题 */}
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to prepare
            </h2>

            {/* 描述 */}
            <p className="mt-4 leading-8 text-gray-600">
              Focus on practical interview preparation instead of wasting time
              searching across different resources.
            </p>

          </div>


          {/* Features 卡片 */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 md:grid-cols-3">

            {/* Problem Feature */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">

              {/* 编号 */}
              <p className="text-sm font-bold text-blue-600">
                01
              </p>

              {/* 标题 */}
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Interview Problems
              </h3>

              {/* 描述 */}
              <p className="mt-3 leading-7 text-gray-600">
                Practice coding, algorithms, data structures, and system design
                interview problems.
              </p>

            </div>


            {/* Experience Feature */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">

              {/* 编号 */}
              <p className="text-sm font-bold text-blue-600">
                02
              </p>

              {/* 标题 */}
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Interview Experiences
              </h3>

              {/* 描述 */}
              <p className="mt-3 leading-7 text-gray-600">
                Learn from interview processes, OA experiences, follow-ups,
                and practical preparation strategies.
              </p>

            </div>


            {/* Guides Feature */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">

              {/* 编号 */}
              <p className="text-sm font-bold text-blue-600">
                03
              </p>

              {/* 标题 */}
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Preparation Guides
              </h3>

              {/* 描述 */}
              <p className="mt-3 leading-7 text-gray-600">
                Review coding patterns, system design concepts, and interview
                communication strategies.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* Latest Blog */}
      <section className="bg-white">

        {/* Blog 内容 */}
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">

          {/* Section 顶部 */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            {/* 标题区域 */}
            <div>

              {/* 小标题 */}
              <p className="font-semibold text-blue-600">
                Learn
              </p>

              {/* 标题 */}
              <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                Latest Articles
              </h2>

              {/* 描述 */}
              <p className="mt-3 max-w-2xl leading-7 text-gray-600">
                Interview experiences, guides, and software engineering advice.
              </p>

            </div>

            {/* 查看 Blog */}
            <Link
              href="/blog"
              className="shrink-0 font-medium text-blue-600 transition hover:text-blue-800"
            >
              View All Articles →
            </Link>

          </div>


          {/* Blog 卡片 */}
          <div className="mt-9 grid grid-cols-1 gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-3">

            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7"
              >

                {/* Category */}
                <p className="break-words text-sm font-semibold text-blue-600">
                  {post.category}
                </p>

                {/* Blog 标题 */}
                <h3 className="mt-4 break-words text-xl font-bold leading-8 text-gray-900 transition group-hover:text-blue-600 sm:text-2xl">
                  {post.title}
                </h3>

                {/* Description */}
                <p className="mt-4 line-clamp-3 break-words leading-7 text-gray-600">
                  {post.description}
                </p>

                {/* Metadata */}
                <p className="mt-6 break-words text-sm text-gray-500">
                  {post.date} · {post.readingTime}
                </p>

              </Link>
            ))}

          </div>

        </div>

      </section>


      {/* Final CTA */}
      <section className="bg-gray-950">

        {/* CTA 内容 */}
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">

          {/* CTA 主体 */}
          <div className="mx-auto max-w-4xl text-center">

            {/* CTA 标题 */}
            <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Ready to start preparing?
            </h2>

            {/* CTA 描述 */}
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-gray-300 sm:text-lg">
              Start practicing interview problems and build a stronger
              preparation strategy today.
            </p>

            {/* CTA 按钮 */}
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">

              {/* Problem */}
              <Link
                href="/problem"
                className="rounded-xl bg-blue-600 px-6 py-3.5 text-center font-medium text-white transition hover:bg-blue-500"
              >
                Start Practicing
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                className="rounded-xl border border-gray-700 px-6 py-3.5 text-center font-medium text-white transition hover:border-gray-500 hover:bg-gray-900"
              >
                Contact Us
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}