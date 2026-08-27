// app/admin/(protected)/posts/new/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { createPost } from "../actions";
import BlogContentEditor from "@/components/BlogContentEditor";
import AdminSubmitButton from "@/components/AdminSubmitButton";

export default function NewPostPage() {
  const [showModal, setShowModal] = useState(false);
  const [importText, setImportText] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [content, setContent] = useState("");

  // 🌟 精准解析格式文本函数（已修复 TS 类型报错）
  const handleParseAndFill = () => {
    if (!importText.trim()) {
      alert("请先粘贴内容");
      return;
    }

    const text = importText;

    const extractSection = (startKey: string, nextKeys: string[]) => {
      const nextKeysPattern = nextKeys.length > 0 ? `(?=(?:${nextKeys.join("|")})\\s*[:：]|$)` : "$";
      const pattern = `${startKey}\\s*[:：]\\s*([\\s\\S]*?)${nextKeysPattern}`;
      const regex = new RegExp(pattern, "i");
      const match = text.match(regex);
      return match?.[1]?.trim() ?? "";
    };

    const extractedTitle = extractSection("Title", [
      "URL",
      "Slug",
      "Description",
      "Content",
      "Category",
      "Date",
      "Reading Time",
    ]);

    let extractedSlug =
      extractSection("URL", [
        "Slug",
        "Description",
        "Content",
        "Category",
        "Date",
        "Reading Time",
      ]) ||
      extractSection("Slug", [
        "Description",
        "Content",
        "Category",
        "Date",
        "Reading Time",
      ]);

    if (extractedSlug.includes("/blog/")) {
      extractedSlug = extractedSlug.split("/blog/")[1]?.trim() || extractedSlug;
    }

    const extractedDescription = extractSection("Description", [
      "Content",
      "Category",
      "Date",
      "Reading Time",
    ]);

    const extractedContent = extractSection("Content", [
      "Category",
      "Date",
      "Reading Time",
    ]);

    const extractedCategory = extractSection("Category", [
      "Date",
      "Reading Time",
    ]);

    const extractedDate = extractSection("Date", ["Reading Time"]);

    const extractedReadingTime = extractSection("Reading Time", []);

    // 填充到各表单字段
    if (extractedTitle) setTitle(extractedTitle);
    if (extractedSlug) setSlug(extractedSlug);
    if (extractedDescription) setDescription(extractedDescription);
    if (extractedContent) setContent(extractedContent);
    if (extractedCategory) setCategory(extractedCategory);
    if (extractedDate) setDate(extractedDate);
    if (extractedReadingTime) setReadingTime(extractedReadingTime);

    setShowModal(false);
    setImportText("");
  };

  const inputStyle =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="py-12">
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <Link
          href="/admin/posts"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Blog Posts
        </Link>

        {/* 标题栏与一键导入按钮 */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Add Blog Post
          </h1>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rounded-xl border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-blue-600 hover:text-white active:scale-95 flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>一键导入文本</span>
          </button>
        </div>

        {/* 导入弹窗 */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 relative">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  一键导入面经格式文本
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg w-8 h-8 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                直接把包含 <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">Title:</code>、<code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">URL:</code>、<code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">Description:</code>、<code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">Content:</code>、<code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">Category:</code>、<code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">Date:</code>、<code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">Reading Time:</code> 的内容粘贴在下方：
              </p>

              <textarea
                rows={10}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`Title:\n大厂面试复盘\n\nURL:\n/blog/interview-guide\n\nDescription:\n本文分享...\n\nContent:\n## 正文标题\n- 核心内容...\n\nCategory:\nCareer\n\nDate:\nAug 27, 2026\n\nReading Time:\n6 min read`}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono text-gray-800 leading-relaxed bg-gray-50"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleParseAndFill}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition active:scale-95"
                >
                  ✨ 一键自动填入表单
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 原有表单 */}
        <form
          action={createPost}
          className="mt-10 space-y-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <div>
            <label htmlFor="title" className="font-medium text-gray-900">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Amazon SDE Interview Experience"
              className={inputStyle}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="slug" className="font-medium text-gray-900">
                Slug (URL Identifier)
              </label>
              <span className="text-xs text-gray-400">可选，留空将根据标题自动生成</span>
            </div>
            <input
              id="slug"
              name="slug"
              maxLength={200}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. amazon-sde-interview-experience"
              className={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="description" className="font-medium text-gray-900">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the article..."
              className={inputStyle}
            />
          </div>

          <BlogContentEditor
            key={content ? `content_${content.length}` : "empty"}
            defaultValue={content}
          />

          <div>
            <label htmlFor="category" className="font-medium text-gray-900">
              Category
            </label>
            <input
              id="category"
              name="category"
              required
              maxLength={100}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Career, System Design, Coding"
              className={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="date" className="font-medium text-gray-900">
              Date
            </label>
            <input
              id="date"
              name="date"
              required
              maxLength={50}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputStyle}
              placeholder="Aug 14, 2026"
            />
          </div>

          <div>
            <label htmlFor="readingTime" className="font-medium text-gray-900">
              Reading Time
            </label>
            <input
              id="readingTime"
              name="readingTime"
              required
              maxLength={50}
              value={readingTime}
              onChange={(e) => setReadingTime(e.target.value)}
              className={inputStyle}
              placeholder="6 min read"
            />
          </div>

          <AdminSubmitButton pendingText="Publishing...">
            Create Blog Post
          </AdminSubmitButton>
        </form>
      </div>
    </main>
  );
}