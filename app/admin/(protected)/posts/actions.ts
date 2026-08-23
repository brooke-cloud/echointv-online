// app/admin/(protected)/posts/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

async function verifyAdmin() {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("未登录");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  const isEmailAdmin =
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
  const isAdmin = user?.role === "ADMIN" || isEmailAdmin;

  if (!isAdmin) {
    throw new Error("无管理员权限");
  }

  return user;
}

// 1. 创建文章
export async function createPost(formData: FormData) {
  await verifyAdmin();

  const title = (formData.get("title") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";
  const content = (formData.get("content") as string) || "";
  const category = (formData.get("category") as string)?.trim() || "Career";
  const readingTime = (formData.get("readingTime") as string)?.trim() || "5 min read";
  const date =
    (formData.get("date") as string)?.trim() ||
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (!title) {
    throw new Error("文章标题不能为空");
  }

  if (!slug) {
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");
    slug = generatedSlug || `post-${Date.now()}`;
  }

  let finalSlug = slug;
  const existingPost = await prisma.post.findUnique({
    where: { slug: finalSlug },
  });
  if (existingPost) {
    finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  await prisma.post.create({
    data: {
      title,
      slug: finalSlug,
      description,
      content,
      category,
      readingTime,
      date,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin/posts");

  redirect("/admin/posts");
}

// 2. 更新文章
export async function updatePost(postId: number, formData: FormData) {
  await verifyAdmin();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";
  const content = (formData.get("content") as string) || "";
  const category = (formData.get("category") as string)?.trim() || "Career";
  const readingTime = (formData.get("readingTime") as string)?.trim() || "5 min read";
  const date = (formData.get("date") as string)?.trim();

  if (!postId) {
    throw new Error("无效的文章 ID");
  }

  if (!title) {
    throw new Error("文章标题不能为空");
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      description,
      content,
      category,
      readingTime,
      ...(date ? { date } : {}),
    },
  });

  const updatedPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  revalidatePath("/blog");
  if (updatedPost?.slug) {
    revalidatePath(`/blog/${updatedPost.slug}`);
  }
  revalidatePath("/");
  revalidatePath("/admin/posts");

  redirect("/admin/posts");
}

// 3. 删除文章
export async function deletePost(postId: number) {
  await verifyAdmin();

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("文章不存在");
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/posts");

  return { success: true };
}