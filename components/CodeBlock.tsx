"use client";

import { useMemo } from "react";
import CopyButton from "./CopyButton";
import { highlightSolution, resolveSolution } from "@/lib/solution-language";
import "highlight.js/styles/github-dark.css";

type CodeBlockProps = {
  code: string;
  language?: string;
  title?: string;
};

export default function CodeBlock({
  code,
  language,
  title,
}: CodeBlockProps) {
  const solution = useMemo(() => resolveSolution(code, language), [code, language]);
  const highlightedHtml = useMemo(
    () => highlightSolution(solution.code, solution.language),
    [solution.code, solution.language],
  );

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-gray-800 bg-[#0d1117] shadow-xl">
      {/* 顶部 Mac 风格工具栏 */}
      <div className="flex items-center justify-between border-b border-gray-800/80 bg-[#161b22] px-4 py-2.5 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          {/* 三色控制点 */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80"></span>
          </div>
          {/* 语言名称标签 */}
          <span className="ml-2 font-mono text-xs font-semibold text-gray-300">
            {title || solution.title}
          </span>
        </div>

        {/* 右上角复制按钮 */}
        <CopyButton text={solution.code} />
      </div>

      {/* 语法着色代码内容 */}
      <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-gray-100">
        {highlightedHtml !== null ? (
          <code className={`language-${solution.language}`} dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        ) : (
          <code className="language-plaintext">{solution.code}</code>
        )}
      </pre>
    </div>
  );
}