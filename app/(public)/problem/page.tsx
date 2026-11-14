import ProblemList from "@/components/ProblemList";
import type { Metadata } from "next";
import { isDatabaseDisabled } from '@/lib/db-mode';
import { problems as fallbackProblems } from "@/data/problems";
import problemCatalogSnapshot from "@/data/problem-catalog.snapshot.json";
import { isPaywallEnabled } from "@/lib/site-settings";
import { loadProblemCatalog } from "@/lib/problem-catalog";
import type { ProblemCatalogItem } from "@/lib/problem-catalog";


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
  const catalogSnapshot = problemCatalogSnapshot as ProblemCatalogItem[];
  const [problemResult, paywallEnabled] = await Promise.all([
    isDatabaseDisabled()
      ? Promise.resolve({ problems: offlineProblems, databaseUnavailable: false })
      : process.env.NODE_ENV !== "production"
        ? Promise.resolve({ problems: catalogSnapshot, databaseUnavailable: false })
      : loadProblemCatalog()
          .then((problems) => ({ problems, databaseUnavailable: false }))
          .catch((error) => {
            console.error("Unable to load the problem catalog.", error);
            return { problems: catalogSnapshot, databaseUnavailable: true };
          }),
    isPaywallEnabled(),
  ]);
  const { problems, databaseUnavailable } = problemResult;

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
          {databaseUnavailable && (
            <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              Live updates are temporarily unavailable. Showing the latest synchronized problem catalog.
            </div>
          )}
          <ProblemList problems={problems} paywallEnabled={paywallEnabled} />
        </section>
      </div>
    </main>
  );
}
