"use client";

import { useState } from "react";
import BlogCard from "@/components/BlogCard";
import type { Post } from "@/types/post";

type BlogListProps = {
  posts: Post[];
};

// Blog 列表和分类筛选组件
export default function BlogList({
  posts,
}: BlogListProps) {
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const categories = [
    "All",
    ...Array.from(
      new Set(posts.map((post) => post.category))
    ),
  ];

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter(
          (post) => post.category === selectedCategory
        );

  return (
    <div>
      {/* Blog 分类筛选 */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() =>
              setSelectedCategory(category)
            }
            className={`
              rounded-full
              border
              px-5
              py-2
              text-sm
              font-medium
              transition
              ${
                selectedCategory === category
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-600 hover:text-blue-600"
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 当前文章数量 */}
      <p className="mt-8 text-sm text-gray-500">
        {filteredPosts.length} articles
      </p>

      {/* Blog 卡片 */}
      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        {filteredPosts.map((post) => (
          <BlogCard
            key={post.slug}
            post={post}
          />
        ))}
      </div>
    </div>
  );
}