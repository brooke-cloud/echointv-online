import Link from "next/link";

import {
  createProblem,
} from "../actions";

import AdminSubmitButton from "@/components/AdminSubmitButton";

// 新增 Problem 页面
export default function NewProblemPage() {
  const inputStyle =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="py-12">

      {/* 页面内容 */}
      <div className="mx-auto max-w-4xl px-5 sm:px-6">

        {/* 返回 */}
        <Link
          href="/admin/problems"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Problems
        </Link>


        {/* 标题 */}
        <h1 className="mt-8 text-3xl font-bold text-gray-900 sm:text-4xl">
          Add Problem
        </h1>


        {/* 创建表单 */}
        <form
          action={createProblem}
          className="mt-10 space-y-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="font-medium text-gray-900"
            >
              Title
            </label>

            <input
              id="title"
              name="title"
              required
              maxLength={200}
              className={inputStyle}
            />
          </div>


          {/* Company */}
          <div>
            <label
              htmlFor="company"
              className="font-medium text-gray-900"
            >
              Company
            </label>

            <input
              id="company"
              name="company"
              required
              maxLength={100}
              className={inputStyle}
            />
          </div>


          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="font-medium text-gray-900"
            >
              Role
            </label>

            <input
              id="role"
              name="role"
              required
              maxLength={100}
              className={inputStyle}
            />
          </div>


          {/* Difficulty */}
          <div>
            <label
              htmlFor="difficulty"
              className="font-medium text-gray-900"
            >
              Difficulty
            </label>

            <select
              id="difficulty"
              name="difficulty"
              required
              className={inputStyle}
            >
              <option value="">
                Select Difficulty
              </option>

              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>
            </select>
          </div>


          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="font-medium text-gray-900"
            >
              Category
            </label>

            <input
              id="category"
              name="category"
              required
              maxLength={100}
              className={inputStyle}
            />
          </div>


          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="font-medium text-gray-900"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              required
              rows={5}
              maxLength={5000}
              className={inputStyle}
            />
          </div>


          {/* Example */}
          <div>
            <label
              htmlFor="example"
              className="font-medium text-gray-900"
            >
              Example
            </label>

            <textarea
              id="example"
              name="example"
              rows={7}
              maxLength={10000}
              className={inputStyle}
            />
          </div>


          {/* Approach */}
          <div>
            <label
              htmlFor="approach"
              className="font-medium text-gray-900"
            >
              Approach
            </label>

            <textarea
              id="approach"
              name="approach"
              rows={7}
              maxLength={10000}
              className={inputStyle}
            />
          </div>


          {/* Solution */}
          <div>
            <label
              htmlFor="solution"
              className="font-medium text-gray-900"
            >
              Solution
            </label>

            <textarea
              id="solution"
              name="solution"
              rows={12}
              maxLength={30000}
              className={inputStyle}
            />
          </div>


          {/* Time Complexity */}
          <div>
            <label
              htmlFor="timeComplexity"
              className="font-medium text-gray-900"
            >
              Time Complexity
            </label>

            <input
              id="timeComplexity"
              name="timeComplexity"
              maxLength={100}
              className={inputStyle}
              placeholder="O(n)"
            />
          </div>


          {/* Space Complexity */}
          <div>
            <label
              htmlFor="spaceComplexity"
              className="font-medium text-gray-900"
            >
              Space Complexity
            </label>

            <input
              id="spaceComplexity"
              name="spaceComplexity"
              maxLength={100}
              className={inputStyle}
              placeholder="O(n)"
            />
          </div>


          {/* Topics */}
          <div>
            <label
              htmlFor="topics"
              className="font-medium text-gray-900"
            >
              Topics
            </label>

            <input
              id="topics"
              name="topics"
              maxLength={1000}
              className={inputStyle}
              placeholder="Array, Hash Map, Two Pointers"
            />

            <p className="mt-2 text-sm text-gray-500">
              Separate topics with commas.
            </p>
          </div>


          {/* Submit */}
          <AdminSubmitButton
            pendingText="Creating..."
          >
            Create Problem
          </AdminSubmitButton>

        </form>

      </div>

    </main>
  );
}