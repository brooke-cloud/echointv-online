"use client";

// Admin Error
export default function AdminError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  return (
    <main className="py-12">

      {/* Error 容器 */}
      <div className="mx-auto max-w-3xl px-5 sm:px-6">

        {/* Error 卡片 */}
        <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">

          {/* Error 状态 */}
          <p className="text-sm font-semibold text-red-600">
            Admin Error
          </p>

          {/* Error 标题 */}
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Something went wrong
          </h1>

          {/* Error 描述 */}
          <p className="mt-4 leading-7 text-gray-600">
            We could not load this admin page.
          </p>

          {/* 重试按钮 */}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-7 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>

          {/* 开发错误信息 */}
          {process.env.NODE_ENV === "development" && (
            <p className="mt-6 break-words rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error.message}
            </p>
          )}

        </div>

      </div>

    </main>
  );
}