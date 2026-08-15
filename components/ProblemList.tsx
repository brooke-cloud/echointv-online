"use client";

import { useState } from "react";
import ProblemCard from "@/components/ProblemCard";
import ProblemFilters from "@/components/ProblemFilters";
import type { Problem } from "@/types/problem";

type ProblemListProps = {
  problems: Problem[];
};

// Problem 列表组件
export default function ProblemList({
  problems,
}: ProblemListProps) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedCompany,
    setSelectedCompany,
  ] = useState("All");

  const [
    selectedDifficulty,
    setSelectedDifficulty,
  ] = useState("All");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  const companies = [
    "All",
    ...Array.from(
      new Set(
        problems.map(
          (problem) => problem.company
        )
      )
    ),
  ];

  const difficulties = [
    "All",
    ...Array.from(
      new Set(
        problems.map(
          (problem) =>
            problem.difficulty
        )
      )
    ),
  ];

  const categories = [
    "All",
    ...Array.from(
      new Set(
        problems.map(
          (problem) =>
            problem.category
        )
      )
    ),
  ];

  const filteredProblems =
    problems.filter((problem) => {
      const searchValue =
        searchTerm.toLowerCase();

      const matchesSearch =
        problem.title
          .toLowerCase()
          .includes(searchValue) ||
        problem.company
          .toLowerCase()
          .includes(searchValue) ||
        problem.role
          .toLowerCase()
          .includes(searchValue) ||
        problem.category
          .toLowerCase()
          .includes(searchValue) ||
        problem.description
          .toLowerCase()
          .includes(searchValue);

      const matchesCompany =
        selectedCompany === "All" ||
        problem.company ===
          selectedCompany;

      const matchesDifficulty =
        selectedDifficulty === "All" ||
        problem.difficulty ===
          selectedDifficulty;

      const matchesCategory =
        selectedCategory === "All" ||
        problem.category ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCompany &&
        matchesDifficulty &&
        matchesCategory
      );
    });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCompany("All");
    setSelectedDifficulty("All");
    setSelectedCategory("All");
  };

  return (
    <div>
      {/* 搜索区域 */}
      <div className="w-full">

        {/* 搜索框 */}
        <input
          type="text"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(
              event.target.value
            )
          }
          placeholder="Search problems..."
          className="
            w-full
            rounded-xl
            border
            border-gray-300
            bg-white
            px-4
            py-3
            text-gray-900
            outline-none
            transition
            focus:border-blue-600
            focus:ring-2
            focus:ring-blue-100
          "
        />

      </div>


      {/* 筛选区域 */}
      <div className="mt-6">

        {/* 筛选组件 */}
        <ProblemFilters
          companies={companies}
          difficulties={
            difficulties
          }
          categories={categories}
          selectedCompany={
            selectedCompany
          }
          selectedDifficulty={
            selectedDifficulty
          }
          selectedCategory={
            selectedCategory
          }
          onCompanyChange={
            setSelectedCompany
          }
          onDifficultyChange={
            setSelectedDifficulty
          }
          onCategoryChange={
            setSelectedCategory
          }
        />

      </div>


      {/* 筛选结果操作区域 */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* 结果数量 */}
        <p className="text-sm text-gray-500">
          {filteredProblems.length}{" "}
          problems found
        </p>

        {/* 清除筛选 */}
        <button
          type="button"
          onClick={clearFilters}
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-2
            text-sm
            font-medium
            text-gray-700
            transition
            hover:border-blue-600
            hover:text-blue-600
            sm:w-auto
          "
        >
          Clear Filters
        </button>

      </div>


      {/* Problem 卡片列表 */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

        {filteredProblems.length >
        0 ? (
          filteredProblems.map(
            (problem) => (

              <ProblemCard
                key={problem.id}
                problem={problem}
              />

            )
          )
        ) : (

          <div className="col-span-full rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">

            {/* 无结果标题 */}
            <p className="font-medium text-gray-900">
              No problems found.
            </p>

            {/* 无结果说明 */}
            <p className="mt-2 text-sm text-gray-500">
              Try changing your search
              or filters.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}