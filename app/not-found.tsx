import Link from "next/link";

// 全站 404 页面
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">

      {/* 404 内容 */}
      <div className="max-w-xl text-center">

        {/* 状态码 */}
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          404
        </p>

        {/* 标题 */}
        <h1 className="mt-4 text-4xl font-bold text-gray-900 sm:text-5xl">
          Page not found
        </h1>

        {/* 描述 */}
        <p className="mt-5 leading-8 text-gray-600">
          The page you are looking for does not exist or may have been moved.
        </p>

        {/* 操作按钮 */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">

          {/* 返回首页 */}
          <Link
            href="/"
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Back Home
          </Link>

          {/* 查看题库 */}
          <Link
            href="/problem"
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
          >
            Browse Problems
          </Link>

        </div>

      </div>

    </main>
  );
}