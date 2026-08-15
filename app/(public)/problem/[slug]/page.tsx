

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type ProblemPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// 生成 Problem SEO Metadata
export async function generateMetadata({
  params,
}: ProblemPageProps): Promise<Metadata> {
  const { slug } = await params;

  const problem = await prisma.problem.findUnique({
    where: {
      slug,
    },
  });

  if (!problem) {
    return {
      title: "Problem Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${problem.title} - ${problem.company}`,

    description: problem.description,

    alternates: {
      canonical: `/problem/${problem.slug}`,
    },

    openGraph: {
      type: "article",
      title: `${problem.title} - ${problem.company}`,
      description: problem.description,
      url: `/problem/${problem.slug}`,
      siteName: "FastPrep",
    },

    twitter: {
      card: "summary_large_image",
      title: `${problem.title} - ${problem.company}`,
      description: problem.description,
    },
  };
}

// Problem 详情页面
export default async function ProblemPage({
  params,
}: ProblemPageProps) {
  const { slug } = await params;

  const problem = await prisma.problem.findUnique({
    where: {
      slug,
    },
  });

  if (!problem) {
    notFound();
  }

  return (
    <main className="bg-white py-12 sm:py-16">

      {/* Problem 页面内容 */}
      <article className="mx-auto max-w-4xl px-5 sm:px-6">

        {/* 返回题库 */}
        <Link
          href="/problem"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Problems
        </Link>

        {/* Problem Header */}
        <header className="mt-8 border-b border-gray-200 pb-8 sm:mt-10 sm:pb-10">

          {/* Problem 信息 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">

            {/* Company */}
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {problem.company}
            </span>

            {/* Difficulty */}
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {problem.difficulty}
            </span>

            {/* Category */}
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {problem.category}
            </span>

          </div>

          {/* Problem 标题 */}
          <h1 className="mt-6 break-words text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl">
            {problem.title}
          </h1>

          {/* Role */}
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            {problem.role}
          </p>

        </header>

        {/* Problem Description */}
        <section className="mt-8 sm:mt-10">

          {/* Section 标题 */}
          <h2 className="text-2xl font-bold text-gray-900">
            Problem
          </h2>

          {/* Problem 内容 */}
          <p className="mt-4 whitespace-pre-wrap break-words leading-8 text-gray-700">
            {problem.description}
          </p>

        </section>

        {/* Example */}
        <section className="mt-8 sm:mt-10">

          {/* Section 标题 */}
          <h2 className="text-2xl font-bold text-gray-900">
            Example
          </h2>

          {/* Example 内容 */}
          <pre className="mt-4 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-gray-950 p-4 text-sm leading-7 text-gray-100 sm:p-6">
            {problem.example}
          </pre>

        </section>

        {/* Approach */}
        <section className="mt-8 sm:mt-10">

          {/* Section 标题 */}
          <h2 className="text-2xl font-bold text-gray-900">
            Approach
          </h2>

          {/* Approach 内容 */}
          <p className="mt-4 whitespace-pre-wrap break-words leading-8 text-gray-700">
            {problem.approach}
          </p>

        </section>

        {/* Complexity */}
        <section className="mt-8 sm:mt-10">

          {/* Section 标题 */}
          <h2 className="text-2xl font-bold text-gray-900">
            Complexity
          </h2>

          {/* Complexity 信息 */}
          <div className="mt-4 space-y-3 text-gray-700">

            {/* Time Complexity */}
            <p>
              <span className="font-semibold text-gray-900">
                Time:
              </span>{" "}
              {problem.timeComplexity}
            </p>

            {/* Space Complexity */}
            <p>
              <span className="font-semibold text-gray-900">
                Space:
              </span>{" "}
              {problem.spaceComplexity}
            </p>

          </div>

        </section>

        {/* Solution */}
        <section className="mt-8 sm:mt-10">

          {/* Section 标题 */}
          <h2 className="text-2xl font-bold text-gray-900">
            Solution
          </h2>

          {/* Solution 内容 */}
          <pre className="mt-4 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-gray-950 p-4 text-sm leading-7 text-gray-100 sm:p-6">
            {problem.solution}
          </pre>

        </section>

        {/* Related Topics */}
        <section className="mt-8 sm:mt-10">

          {/* Section 标题 */}
          <h2 className="text-2xl font-bold text-gray-900">
            Related Topics
          </h2>

          {/* Topic 列表 */}
          <div className="mt-4 flex flex-wrap gap-3">

            {problem.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700"
              >
                {topic}
              </span>
            ))}

          </div>

        </section>

        {/* 页面底部 */}
        <footer className="mt-12 border-t border-gray-200 pt-8 sm:mt-16">

          {/* 返回题库 */}
          <Link
            href="/problem"
            className="font-medium text-blue-600 transition hover:text-blue-800"
          >
            ← Back to all problems
          </Link>

        </footer>

      </article>

    </main>
  );
}