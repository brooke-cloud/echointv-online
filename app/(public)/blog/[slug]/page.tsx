// app/(public)/blog/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import PaywallCard from "@/components/PaywallCard";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

// ⚡ 1. 开启 ISR 增量静态刷新与动态路由放行
export const revalidate = 60;
export const dynamicParams = true; // 🌟 核心：允许动态访问后台新创建的文章

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: { slug: true },
  });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const post = await prisma.post.findFirst({
    where: {
      OR: [{ slug }, { slug: decodedSlug }],
    },
  });

  if (!post) {
    return {
      title: "文章未找到 | Echo INTV",
    };
  }

  const title = `${post.title} - 大厂面试经验与求职攻略`;
  const description = post.description
    ? post.description.slice(0, 150).replace(/\n/g, " ") + "..."
    : `阅读 ${post.title}，获取关于 ${post.category} 的深度大厂求职经验与技术拆解。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // 🌟 核心修复：支持解码后的 Slug 查询
  const post = await prisma.post.findFirst({
    where: {
      OR: [{ slug }, { slug: decodedSlug }],
    },
  });

  if (!post) {
    notFound();
  }

  // 前 6 篇文章免费
  const freePosts = await prisma.post.findMany({
    take: 6,
    orderBy: { id: "asc" },
    select: { id: true },
  });

  const isFree =
    typeof (post as any).isFree === "boolean"
      ? (post as any).isFree
      : freePosts.some((p) => p.id === post.id);

  const session = await getCurrentUser();
  let isMember = false;

  const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    const isEmailAdmin =
      session.email && ADMIN_EMAILS.includes(session.email.toLowerCase().trim());
    isMember =
      isEmailAdmin ||
      user?.role === "PRO" ||
      user?.role === "ADMIN" ||
      Boolean((user as any)?.isVip);
  }

  const canAccess = isFree || isMember;

  const [prevPost, nextPost, relatedPosts] = await Promise.all([
    prisma.post.findFirst({
      where: { createdAt: { lt: post.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true, category: true },
    }),
    prisma.post.findFirst({
      where: { createdAt: { gt: post.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { slug: true, title: true, category: true },
    }),
    prisma.post.findMany({
      where: {
        id: { not: post.id },
        category: post.category,
      },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        date: true,
        readingTime: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-blue-600 hover:border-gray-300 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>返回面试经验</span>
          </Link>
        </div>

        {/* 文章主卡片 */}
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
          
          {/* 文章头部信息 */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                <BookOpen className="h-3.5 w-3.5" />
                {post.category}
              </span>

              <span
                className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                  isFree
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {isFree ? "Free (免费文章)" : "Paid (VIP专享)"}
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Calendar className="h-3 w-3" />
                {post.date}
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Clock className="h-3 w-3" />
                {post.readingTime}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-4xl tracking-tight leading-tight">
              {post.title}
            </h1>

            {post.description && (
              <p className="mt-3 text-base text-gray-600 leading-relaxed">
                {post.description}
              </p>
            )}
          </div>

          {/* 权限控制区 */}
          {canAccess ? (
            <div className="mt-8 text-gray-800 leading-relaxed">
              <MarkdownRenderer content={post.content || ""} />
            </div>
          ) : (
            <div className="relative mt-8">
              <div className="filter blur-xs select-none pointer-events-none opacity-40 space-y-4">
                <p className="text-gray-600">
                  {post.description || "本篇深度复盘包含了完整的技术方案推导、踩坑总结与面试官提问追问..."}
                </p>
                <div className="h-28 bg-gray-100 rounded-xl" />
                <div className="h-44 bg-gray-900 rounded-xl" />
              </div>

              <PaywallCard isLoggedIn={Boolean(session)} />
            </div>
          )}

          {/* 上一篇 / 下一篇 导航 */}
          <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="group flex flex-1 items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
                <div className="text-left">
                  <span className="block text-xs text-gray-400">上一篇</span>
                  <span className="line-clamp-1 text-sm font-medium text-gray-800 group-hover:text-blue-600">
                    {prevPost.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex-1"></div>
            )}

            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30 text-right"
              >
                <div>
                  <span className="block text-xs text-gray-400">下一篇</span>
                  <span className="line-clamp-1 text-sm font-medium text-gray-800 group-hover:text-blue-600">
                    {nextPost.title}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
              </Link>
            )}
          </div>

        </div>

        {/* 相关面经推荐 */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">
                相关求职专栏推荐
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {relatedPosts.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-md"
                >
                  <div>
                    <span className="text-xs font-semibold text-blue-600">
                      {item.category}
                    </span>
                    <h3 className="mt-2.5 line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-blue-600">
                      {item.title}
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-400">
                    <span>{item.date}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-blue-600 group-hover:underline">
                      阅读 <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}