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

// 1. 创建 Problem（包含 stage）
export async function createProblem(formData: FormData) {
  await requireAdmin();

  const title = getFormString(formData, "title", 200);
  const company = getFormString(formData, "company", 100);
  const role = getFormString(formData, "role", 100);
  const difficulty = getFormString(formData, "difficulty", 20);
  const stage = getFormString(formData, "stage", 20) || "VO"; // 🌟 接收 stage
  const category = getFormString(formData, "category", 100);
  const description = getFormString(formData, "description", 5000);
  const example = getFormString(formData, "example", 10000);
  const approach = getFormString(formData, "approach", 10000);
  const solution = getFormString(formData, "solution", 30000);
  const timeComplexity = getFormString(formData, "timeComplexity", 100);
  const spaceComplexity = getFormString(formData, "spaceComplexity", 100);
  const topicsValue = getFormString(formData, "topics", 1000);

  const topics = topicsValue
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean)
    .slice(0, 30);

  const validDifficulties = ["Easy", "Medium", "Hard"];
  if (!validDifficulties.includes(difficulty)) {
    throw new Error("Invalid difficulty.");
  }

  if (!title || !company || !role || !category || !description) {
    throw new Error("Required problem fields are missing.");
  }

  const slug = await createUniqueProblemSlug(title);

  await prisma.problem.create({
    data: {
      slug,
      title,
      company,
      role,
      difficulty,
      stage, // 🌟 保存 stage 到数据库
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

  revalidatePath("/");
  revalidatePath("/problem");
  revalidatePath("/admin/problems");

  redirect("/admin/problems?success=created");
}

// 2. 更新 Problem（🌟 核心修复：把 stage 保存进数据库！）
export async function updateProblem(problemId: number, formData: FormData) {
  await requireAdmin();

  const title = getFormString(formData, "title", 200);
  const company = getFormString(formData, "company", 100);
  const role = getFormString(formData, "role", 100);
  const difficulty = getFormString(formData, "difficulty", 20);
  const stage = getFormString(formData, "stage", 20) || "VO"; // 🌟 提取 stage
  const category = getFormString(formData, "category", 100);
  const description = getFormString(formData, "description", 5000);
  const example = getFormString(formData, "example", 10000);
  const approach = getFormString(formData, "approach", 10000);
  const solution = getFormString(formData, "solution", 30000);
  const timeComplexity = getFormString(formData, "timeComplexity", 100);
  const spaceComplexity = getFormString(formData, "spaceComplexity", 100);
  const topicsValue = getFormString(formData, "topics", 1000);

  const topics = topicsValue
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean)
    .slice(0, 30);

  const validDifficulties = ["Easy", "Medium", "Hard"];
  if (!validDifficulties.includes(difficulty)) {
    throw new Error("Invalid difficulty.");
  }

  const existingProblem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!existingProblem) {
    throw new Error("Problem not found.");
  }

  // 🌟 将 stage 真正更新入库
  await prisma.problem.update({
    where: { id: problemId },
    data: {
      title,
      company,
      role,
      difficulty,
      stage, // 👈 这一行将 stage 真正存进数据库！
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
    throw new Error("Problem not found.");
  }

  await prisma.problem.delete({
    where: { id: problemId },
  });

  revalidatePath("/");
  revalidatePath("/problem");
  revalidatePath(`/problem/${problem.slug}`);
  revalidatePath("/admin/problems");
}