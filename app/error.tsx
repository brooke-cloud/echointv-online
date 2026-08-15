"use client";

// 全站错误页面
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">

      {/* 错误内容 */}
      <div className="max-w-xl text-center">

        {/* 错误状态 */}
        <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
          Error
        </p>

        {/* 标题 */}
        <h1 className="mt-4 text-4xl font-bold text-gray-900">
          Something went wrong
        </h1>

        {/* 描述 */}
        <p className="mt-5 leading-8 text-gray-600">
          We could not load this page. Please try again.
        </p>

        {/* 操作区域 */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">

          {/* 重试 */}
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>

          {/* 返回首页 */}
          <a
            href="/"
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
          >
            Back Home
          </a>

        </div>

        {/* 开发环境错误 */}
        {process.env.NODE_ENV === "development" && (
          <p className="mt-8 break-words rounded-xl bg-red-50 p-4 text-left text-sm text-red-700">
            {error.message}
          </p>
        )}

      </div>

    </main>
  );
}