import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProblem } from "../../actions";
import AdminSubmitButton from "@/components/AdminSubmitButton";

type EditProblemPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Problem 编辑页面
export default async function EditProblemPage({
  params,
}: EditProblemPageProps) {
  const { id } = await params;

  const problemId = Number(id);

  if (Number.isNaN(problemId)) {
    notFound();
  }

  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
  });

  if (!problem) {
    notFound();
  }

  const updateProblemWithId =
    updateProblem.bind(
      null,
      problem.id
    );

  const inputStyle =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="py-12">
      {/* 页面内容容器 */}
      <div className="mx-auto max-w-4xl px-6">

        {/* 返回管理页面 */}
        <Link
          href="/admin/problems"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Problems
        </Link>

        {/* 页面标题 */}
        <h1 className="mt-8 text-4xl font-bold text-gray-900">
          Edit Problem
        </h1>


        {/* 编辑 Problem 表单 */}
        <form
          action={updateProblemWithId}
          className="mt-10 space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >

          {/* Title */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="title"
              className="font-medium text-gray-900"
            >
              Title
            </label>

            {/* Title 输入框 */}
            <input
              id="title"
              name="title"
              required
              defaultValue={problem.title}
              className={inputStyle}
            />
          </div>


          {/* Company */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="company"
              className="font-medium text-gray-900"
            >
              Company
            </label>

            {/* Company 输入框 */}
            <input
              id="company"
              name="company"
              required
              defaultValue={problem.company}
              className={inputStyle}
            />
          </div>


          {/* Role */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="role"
              className="font-medium text-gray-900"
            >
              Role
            </label>

            {/* Role 输入框 */}
            <input
              id="role"
              name="role"
              required
              defaultValue={problem.role}
              className={inputStyle}
            />
          </div>


          {/* Difficulty */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="difficulty"
              className="font-medium text-gray-900"
            >
              Difficulty
            </label>

            {/* Difficulty 选择 */}
            <select
              id="difficulty"
              name="difficulty"
              required
              defaultValue={problem.difficulty}
              className={inputStyle}
            >
              {/* Easy */}
              <option value="Easy">
                Easy
              </option>

              {/* Medium */}
              <option value="Medium">
                Medium
              </option>

              {/* Hard */}
              <option value="Hard">
                Hard
              </option>
            </select>
          </div>


          {/* Category */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="category"
              className="font-medium text-gray-900"
            >
              Category
            </label>

            {/* Category 输入 */}
            <input
              id="category"
              name="category"
              required
              defaultValue={problem.category}
              className={inputStyle}
            />
          </div>


          {/* Description */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="description"
              className="font-medium text-gray-900"
            >
              Description
            </label>

            {/* Description 编辑 */}
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              defaultValue={problem.description}
              className={inputStyle}
            />
          </div>


          {/* Example */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="example"
              className="font-medium text-gray-900"
            >
              Example
            </label>

            {/* Example 编辑 */}
            <textarea
              id="example"
              name="example"
              rows={7}
              defaultValue={problem.example}
              className={inputStyle}
            />
          </div>


          {/* Approach */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="approach"
              className="font-medium text-gray-900"
            >
              Approach
            </label>

            {/* Approach 编辑 */}
            <textarea
              id="approach"
              name="approach"
              rows={7}
              defaultValue={problem.approach}
              className={inputStyle}
            />
          </div>


          {/* Solution */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="solution"
              className="font-medium text-gray-900"
            >
              Solution
            </label>

            {/* Solution 编辑 */}
            <textarea
              id="solution"
              name="solution"
              rows={10}
              defaultValue={problem.solution}
              className={inputStyle}
            />
          </div>


          {/* Time Complexity */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="timeComplexity"
              className="font-medium text-gray-900"
            >
              Time Complexity
            </label>

            {/* Time Complexity 输入 */}
            <input
              id="timeComplexity"
              name="timeComplexity"
              defaultValue={problem.timeComplexity}
              className={inputStyle}
            />
          </div>


          {/* Space Complexity */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="spaceComplexity"
              className="font-medium text-gray-900"
            >
              Space Complexity
            </label>

            {/* Space Complexity 输入 */}
            <input
              id="spaceComplexity"
              name="spaceComplexity"
              defaultValue={problem.spaceComplexity}
              className={inputStyle}
            />
          </div>


          {/* Topics */}
          <div>
            {/* 字段名称 */}
            <label
              htmlFor="topics"
              className="font-medium text-gray-900"
            >
              Topics
            </label>

            {/* Topics 输入 */}
            <input
              id="topics"
              name="topics"
              defaultValue={problem.topics.join(", ")}
              className={inputStyle}
            />

            {/* Topics 提示 */}
            <p className="mt-2 text-sm text-gray-500">
              Separate topics with commas.
            </p>
          </div>


          {/* 保存按钮 */}
          <AdminSubmitButton pendingText="Saving...">
            Save Changes
          </AdminSubmitButton>
          
        </form>

      </div>
    </main>
  );
}