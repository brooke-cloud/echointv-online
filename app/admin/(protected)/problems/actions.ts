// app/admin/(protected)/problems/actions.ts

"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/user-auth";
import { createUniqueProblemSlug } from "@/lib/slug";
import { getFormString } from "@/lib/validation";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

// 管理员权限校验
async function requireAdmin() {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("请先登录管理员账号");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  const isEmailAdmin =
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
  const isAdmin = user?.role === "ADMIN" || isEmailAdmin;

  if (!isAdmin) {
    throw new Error("无管理员操作权限");
  }
}

// 1. 创建 Problem
export async function createProblem(formData: FormData) {
  await requireAdmin();

  const title = getFormString(formData, "title", 200);
  const company = getFormString(formData, "company", 100);
  const role = getFormString(formData, "role", 100) || "Software Engineer"; // 🌟 选填
  const difficulty = getFormString(formData, "difficulty", 20) || "Medium";
  const stage = getFormString(formData, "stage", 20) || "VO";
  const category = getFormString(formData, "category", 100);
  const description = getFormString(formData, "description", 10000);
  const example = getFormString(formData, "example", 10000);
  const approach = getFormString(formData, "approach", 20000);
  const solution = getFormString(formData, "solution", 30000);
  const timeComplexity = getFormString(formData, "timeComplexity", 5000);
  const spaceComplexity = getFormString(formData, "spaceComplexity", 5000);
  const topicsValue = getFormString(formData, "topics", 1000);
  const similarProblems = getFormString(formData, "similarProblems", 2000) || "";

  const topics = topicsValue
    ? topicsValue.split(",").map((topic) => topic.trim()).filter(Boolean).slice(0, 30)
    : [];

  if (!title) {
    throw new Error("请填写题目标题 (Title)");
  }
  if (!company) {
    throw new Error("请填写目标公司 (Company)");
  }
  if (!category) {
    throw new Error("请填写题目分类 (Category)");
  }
  if (!description) {
    throw new Error("请填写题目描述 (Problem Description)");
  }

  const slug = await createUniqueProblemSlug(title);

  await prisma.problem.create({
    data: {
      slug,
      title,
      company,
      role,
      difficulty,
      stage,
      category,
      description,
      example,
      approach,
      solution,
      timeComplexity,
      spaceComplexity,
      topics,
      similarProblems,
    },
  });

  revalidatePath("/");
  revalidatePath("/problem");
  revalidatePath("/admin/problems");

  redirect("/admin/problems?success=created");
}

// 2. 更新 Problem
export async function updateProblem(problemId: number, formData: FormData) {
  await requireAdmin();

  const title = getFormString(formData, "title", 200);
  const company = getFormString(formData, "company", 100);
  const role = getFormString(formData, "role", 100) || "Software Engineer";
  const difficulty = getFormString(formData, "difficulty", 20) || "Medium";
  const stage = getFormString(formData, "stage", 20) || "VO";
  const category = getFormString(formData, "category", 100);
  const description = getFormString(formData, "description", 10000);
  const example = getFormString(formData, "example", 10000);
  const approach = getFormString(formData, "approach", 20000);
  const solution = getFormString(formData, "solution", 30000);
  const timeComplexity = getFormString(formData, "timeComplexity", 5000);
  const spaceComplexity = getFormString(formData, "spaceComplexity", 5000);
  const topicsValue = getFormString(formData, "topics", 1000);
  const similarProblems = getFormString(formData, "similarProblems", 2000) || "";

  const topics = topicsValue
    ? topicsValue.split(",").map((topic) => topic.trim()).filter(Boolean).slice(0, 30)
    : [];

  if (!title) throw new Error("请填写题目标题");
  if (!company) throw new Error("请填写目标公司");
  if (!category) throw new Error("请填写分类");
  if (!description) throw new Error("请填写题目描述");

  const existingProblem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!existingProblem) {
    throw new Error("题目不存在");
  }

  await prisma.problem.update({
    where: { id: problemId },
    data: {
      title,
      company,
      role,
      difficulty,
      stage,
      category,
      description,
      example,
      approach,
      solution,
      timeComplexity,
      spaceComplexity,
      topics,
      similarProblems,
    },
  });

  revalidatePath("/");
  revalidatePath("/problem");
  revalidatePath(`/problem/${existingProblem.slug}`);
  revalidatePath("/admin/problems");

  redirect("/admin/problems?success=updated");
}

// 3. 删除 Problem
export async function deleteProblem(problemId: number) {
  await requireAdmin();

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) {
    throw new Error("题目不存在");
  }

  await prisma.problem.delete({
    where: { id: problemId },
  });

  revalidatePath("/");
  revalidatePath("/problem");
  revalidatePath(`/problem/${problem.slug}`);
  revalidatePath("/admin/problems");
}