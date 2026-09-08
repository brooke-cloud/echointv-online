import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import PaywallCard from "@/components/PaywallCard";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import ExportPdfButton from "@/components/ExportPdfButton";
import {
  Calendar,
  Clock,
  Tag,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
type Props = {
  params: Promise<{ slug: string }>;
};
// 开启 ISR 增量静态再生
export async function generateStaticParams() {
  if (process.env.SKIP_DATABASE === "true") {
    return [];
  }
  const posts = await prisma.post.findMany({
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}
// 动态生成博客详情页 SEO 元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
  });
  if (!post) {
    return {
      title: "文章未找到 | Echo INTV",
    };
  }
  const title = `${post.title} - 面试经验与求职攻略`;
  const description = post.description
    ? post.description.slice(0, 160).replace(/\n/g, " ")
    : `阅读关于 ${post.title} 的深入解析与求职经验。`;
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
// 自动计算阅读时长工具函数
const getReadingTime = (content: string, customTime?: string | null) => {
  if (customTime) return customTime;
  if (!content) return "3 min read";
  const words = content.trim().length;
  const minutes = Math.max(1, Math.ceil(words / 400));
  return `${minutes} min read`;
};
export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
  });
  if (!post) {
    notFound();
  }
  // 会员权限校验
  const freePosts = await prisma.post.findMany({
    take: 5,
    orderBy: { id: "asc" },
    select: { id: true },
  });
  const isFree = freePosts.some((p) => p.id === post.id);
  const session = await getCurrentUser();
  let isMember = false;
  const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });
    const isEmailAdmin =
      session.email &&
      ADMIN_EMAILS.includes(session.email.toLowerCase().trim());
    isMember =
      isEmailAdmin || user?.role === "PRO" || user?.role === "ADMIN";
  }
  const isAdmin =
    Boolean(
      session?.email &&
        ADMIN_EMAILS.includes(session.email.toLowerCase().trim())
    ) ||
    false;
  let isRoleAdmin = false;
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { role: true },
    });
    isRoleAdmin = user?.role === "ADMIN";
  }
  const canExportPdf = isAdmin || isRoleAdmin;
  const canAccess = isFree || isMember;
  // 并行查询上一篇、下一篇与相关推荐文章
  const [prevPost, nextPost, relatedPosts] = await Promise.all([
    prisma.post.findFirst({
      where: { createdAt: { lt: post.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true },
    }),
    prisma.post.findFirst({
      where: { createdAt: { gt: post.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { slug: true, title: true },
    }),
    prisma.post.findMany({
      where: {
        id: { not: post.id },
        category: post.category,
      },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        date: true,
        readingTime: true,
      },
    }),
  ]);
  const readingTimeText = getReadingTime(
    post.content || "",
    post.readingTime
  );
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4;
                margin: 16mm 14mm;
              }
              html,
              body {
                background: #ffffff !important;
              }
              body * {
                visibility: hidden !important;
              }
              #pdf-content,
              #pdf-content * {
                visibility: visible !important;
              }
              #pdf-content {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                background: #ffffff !important;
              }
              #pdf-content .print-hidden {
                display: none !important;
              }
              #pdf-content pre {
                white-space: pre-wrap !important;
                overflow-wrap: break-word !important;
                page-break-inside: avoid !important;
              }
              #pdf-content table {
                width: 100% !important;
                border-collapse: collapse !important;
                page-break-inside: auto !important;
              }
              #pdf-content tr {
                page-break-inside: avoid !important;
                page-break-after: auto !important;
              }
              #pdf-content img {
                max-width: 100% !important;
                page-break-inside: avoid !important;
              }
              #pdf-content blockquote {
                page-break-inside: avoid !important;
              }
              #pdf-content h1,
              #pdf-content h2,
              #pdf-content h3,
              #pdf-content h4 {
                page-break-after: avoid !important;
              }
              #pdf-content p,
              #pdf-content li {
                orphans: 3;
                widows: 3;
              }
              #pdf-content a {
                color: inherit !important;
                text-decoration: none !important;
              }
            }
          `,
        }}
      />
      <div className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-blue-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              返回全部文章
            </Link>
            <div className="flex items-center gap-3">
              {canExportPdf && <ExportPdfButton title={post.title} />}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link
                  href="/blog"
                  className="hover:text-blue-600 transition"
                >
                  面试经验与攻略
                </Link>
                <span>/</span>
                <span className="max-w-[180px] truncate font-medium text-gray-700 sm:max-w-xs">
                  {post.title}
                </span>
              </div>
            </div>
          </div>
          <article
            id="pdf-content"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10"
          >
            <header className="border-b border-gray-100 pb-8">
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                  <Tag className="h-3 w-3" />
                  {post.category || "经验分享"}
                </span>
                {post.date && (
                  <span className="inline-flex items-center gap-1 text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.date}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  {readingTimeText}
                </span>
              </div>
              <h1 className="mt-4 text-2xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                {post.title}
              </h1>
              {post.description && (
                <div className="mt-5 rounded-2xl border border-blue-100/80 bg-blue-50/40 p-5 text-base leading-relaxed text-gray-700 shadow-inner">
                  <MarkdownRenderer content={post.description} />
                </div>
              )}
            </header>
            {canAccess ? (
              <div className="mt-8">
                <MarkdownRenderer content={post.content || ""} />
              </div>
            ) : (
              <div className="relative mt-8 print:hidden">
                <div className="pointer-events-none space-y-4 select-none opacity-30 blur-sm">
                  <p className="text-gray-300">
                    这是一段关于大厂面试的核心解析内容，包含具体的系统架构方案、算法 Trade-offs
                    分析以及独家 BQ 提分答题策略...
                  </p>
                  <div className="h-32 rounded-xl bg-gray-100" />
                </div>
                <PaywallCard isLoggedIn={Boolean(session)} />
              </div>
            )}
            {canAccess && (
              <div className="mt-12 border-t border-gray-200 pt-6 print:hidden">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {prevPost ? (
                    <Link
                      href={`/blog/${prevPost.slug}`}
                      className="group flex flex-1 items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
                      <div className="text-left">
                        <span className="block text-xs text-gray-400">
                          上一篇
                        </span>
                        <span className="line-clamp-1 text-sm font-medium text-gray-800 group-hover:text-blue-600">
                          {prevPost.title}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}
                  {nextPost && (
                    <Link
                      href={`/blog/${nextPost.slug}`}
                      className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-gray-200 p-4 text-right transition hover:border-blue-300 hover:bg-blue-50/30"
                    >
                      <div>
                        <span className="block text-xs text-gray-400">
                          下一篇
                        </span>
                        <span className="line-clamp-1 text-sm font-medium text-gray-800 group-hover:text-blue-600">
                          {nextPost.title}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
                    </Link>
                  )}
                </div>
              </div>
            )}
            {canAccess && (
              <div className="mt-8 flex justify-center border-t border-gray-100 pt-6 print:hidden">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  返回全部面试经验列表
                </Link>
              </div>
            )}
          </article>
          {relatedPosts.length > 0 && (
            <div className="mt-14 print:hidden">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  相关求职面经与攻略推荐
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {relatedPosts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                        <span className="font-semibold text-blue-600">
                          {item.category || "经验分享"}
                        </span>
                        <span>{item.readingTime || "5 min read"}</span>
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-base font-bold text-gray-900 group-hover:text-blue-600">
                        {item.title}
                      </h3>
                      {item.description && (
                        <div className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
                          <MarkdownRenderer content={item.description} />
                        </div>
                      )}
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-400">
                      <span>{item.date || "近期发布"}</span>
                      <span className="inline-flex items-center gap-1 font-medium text-blue-600 group-hover:underline">
                        阅读全文 <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}