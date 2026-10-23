import ProblemList from "@/components/ProblemList";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { isDatabaseDisabled } from '@/lib/db-mode';
import { problems as fallbackProblems } from "@/data/problems";
import { retryAsync } from "@/lib/retry";
import { isPaywallEnabled } from "@/lib/site-settings";


export const metadata: Metadata = {
  title: "Coding Interview Problems",
  description:
    "Practice software engineering interview problems from top technology companies including coding, algorithms, data structures, and system design.",
  alternates: {
    canonical: "/problem",
  },
};

export default async function ProblemsPage() {
  const offlineProblems = fallbackProblems.map((problem) => ({
    ...problem,
    slug: problem.slug ?? String(problem.id),
  }));
  const problems = isDatabaseDisabled()
    ? offlineProblems
    : await retryAsync(() => prisma.problem.findMany({
        orderBy: { id: "asc" },
      })).catch(() => offlineProblems);
  const paywallEnabled = await isPaywallEnabled();

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 2xl:px-14">
        <section>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            Interview Question
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            Practice real software engineering interview questions, filterable by company, difficulty, and keywords.
          </p>
        </section>

        <section className="mt-10">
          <ProblemList problems={problems} paywallEnabled={paywallEnabled} />
        </section>
      </div>
    </main>
  );
}
