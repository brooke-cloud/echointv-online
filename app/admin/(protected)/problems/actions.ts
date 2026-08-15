"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  requireAdmin,
} from "@/lib/auth";

import {
  createUniqueProblemSlug,
} from "@/lib/slug";

import {
  getFormString,
} from "@/lib/validation";


// 创建 Problem
export async function createProblem(
  formData: FormData
) {
  await requireAdmin();

  const title =
    getFormString(
      formData,
      "title",
      200
    );

  const company =
    getFormString(
      formData,
      "company",
      100
    );

  const role =
    getFormString(
      formData,
      "role",
      100
    );

  const difficulty =
    getFormString(
      formData,
      "difficulty",
      20
    );

  const category =
    getFormString(
      formData,
      "category",
      100
    );

  const description =
    getFormString(
      formData,
      "description",
      5000
    );

  const example =
    getFormString(
      formData,
      "example",
      10000
    );

  const approach =
    getFormString(
      formData,
      "approach",
      10000
    );

  const solution =
    getFormString(
      formData,
      "solution",
      30000
    );

  const timeComplexity =
    getFormString(
      formData,
      "timeComplexity",
      100
    );

  const spaceComplexity =
    getFormString(
      formData,
      "spaceComplexity",
      100
    );

  const topicsValue =
    getFormString(
      formData,
      "topics",
      1000
    );

  const topics =
    topicsValue
      .split(",")
      .map((topic) =>
        topic.trim()
      )
      .filter(Boolean)
      .slice(0, 30);


  const validDifficulties = [
    "Easy",
    "Medium",
    "Hard",
  ];

  if (
    !validDifficulties.includes(
      difficulty
    )
  ) {
    throw new Error(
      "Invalid difficulty."
    );
  }


  if (
    !title ||
    !company ||
    !role ||
    !category ||
    !description
  ) {
    throw new Error(
      "Required problem fields are missing."
    );
  }


  const slug =
    await createUniqueProblemSlug(
      title
    );


  await prisma.problem.create({
    data: {
      slug,
      title,
      company,
      role,
      difficulty,
      category,
      description,
      example,
      approach,
      solution,
      timeComplexity,
      spaceComplexity,
      topics,
    },
  });


  revalidatePath(
    "/problem"
  );

  revalidatePath(
    "/admin/problems"
  );


  redirect(
    "/admin/problems?success=created"
  );
}


// 更新 Problem
export async function updateProblem(
  problemId: number,
  formData: FormData
) {
  await requireAdmin();

  const title =
    getFormString(
      formData,
      "title",
      200
    );

  const company =
    getFormString(
      formData,
      "company",
      100
    );

  const role =
    getFormString(
      formData,
      "role",
      100
    );

  const difficulty =
    getFormString(
      formData,
      "difficulty",
      20
    );

  const category =
    getFormString(
      formData,
      "category",
      100
    );

  const description =
    getFormString(
      formData,
      "description",
      5000
    );

  const example =
    getFormString(
      formData,
      "example",
      10000
    );

  const approach =
    getFormString(
      formData,
      "approach",
      10000
    );

  const solution =
    getFormString(
      formData,
      "solution",
      30000
    );

  const timeComplexity =
    getFormString(
      formData,
      "timeComplexity",
      100
    );

  const spaceComplexity =
    getFormString(
      formData,
      "spaceComplexity",
      100
    );

  const topicsValue =
    getFormString(
      formData,
      "topics",
      1000
    );

  const topics =
    topicsValue
      .split(",")
      .map((topic) =>
        topic.trim()
      )
      .filter(Boolean)
      .slice(0, 30);


  const validDifficulties = [
    "Easy",
    "Medium",
    "Hard",
  ];

  if (
    !validDifficulties.includes(
      difficulty
    )
  ) {
    throw new Error(
      "Invalid difficulty."
    );
  }


  const existingProblem =
    await prisma.problem.findUnique({
      where: {
        id: problemId,
      },
    });

  if (!existingProblem) {
    throw new Error(
      "Problem not found."
    );
  }


  await prisma.problem.update({
    where: {
      id: problemId,
    },

    data: {
      title,
      company,
      role,
      difficulty,
      category,
      description,
      example,
      approach,
      solution,
      timeComplexity,
      spaceComplexity,
      topics,
    },
  });


  revalidatePath(
    "/problem"
  );

  revalidatePath(
    `/problem/${existingProblem.slug}`
  );

  revalidatePath(
    "/admin/problems"
  );


  redirect(
    "/admin/problems?success=updated"
  );
}


// 删除 Problem
export async function deleteProblem(
  problemId: number
) {
  await requireAdmin();

  const problem =
    await prisma.problem.findUnique({
      where: {
        id: problemId,
      },
    });

  if (!problem) {
    throw new Error(
      "Problem not found."
    );
  }


  await prisma.problem.delete({
    where: {
      id: problemId,
    },
  });


  revalidatePath(
    "/problem"
  );

  revalidatePath(
    `/problem/${problem.slug}`
  );

  revalidatePath(
    "/admin/problems"
  );
}