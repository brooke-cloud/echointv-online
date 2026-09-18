// components/MarkdownRenderer.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  if (!content) return null;

  return (
    <div className="markdown-renderer text-gray-800">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          [remarkMath, { singleDollarTextMath: false }],
          remarkBreaks,
        ]}
        rehypePlugins={[[rehypeKatex, { output: "html" }]]}
        components={{
          /* =========================
             Headings
          ========================= */

          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-100">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 mb-3">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-5 mb-2">
              {children}
            </h3>
          ),

          h4: ({ children }) => (
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mt-5 mb-2">
              {children}
            </h4>
          ),

          h5: ({ children }) => (
            <h5 className="text-sm sm:text-base font-bold text-gray-900 mt-4 mb-1.5">
              {children}
            </h5>
          ),

          h6: ({ children }) => (
            <h6 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-800 mt-3 mb-1">
              {children}
            </h6>
          ),

          /* =========================
             Text
          ========================= */

          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em className="italic text-gray-800">
              {children}
            </em>
          ),

          p: ({ children }) => (
            <p className="my-3 text-base leading-7 text-gray-700">
              {children}
            </p>
          ),

          /* =========================
             Lists
          ========================= */

          ul: ({ children }) => (
            <ul className="my-3 list-disc list-inside space-y-1.5 text-gray-700">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="my-3 list-decimal list-inside space-y-1.5 text-gray-700">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),

          /* =========================
             Blockquote
          ========================= */

          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-blue-500 bg-blue-50/60 p-4 rounded-r-2xl text-gray-700 text-sm italic">
              {children}
            </blockquote>
          ),

          /* =========================
             CODE BLOCK
             核心修改在这里
          ========================= */

          pre: ({ children }) => (
            <div
              className="
                my-4
                w-full
                overflow-x-auto
                rounded-2xl
                bg-gray-900
                text-gray-100
                shadow-inner
              "
            >
              <pre
                className="
                  m-0
                  p-4
                  font-mono
                  text-xs
                  sm:text-sm
                  leading-relaxed
                  whitespace-pre
                  overflow-x-auto
                  break-normal
                "
                style={{
                  whiteSpace: "pre",
                  tabSize: 4,
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                {children}
              </pre>
            </div>
          ),

          /* =========================
             INLINE CODE + CODE BLOCK
          ========================= */

          code({ className, children, ...props }: any) {
            const codeString = String(children);

            const isMultiLine =
              codeString.includes("\n");

            const hasLanguage =
              Boolean(className);

            /*
             * 普通的 inline code
             *
             * 例如：
             * `nums`
             * `O(n)`
             */
            if (!isMultiLine && !hasLanguage) {
              return (
                <code
                  className="
                    bg-blue-50
                    text-blue-700
                    font-mono
                    text-xs
                    px-1.5
                    py-0.5
                    rounded-md
                    border
                    border-blue-100
                    font-semibold
                    mx-0.5
                  "
                  {...props}
                >
                  {children}
                </code>
              );
            }

            /*
             * 多行代码块
             *
             * 最重要：
             * whitespace-pre
             *
             * 保证：
             * 1. 空格不被压缩
             * 2. 换行不被压缩
             * 3. 缩进不被改变
             * 4. ASCII Tree 不被重新排版
             * 5. 文件目录结构保持原样
             */
            return (
              <code
                className={`
                  ${className || ""}
                  font-mono
                  whitespace-pre
                  break-normal
                `}
                style={{
                  whiteSpace: "pre",
                  tabSize: 4,
                }}
                {...props}
              >
                {children}
              </code>
            );
          },

          /* =========================
             Table
          ========================= */

          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              {children}
            </thead>
          ),

          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-100 bg-white">
              {children}
            </tbody>
          ),

          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="px-4 py-3 text-gray-700">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}