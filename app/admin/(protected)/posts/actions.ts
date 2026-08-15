"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  requireAdmin,
} from "@/lib/auth";

import {
  createUniquePostSlug,
} from "@/lib/slug";

import {
  getFormString,
} from "@/lib/validation";


// 创建 Blog
export async function createPost(
  formData: FormData
) {
  await requireAdmin();

  const title =
    getFormString(
      formData,
      "title",
      200
    );

  const description =
    getFormString(
      formData,
      "description",
      500
    );

  const content =
    getFormString(
      formData,
      "content",
      100000
    );

  const category =
    getFormString(
      formData,
      "category",
      100
    );

  const date =
    getFormString(
      formData,
      "date",
      50
    );

  const readingTime =
    getFormString(
      formData,
      "readingTime",
      50
    );


  if (
    !title ||
    !description ||
    !content ||
    !category ||
    !date ||
    !readingTime
  ) {
    throw new Error(
      "Required Blog fields are missing."
    );
  }


  const slug =
    await createUniquePostSlug(
      title
    );


  await prisma.post.create({
    data: {
      title,
      slug,
      description,
      content,
      category,
      date,
      readingTime,
    },
  });


  revalidatePath(
    "/blog"
  );

  revalidatePath(
    "/admin/posts"
  );


  redirect(
    "/admin/posts?success=created"
  );
}


// 更新 Blog
export async function updatePost(
  postId: number,
  formData: FormData
) {
  await requireAdmin();

  const title =
    getFormString(
      formData,
      "title",
      200
    );

  const description =
    getFormString(
      formData,
      "description",
      500
    );

  const content =
    getFormString(
      formData,
      "content",
      100000
    );

  const category =
    getFormString(
      formData,
      "category",
      100
    );

  const date =
    getFormString(
      formData,
      "date",
      50
    );

  const readingTime =
    getFormString(
      formData,
      "readingTime",
      50
    );


  if (
    !title ||
    !description ||
    !content ||
    !category ||
    !date ||
    !readingTime
  ) {
    throw new Error(
      "Required Blog fields are missing."
    );
  }


  const existingPost =
    await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

  if (!existingPost) {
    throw new Error(
      "Blog post not found."
    );
  }


  await prisma.post.update({
    where: {
      id: postId,
    },

    data: {
      title,
      description,
      content,
      category,
      date,
      readingTime,
    },
  });


  revalidatePath(
    "/blog"
  );

  revalidatePath(
    `/blog/${existingPost.slug}`
  );

  revalidatePath(
    "/admin/posts"
  );


  redirect(
    "/admin/posts?success=updated"
  );
}


// 删除 Blog
export async function deletePost(
  postId: number
) {
  await requireAdmin();

  const post =
    await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

  if (!post) {
    throw new Error(
      "Blog post not found."
    );
  }


  await prisma.post.delete({
    where: {
      id: postId,
    },
  });


  revalidatePath(
    "/blog"
  );

  revalidatePath(
    `/blog/${post.slug}`
  );

  revalidatePath(
    "/admin/posts"
  );
}