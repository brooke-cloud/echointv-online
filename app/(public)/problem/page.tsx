import ProblemList from "@/components/ProblemList";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coding Interview Problems",
  description:
    "Practice software engineering interview problems from top technology companies including coding, algorithms, data structures, and system design.",
  alternates: {
    canonical: "/problem",
  },
};

export default async function ProblemsPage() {
  const problems = await prisma.problem.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <section>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            面试真题
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            整理真实软件工程师面试题，可以按照公司、难度和关键词进行筛选。
          </p>
        </section>

        <section className="mt-10">
          <ProblemList problems={problems} />
        </section>
      </div>
    </main>
  );
}