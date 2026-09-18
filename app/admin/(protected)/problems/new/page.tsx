"use client";

import { useState } from "react";
import Link from "next/link";
import { createProblem } from "../actions";
import {
  Sparkles,
  CheckCircle2,
  ArrowDown,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";

type SolutionLanguage =
  | "python"
  | "java"
  | "cpp"
  | "javascript"
  | "typescript"
  | "go"
  | "rust"
  | "c";

const LANGUAGE_LABELS: Record<SolutionLanguage, string> = {
  python: "Python 3",
  java: "Java",
  cpp: "C++",
  javascript: "JavaScript",
  typescript: "TypeScript",
  go: "Go",
  rust: "Rust",
  c: "C",
};

/**
 * Detect programming language from:
 *
 * 1. Solution header
 *    **Solution (Java)**
 *
 * 2. Markdown code fence
 *    ```java
 *
 * 3. Code syntax
 */
const detectSolutionLanguage = (
  solutionText: string,
  solutionHeader: string = ""
): SolutionLanguage => {
  const text = `${solutionHeader}\n${solutionText}`;
  const lowerText = text.toLowerCase();

  // Check fenced code language first.
  const codeBlockMatch = solutionText.match(
    /```([a-zA-Z0-9+#.-]+)/
  );

  const codeLanguage = codeBlockMatch?.[1]?.toLowerCase() || "";

  // Explicit language names.
  if (
    codeLanguage === "ts" ||
    codeLanguage === "typescript" ||
    lowerText.includes("typescript")
  ) {
    return "typescript";
  }

  if (
    codeLanguage === "js" ||
    codeLanguage === "javascript" ||
    lowerText.includes("javascript") ||
    lowerText.includes("node.js")
  ) {
    return "javascript";
  }

  if (
    codeLanguage === "java" ||
    /\bpublic\s+(class|static)\b/i.test(text) ||
    /\bimport\s+java\./i.test(text)
  ) {
    return "java";
  }

  if (
    codeLanguage === "cpp" ||
    codeLanguage === "c++" ||
    lowerText.includes("c++") ||
    lowerText.includes("cpp") ||
    /#include\s*<iostream>/i.test(text) ||
    /\bvector\s*</i.test(text)
  ) {
    return "cpp";
  }

  if (
    codeLanguage === "go" ||
    lowerText.includes("golang") ||
    /\bpackage\s+main\b/i.test(text)
  ) {
    return "go";
  }

  if (
    codeLanguage === "rust" ||
    codeLanguage === "rs" ||
    lowerText.includes("rust") ||
    /\bfn\s+main\s*\(/i.test(text)
  ) {
    return "rust";
  }

  if (
    codeLanguage === "c" ||
    /#include\s*<stdio\.h>/i.test(text) ||
    /\bint\s+main\s*\(/i.test(text)
  ) {
    return "c";
  }

  return "python";
};

/**
 * Remove the outer Markdown code fence from Solution.
 *
 * Example:
 *
 * ```java
 * public class Solution {
 * }
 * ```
 *
 * becomes:
 *
 * public class Solution {
 * }
 */
const extractSolutionCode = (solutionText: string): string => {
  const trimmed = solutionText.trim();

  const match = trimmed.match(
    /^```(?:[a-zA-Z0-9+#.-]+)?\s*\n([\s\S]*?)\n```$/i
  );

  if (match) {
    return match[1].trim();
  }

  return trimmed;
};

export default function NewProblemPage() {
  const [rawText, setRawText] = useState("");
  const [parseSuccess, setParseSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [stage, setStage] = useState("VO");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [example, setExample] = useState("");
  const [approach, setApproach] = useState("");
  const [solution, setSolution] = useState("");
  const [solutionLanguage, setSolutionLanguage] =
    useState<SolutionLanguage>("python");
  const [timeComplexity, setTimeComplexity] = useState("");
  const [spaceComplexity, setSpaceComplexity] = useState("");
  const [topics, setTopics] = useState("");
  const [similarProblems, setSimilarProblems] = useState("");

  /**
   * Normalize a potential Markdown header.
   *
   * Supported:
   *
   * **Title**
   * **Title**:
   * ## Title
   * - Title
   * 1. Title
   */
  const normalizeHeaderLine = (line: string): string => {
    let value = line.trim();

    // Markdown heading
    value = value.replace(/^#{1,6}\s+/, "");

    // Markdown list prefix
    value = value.replace(/^[-*+]\s+/, "");

    // Numbered list prefix
    value = value.replace(/^\d+[.)]\s+/, "");

    // Chinese brackets
    value = value.replace(/^【/, "").replace(/】$/, "");

    return value.trim();
  };

  /**
   * Try to recognize a field header.
   *
   * IMPORTANT:
   *
   * This function intentionally does NOT treat:
   *
   * 示例 1：
   * 示例 2：
   *
   * as the Example field header.
   *
   * Those lines belong to Example content.
   */
  const matchHeader = (
    line: string
  ): {
    key: string;
    value: string;
    rawHeader: string;
  } | null => {
    const normalized = normalizeHeaderLine(line);

    if (!normalized) {
      return null;
    }

    /*
     * First handle:
     *
     * **Title**:
     * **Title**: value
     * **Solution (Java)**:
     */
    const boldMatch = normalized.match(
      /^\*\*(.+?)\*\*\s*(?::|：|-)?\s*(.*)$/
    );

    let headerText = "";
    let value = "";

    if (boldMatch) {
      headerText = boldMatch[1].trim();
      value = boldMatch[2]?.trim() || "";
    } else {
      /*
       * Handle:
       *
       * Title:
       * Title: value
       * Solution (Java)
       */
      const plainMatch = normalized.match(
        /^(.+?)\s*(?::|：|-)\s*(.*)$/
      );

      if (plainMatch) {
        headerText = plainMatch[1].trim();
        value = plainMatch[2]?.trim() || "";
      } else {
        headerText = normalized.trim();
        value = "";
      }
    }

    // Remove trailing Markdown bold markers if any remain.
    headerText = headerText
      .replace(/^\*\*/, "")
      .replace(/\*\*$/, "")
      .trim();

    const lowerHeader = headerText.toLowerCase();

    /*
     * Never treat Example's internal:
     *
     * 示例 1
     * 示例 2
     * Example 1
     * Example 2
     *
     * as a new field.
     */
    if (/^(示例|example)\s*\d+/i.test(headerText)) {
      return null;
    }

    const headerMap: Array<{
      key: string;
      keywords: string[];
    }> = [
      {
        key: "title",
        keywords: [
          "title",
          "标题",
          "题目标题",
        ],
      },
      {
        key: "company",
        keywords: [
          "company",
          "公司",
          "目标公司",
        ],
      },
      {
        key: "role",
        keywords: [
          "role",
          "岗位",
          "招聘岗位",
        ],
      },
      {
        key: "difficulty",
        keywords: [
          "difficulty",
          "难度",
        ],
      },
      {
        key: "stage",
        keywords: [
          "stage",
          "考核形式",
          "面试形式",
          "轮次",
        ],
      },
      {
        key: "category",
        keywords: [
          "category",
          "分类",
          "类别",
        ],
      },
      {
        key: "description",
        keywords: [
          "description",
          "题目描述",
          "描述",
        ],
      },
      {
        key: "example",
        keywords: [
          "example",
          "输入输出示例",
          "示例",
        ],
      },
      {
        key: "approach",
        keywords: [
          "approach",
          "解题思路",
          "思路",
          "核心思路",
        ],
      },
      {
        key: "timeComplexity",
        keywords: [
          "time complexity",
          "时间复杂度",
        ],
      },
      {
        key: "spaceComplexity",
        keywords: [
          "space complexity",
          "空间复杂度",
        ],
      },
      {
        key: "topics",
        keywords: [
          "topics",
          "考点",
          "标签",
          "相关考点",
        ],
      },
      {
        key: "similarProblems",
        keywords: [
          "leetcode 相似题目推荐",
          "similar leetcode problems",
          "similar problems",
          "相似题目",
          "leetcode 相似题",
          "推荐题目",
          "相似题",
        ],
      },
      {
        key: "solution",
        keywords: [
          "solution",
          "代码",
          "核心代码",
          "参考代码",
        ],
      },
    ];

    for (const item of headerMap) {
      for (const keyword of item.keywords) {
        if (lowerHeader === keyword.toLowerCase()) {
          return {
            key: item.key,
            value,
            rawHeader: headerText,
          };
        }

        /*
         * Support:
         *
         * Solution (Java)
         * Solution [Java]
         * **Solution (Java)**
         */
        if (item.key === "solution") {
          const solutionPattern = new RegExp(
            `^${keyword.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            )}\\s*[([][^)\\]]+[)\\]]$`,
            "i"
          );

          if (solutionPattern.test(headerText)) {
            return {
              key: "solution",
              value,
              rawHeader: headerText,
            };
          }
        }
      }
    }

    return null;
  };

  const handleSmartParse = () => {
    if (!rawText.trim()) {
      alert("请先在上方粘贴题目大纲内容！");
      return;
    }

    const lines = rawText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n");

    const collected: Record<string, string[]> = {};

    let currentKey = "";
    let insideCodeBlock = false;
    let currentSolutionHeader = "";

    /*
     * We need to know whether the current field is Example.
     *
     * Example code fences must be preserved exactly.
     */
    const appendLine = (key: string, line: string) => {
      if (!key) {
        return;
      }

      collected[key] ??= [];
      collected[key].push(line);
    };

    for (const line of lines) {
      const trimmed = line.trim();

      /*
       * Markdown code fence.
       *
       * IMPORTANT:
       * We preserve both opening and closing fences.
       *
       * Example:
       *
       * ```text
       * nums = [1, 2, 3]
       * ```
       *
       * remains inside Example exactly.
       */
      if (trimmed.startsWith("```")) {
        if (currentKey) {
          appendLine(currentKey, line);
        }

        insideCodeBlock = !insideCodeBlock;
        continue;
      }

      /*
       * Anything inside a code block is NEVER treated
       * as a header.
       */
      if (insideCodeBlock) {
        if (currentKey) {
          appendLine(currentKey, line);
        }

        continue;
      }

      /*
       * Ignore Markdown separators.
       */
      if (
        trimmed === "---" ||
        trimmed === "***" ||
        trimmed === "___"
      ) {
        continue;
      }

      const matchedHeader = matchHeader(line);

      if (matchedHeader) {
        currentKey = matchedHeader.key;

        collected[currentKey] ??= [];

        if (matchedHeader.key === "solution") {
          currentSolutionHeader = matchedHeader.rawHeader;
        }

        /*
         * Header and value are on the same line.
         *
         * Example:
         *
         * **Title**: Two Sum
         */
        if (matchedHeader.value) {
          appendLine(
            currentKey,
            matchedHeader.value
          );
        }

        continue;
      }

      /*
       * Normal content line.
       */
      if (currentKey) {
        appendLine(currentKey, line);
      }
    }

    const getValue = (key: string): string => {
      return (
        collected[key]?.join("\n").trim() || ""
      );
    };

    const titleValue = getValue("title");
    const companyValue = getValue("company");
    const roleValue = getValue("role");
    const difficultyValue = getValue("difficulty");
    const stageValue = getValue("stage");
    const categoryValue = getValue("category");
    const descriptionValue = getValue("description");
    const exampleValue = getValue("example");
    const approachValue = getValue("approach");
    const timeComplexityValue =
      getValue("timeComplexity");
    const spaceComplexityValue =
      getValue("spaceComplexity");
    const topicsValue = getValue("topics");
    const similarProblemsValue =
      getValue("similarProblems");
    const solutionValue = getValue("solution");

    /*
     * Fill Title.
     */
    if (titleValue) {
      setTitle(titleValue);
    }

    /*
     * Fill Company.
     */
    if (companyValue) {
      setCompany(companyValue);
    }

    /*
     * Fill Role.
     */
    if (roleValue) {
      setRole(roleValue);
    }

    /*
     * Fill Difficulty.
     */
    if (difficultyValue) {
      const d = difficultyValue.toLowerCase();

      if (
        d.includes("easy") ||
        d.includes("简单")
      ) {
        setDifficulty("Easy");
      } else if (
        d.includes("hard") ||
        d.includes("困难")
      ) {
        setDifficulty("Hard");
      } else {
        setDifficulty("Medium");
      }
    }

    /*
     * Fill Stage.
     */
    if (stageValue) {
      const s = stageValue.toUpperCase();

      if (s.includes("OA")) {
        setStage("OA");
      } else {
        setStage("VO");
      }
    }

    /*
     * Fill Category.
     */
    if (categoryValue) {
      setCategory(categoryValue);
    }

    /*
     * Fill Description.
     */
    if (descriptionValue) {
      setDescription(descriptionValue);
    }

    /*
     * Fill Example.
     *
     * We intentionally DO NOT remove code fences.
     */
    if (exampleValue) {
      setExample(exampleValue);
    }

    /*
     * Fill Approach.
     */
    if (approachValue) {
      setApproach(approachValue);
    }

    /*
     * Fill Time Complexity.
     */
    if (timeComplexityValue) {
      setTimeComplexity(timeComplexityValue);
    }

    /*
     * Fill Space Complexity.
     */
    if (spaceComplexityValue) {
      setSpaceComplexity(
        spaceComplexityValue
      );
    }

    /*
     * Fill Topics.
     */
    if (topicsValue) {
      setTopics(topicsValue);
    }

    /*
     * Fill Similar Problems.
     */
    if (similarProblemsValue) {
      setSimilarProblems(
        similarProblemsValue
      );
    }

    /*
     * Fill Solution and detect language.
     */
    if (solutionValue) {
      const detectedLanguage =
        detectSolutionLanguage(
          solutionValue,
          currentSolutionHeader
        );

      setSolutionLanguage(
        detectedLanguage
      );

      setSolution(
        extractSolutionCode(solutionValue)
      );
    }

    setParseSuccess(true);

    setTimeout(() => {
      setParseSuccess(false);
    }, 4000);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSubmitError("");
    setSubmitting(true);

    try {
      const formData = new FormData(
        e.currentTarget
      );

      await createProblem(formData);
    } catch (err: any) {
      if (
        err?.message?.includes(
          "NEXT_REDIRECT"
        )
      ) {
        return;
      }

      setSubmitError(
        err?.message ||
          "创建失败，请核对必填项"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="py-12">
      <div className="mx-auto max-w-4xl px-6 space-y-8">
        <Link
          href="/admin/problems"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Problems
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Add Interview Problem
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            录入大厂高频面试真题。支持在下方直接一键粘贴整篇文本智能识别。
          </p>
        </div>

        {/* Smart Parser */}
        <div className="rounded-3xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/50 via-white to-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                一键智能解析与快速录入 (Smart Auto-Fill)
              </h2>

              <p className="text-xs text-gray-500">
                直接在此粘贴整篇题目（包含
                **Title**、**Company**、**Description**、
                **Example**、**Solution** 等），系统自动分拆并填充下方所有表单。
              </p>
            </div>
          </div>

          <textarea
            rows={10}
            value={rawText}
            onChange={(e) =>
              setRawText(e.target.value)
            }
            placeholder={`在此粘贴完整题目，例如：

**Title**:
Employee Interest Matching System

**Company**:
Amazon

**Role**:
Software Engineer

**Difficulty**:
Medium

**Stage**:
VO

**Category**:
HashSet, HashMap, Sorting

**Description**:
题目描述...

**Example**:
示例 1：
输入：
\`\`\`text
...
\`\`\`

**Approach**:
1. 核心思想...
2. 算法步骤...

**Time Complexity**:
O(n)

**Space Complexity**:
O(n)

**Topics**:
HashSet, HashMap, Sorting

**LeetCode 相似题目推荐**:
349. Intersection of Two Arrays

**Solution (Java)**:
\`\`\`java
import java.util.*;

public class Solution {
    ...
}
\`\`\``}
            className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleSmartParse}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />

              <span>
                ⚡ 一键智能解析并填入下方表单
              </span>

              <ArrowDown className="h-4 w-4" />
            </button>

            {parseSuccess && (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                <CheckCircle2 className="h-4 w-4" />

                <span>
                  已成功自动识别并填入所有字段！请在下方核对
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm"
        >
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <FileText className="h-5 w-5 text-gray-400" />

            <h2 className="text-base font-bold text-gray-900">
              题目表单明细（可二次调整与校对）
            </h2>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0" />

              <span>{submitError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="font-semibold text-gray-900 text-sm"
            >
              Title (题目标题) *
            </label>

            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. 时间序列合并（Merge Two Sparse Time Series）"
              className={inputStyle}
            />
          </div>

          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="company"
                className="font-semibold text-gray-900 text-sm"
              >
                Company (目标公司) *
              </label>

              <input
                id="company"
                name="company"
                required
                value={company}
                onChange={(e) =>
                  setCompany(e.target.value)
                }
                placeholder="e.g. Meta, Google, 北美大厂"
                className={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="font-semibold text-gray-900 text-sm"
              >
                Role (招聘岗位)
              </label>

              <input
                id="role"
                name="role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                placeholder="e.g. SDE / Backend Engineer"
                className={inputStyle}
              />
            </div>
          </div>

          {/* Difficulty / Stage / Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="difficulty"
                className="font-semibold text-gray-900 text-sm"
              >
                Difficulty (难度)
              </label>

              <select
                id="difficulty"
                name="difficulty"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value)
                }
                className={inputStyle}
              >
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

            <div>
              <label
                htmlFor="stage"
                className="font-semibold text-gray-900 text-sm"
              >
                Stage (考核形式)
              </label>

              <select
                id="stage"
                name="stage"
                value={stage}
                onChange={(e) =>
                  setStage(e.target.value)
                }
                className={inputStyle}
              >
                <option value="OA">
                  OA (线上测评/笔试)
                </option>

                <option value="VO">
                  VO (技术轮面/Onsite)
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="font-semibold text-gray-900 text-sm"
              >
                Category (分类) *
              </label>

              <input
                id="category"
                name="category"
                required
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="e.g. Algorithms / Two Pointers"
                className={inputStyle}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="font-semibold text-gray-900 text-sm"
            >
              Problem Description (题目描述) *
            </label>

            <textarea
              id="description"
              name="description"
              required
              rows={5}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="给定两条按时间递增排序的稀疏时间序列..."
              className={inputStyle}
            />
          </div>

          {/* Example */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="example"
                className="font-semibold text-gray-900 text-sm"
              >
                Example (输入输出示例 - 支持 Markdown 格式)
              </label>

              <span className="text-xs text-blue-600 font-medium">
                Markdown Format Supported
              </span>
            </div>

            <textarea
              id="example"
              name="example"
              rows={10}
              value={example}
              onChange={(e) =>
                setExample(e.target.value)
              }
              placeholder={`示例 1：

输入：

\`\`\`text
num1 = "123"
num2 = "456"
\`\`\`

输出：

\`\`\`text
"579"
\`\`\``}
              className={`${inputStyle} font-mono`}
            />
          </div>

          {/* Approach */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="approach"
                className="font-semibold text-gray-900 text-sm"
              >
                Approach (解题思路 - 支持 Markdown 格式)
              </label>

              <span className="text-xs text-blue-600 font-medium">
                Markdown Format Supported
              </span>
            </div>

            <textarea
              id="approach"
              name="approach"
              rows={10}
              value={approach}
              onChange={(e) =>
                setApproach(e.target.value)
              }
              placeholder="本题本质是将多条稀疏时间序列合并成一条压缩事件流..."
              className={inputStyle}
            />
          </div>

          {/* Solution */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="solution"
                className="font-semibold text-gray-900 text-sm"
              >
                Solution (核心代码)
              </label>

              <select
                id="solutionLanguage"
                name="solutionLanguage"
                value={solutionLanguage}
                onChange={(e) =>
                  setSolutionLanguage(
                    e.target.value as SolutionLanguage
                  )
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="python">
                  Python 3
                </option>

                <option value="java">
                  Java
                </option>

                <option value="cpp">
                  C++
                </option>

                <option value="javascript">
                  JavaScript
                </option>

                <option value="typescript">
                  TypeScript
                </option>

                <option value="go">
                  Go
                </option>

                <option value="rust">
                  Rust
                </option>

                <option value="c">
                  C
                </option>
              </select>
            </div>

            <textarea
              id="solution"
              name="solution"
              rows={16}
              value={solution}
              onChange={(e) =>
                setSolution(e.target.value)
              }
              placeholder={`Java:

import java.util.*;

public class Solution {
    ...
}`}
              className={`${inputStyle} font-mono`}
            />

            <p className="mt-2 text-xs text-gray-400">
              智能解析会自动识别代码语言，你也可以在右上角手动修改。
              当前语言：
              <span className="font-semibold text-gray-600">
                {" "}
                {LANGUAGE_LABELS[solutionLanguage]}
              </span>
            </p>
          </div>

          {/* Complexity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="timeComplexity"
                  className="font-semibold text-gray-900 text-sm"
                >
                  Time Complexity (支持多行列表)
                </label>

                <span className="text-xs text-gray-400">
                  支持 - 列表
                </span>
              </div>

              <textarea
                id="timeComplexity"
                name="timeComplexity"
                rows={5}
                value={timeComplexity}
                onChange={(e) =>
                  setTimeComplexity(
                    e.target.value
                  )
                }
                placeholder={`- 最坏情况：O(n + m)
- 最好情况：O(n + m)`}
                className={`${inputStyle} font-mono`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="spaceComplexity"
                  className="font-semibold text-gray-900 text-sm"
                >
                  Space Complexity (支持多行列表)
                </label>

                <span className="text-xs text-gray-400">
                  支持 - 列表
                </span>
              </div>

              <textarea
                id="spaceComplexity"
                name="spaceComplexity"
                rows={5}
                value={spaceComplexity}
                onChange={(e) =>
                  setSpaceComplexity(
                    e.target.value
                  )
                }
                placeholder={`- 辅助空间：O(1)
- 输入存储：O(n + m)`}
                className={`${inputStyle} font-mono`}
              />
            </div>
          </div>

          {/* Topics */}
          <div>
            <label
              htmlFor="topics"
              className="font-semibold text-gray-900 text-sm"
            >
              Topics (考点标签)
            </label>

            <input
              id="topics"
              name="topics"
              value={topics}
              onChange={(e) =>
                setTopics(e.target.value)
              }
              placeholder="e.g. Two Pointers, Merge, Sweep Line, State Machine, Data Compression"
              className={inputStyle}
            />

            <p className="mt-1 text-xs text-gray-400">
              多个考点标签用逗号隔开。
            </p>
          </div>

          {/* Similar Problems */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="similarProblems"
                className="font-semibold text-gray-900 text-sm flex items-center gap-1.5"
              >
                <span>🎯</span>

                <span>
                  LeetCode 相似题目推荐 (Similar LeetCode Problems)
                </span>
              </label>

              <span className="text-xs text-gray-400">
                多个题目用逗号隔开
              </span>
            </div>

            <input
              id="similarProblems"
              name="similarProblems"
              value={similarProblems}
              onChange={(e) =>
                setSimilarProblems(
                  e.target.value
                )
              }
              placeholder="21. 合并两个有序链表，986. 区间列表的交集，56. 合并区间"
              className={inputStyle}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />

                <span>
                  正在提交题目入库并生成静态路由...
                </span>
              </>
            ) : (
              <span>
                Create Problem (立即提交入库)
              </span>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}