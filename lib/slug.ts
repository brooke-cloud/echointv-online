import { prisma } from "@/lib/prisma";

// 把普通文本转换成 Slug
export function createSlug(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


// 为 Problem 创建唯一 Slug
export async function createUniqueProblemSlug(
  title: string
) {
  const baseSlug =
    createSlug(title) || "problem";

  let slug = baseSlug;
  let counter = 2;

  while (
    await prisma.problem.findUnique({
      where: {
        slug,
      },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}


// 为 Blog 创建唯一 Slug
export async function createUniquePostSlug(
  title: string
) {
  const baseSlug =
    createSlug(title) || "post";

  let slug = baseSlug;
  let counter = 2;

  while (
    await prisma.post.findUnique({
      where: {
        slug,
      },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}