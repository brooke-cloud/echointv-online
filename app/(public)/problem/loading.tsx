// Problem 页面 Loading
export default function ProblemLoading() {
  return (
    <main className="bg-white py-16">

      {/* Loading 容器 */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6">

        {/* 标题 */}
        <div className="h-10 w-72 animate-pulse rounded-lg bg-gray-200" />

        {/* 描述 */}
        <div className="mt-4 h-5 w-full max-w-lg animate-pulse rounded bg-gray-200" />

        {/* 搜索框 */}
        <div className="mt-10 h-12 w-full animate-pulse rounded-xl bg-gray-200" />

        {/* Problem 卡片 */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {Array.from({
            length: 6,
          }).map((_, index) => (

            <div
              key={index}
              className="rounded-2xl border border-gray-200 p-6"
            >

              {/* 标签 */}
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />

              {/* 标题 */}
              <div className="mt-5 h-7 w-2/3 animate-pulse rounded bg-gray-200" />

              {/* 内容 */}
              <div className="mt-4 space-y-3">

                {/* 第一行 */}
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />

                {/* 第二行 */}
                <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}