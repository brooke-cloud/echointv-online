
"use client";

import { useState } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

type BlogContentEditorProps = {
  defaultValue?: string;
};

// Blog Markdown 编辑器
export default function BlogContentEditor({
  defaultValue = "",
}: BlogContentEditorProps) {
  const [content, setContent] =
    useState(defaultValue);

  return (
    <div className="min-w-0">

      {/* 编辑器标题 */}
      <label
        htmlFor="content"
        className="font-medium text-gray-900"
      >
        Content
      </label>

      {/* Markdown 编辑与预览区域 */}
      <div className="mt-3 grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Markdown 输入区域 */}
        <div className="min-w-0">

          {/* 输入区域标题 */}
          <p className="mb-3 text-sm font-medium text-gray-500">
            Markdown
          </p>

          {/* Markdown 输入框 */}
          <textarea
            id="content"
            name="content"
            required
            rows={24}
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            className="
              min-h-[500px]
              w-full
              max-w-full
              resize-y
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-4
              font-mono
              text-sm
              leading-7
              text-gray-900
              outline-none
              transition
              focus:border-blue-600
              focus:ring-2
              focus:ring-blue-100
            "
            placeholder="Write Markdown here..."
          />

        </div>

        {/* Markdown Preview */}
        <div className="min-w-0">

          {/* Preview 标题 */}
          <p className="mb-3 text-sm font-medium text-gray-500">
            Preview
          </p>

          {/* Preview 内容 */}
          <div className="min-h-[500px] min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 sm:p-6">

            {content.trim() ? (

              <MarkdownRenderer
                content={content}
              />

            ) : (

              <p className="text-sm text-gray-400">
                Your Markdown preview will appear here.
              </p>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}