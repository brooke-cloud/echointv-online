import {prisma} from "@/lib/prisma";

/**
 * 将标题/文本转换为 URL 友好的 slug
 */
export function createSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // 空格替换为 -
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "") // 保留英文字符、数字和中文
    .replace(/--+/g, "-") // 多个连字符合并为一个
    .replace(/^-+/, "") // 去除开头的 -
    .replace(/-+$/, ""); // 去除结尾的 -
}

/**
 * 生成唯一的题目 Slug（避免重复）
 */
export async function createUniqueProblemSlug(
  title: string,
  currentId?: number | string
): Promise<string> {
  const baseSlug = createSlug(title) || "problem";
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existing = await prisma.problem.findFirst({
      where: {
        slug,
        ...(currentId ? { NOT: { id: currentId as any } } : {}),
      },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${count}`;
    count++;
  }
}

/**
 * 生成唯一的文章/经验贴 Slug（避免重复）
 */
export async function createUniquePostSlug(
  title: string,
  currentId?: number | string
): Promise<string> {
  const baseSlug = createSlug(title) || "post";
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existing = await prisma.post.findFirst({
      where: {
        slug,
        ...(currentId ? { NOT: { id: currentId as any } } : {}),
      },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${count}`;
    count++;
  }
}