// components/MarkdownRenderer.tsx

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import CopyButton from "./CopyButton";
// 引入经典优雅的暗色代码高亮主题
import "highlight.js/styles/github-dark.css";

type MarkdownRendererProps = {
  content: string;
};

// 🌟 精准清洗：修复反引号符号，合并多余空行
function normalizeMarkdown(text: string): string {
  if (!text) return "";

  let cleaned = text.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/｀/g, "`");
  cleaned = cleaned.replace(/`([^`\n]+?)[''’](?=[\s,，.。;；:\n]|$)/g, "`$1`");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const formattedContent = normalizeMarkdown(content);

  return (
    // 🌟 移除全局暴力 pre-wrap，使用精准的 prose 排版流
    <div className="markdown-content text-gray-800 font-normal leading-relaxed break-words font-mono-friendly">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 1. 代码块
          pre({ children, ...props }) {
            let rawCode = "";
            if (
              children &&
              typeof children === "object" &&
              "props" in (children as any)
            ) {
              rawCode = String(
                (children as any).props.children || ""
              ).replace(/\n$/, "");
            }

            return (
              <div className="group relative my-4 overflow-hidden rounded-xl border border-gray-800 bg-[#0d1117] shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-800/80 bg-[#161b22] px-4 py-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/80"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500/80"></span>
                  </div>
                  {rawCode && <CopyButton text={rawCode} />}
                </div>

                <pre
                  {...props}
                  className="overflow-x-auto p-4 font-mono text-sm leading-6 text-gray-100 whitespace-pre"
                >
                  {children}
                </pre>
              </div>
            );
          },

          // 2. 行内代码
          code({ className, children, ...props }) {
            const isBlock = Boolean(className);
            if (isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-pink-600 sm:text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },

          // 3. 表格
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-gray-50 font-semibold text-gray-700">
                {children}
              </thead>
            );
          },
          th({ children }) {
            return <th className="px-4 py-2.5 text-left">{children}</th>;
          },
          td({ children }) {
            return (
              <td className="border-t border-gray-100 px-4 py-2 text-gray-600">
                {children}
              </td>
            );
          },

          // 4. 标题
          h1({ children }) {
            return (
              <h1 className="mt-6 mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="mt-5 mb-2.5 text-xl font-bold text-gray-900 sm:text-2xl">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="mt-3.5 mb-2 text-lg font-semibold text-gray-800 sm:text-xl">
                {children}
              </h3>
            );
          },

          // 5. 链接与引用
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-500"
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-3 rounded-r-lg border-l-4 border-blue-500 bg-blue-50/50 py-2 pl-4 text-sm italic text-gray-700">
                {children}
              </blockquote>
            );
          },

          // 🌟 6. 有序列表（数字 1. 与标题严格同行，间距舒适）
          ol({ children }) {
            return (
              <ol className="my-3 list-decimal space-y-3 pl-6 text-gray-900 font-medium">
                {children}
              </ol>
            );
          },

          // 🌟 7. 无序列表（紧凑贴合子级列表项）
          ul({ children }) {
            return (
              <ul className="my-2 list-disc space-y-1.5 pl-5 text-gray-800 font-normal">
                {children}
              </ul>
            );
          },

          // 🌟 8. 列表项（保证 1. 2. 3. 序号与文字不换行断裂）
          li({ children }) {
            return (
              <li className="leading-relaxed text-gray-800 font-normal [&>p]:inline [&>p]:my-0">
                {children}
              </li>
            );
          },

          // 🌟 9. 段落（支持自然换行，同时不制造多余空洞）
          p({ children }) {
            return (
              <p className="my-1.5 leading-relaxed text-gray-700 font-normal whitespace-pre-line">
                {children}
              </p>
            );
          },
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}