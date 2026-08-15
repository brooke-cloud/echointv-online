
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MarkdownRenderer from "@/components/MarkdownRenderer";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// 生成 Blog SEO Metadata
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: {
      slug,
    },
  });

  if (!post) {
    return {
      title: "Post Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: post.title,

    description: post.description,

    alternates: {
      canonical: `/blog/${post.slug}`,
    },

    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      siteName: "FastPrep",
    },

    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

// Blog 详情页面
export default async function BlogPostPage({
  params,
}: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: {
      slug,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <main className="bg-white py-12 sm:py-16">

      {/* Blog 内容容器 */}
      <article className="mx-auto max-w-4xl px-5 sm:px-6">

        {/* 返回 Blog */}
        <Link
          href="/blog"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Blog
        </Link>

        {/* Blog Header */}
        <header className="mt-8 border-b border-gray-200 pb-8 sm:mt-10 sm:pb-10">

          {/* Blog Category */}
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            {post.category}
          </p>

          {/* Blog Title */}
          <h1 className="mt-4 break-words text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          {/* Blog Description */}
          <p className="mt-6 break-words text-lg leading-8 text-gray-600 sm:text-xl">
            {post.description}
          </p>

          {/* Blog Metadata */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">

            {/* 发布日期 */}
            <span>
              {post.date}
            </span>

            {/* 分隔符 */}
            <span>
              ·
            </span>

            {/* 阅读时间 */}
            <span>
              {post.readingTime}
            </span>

          </div>

        </header>

        {/* Blog Markdown 正文 */}
        <section className="mt-8 min-w-0 sm:mt-10">

          {/* Markdown Renderer */}
          <MarkdownRenderer
            content={post.content}
          />

        </section>

        {/* Blog 底部 */}
        <footer className="mt-12 border-t border-gray-200 pt-8 sm:mt-16">

          {/* 返回 Blog */}
          <Link
            href="/blog"
            className="font-medium text-blue-600 transition hover:text-blue-800"
          >
            ← Back to all articles
          </Link>

        </footer>

      </article>

    </main>
  );
}