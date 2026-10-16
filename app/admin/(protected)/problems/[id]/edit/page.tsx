// app/admin/(protected)/problems/[id]/edit/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizeInterviewImportPayload } from "@/lib/interview-import-schema";
import StructuredProblemEditor from "./StructuredProblemEditor";


type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProblemPage({ params }: Props) {
  const { id } = await params;
  const problemId = Number(id);

  if (isNaN(problemId)) {
    notFound();
  }

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) {
    notFound();
  }

  const initial = normalizeInterviewImportPayload(problem);
  const edgeCasesMatch = initial.approach.algorithmSteps.match(/(?:^|\n\n)Edge Cases:\s*\n([\s\S]*)$/i);
  if (edgeCasesMatch) {
    initial.approach.algorithmSteps = initial.approach.algorithmSteps.slice(0, edgeCasesMatch.index).trim();
    initial.approach.edgeCases = edgeCasesMatch[1].trim();
  }

  return (
    <main className="bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/problems"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Problems
        </Link>

        <h1 className="mt-6 text-3xl font-black text-slate-950">
          Edit Interview Problem
        </h1>
        <div className="mt-8"><StructuredProblemEditor problemId={problem.id} initial={initial} legacyExample={problem.example || ""} similarProblems={problem.similarProblems || ""} /></div>
      </div>
    </main>
  );
}
