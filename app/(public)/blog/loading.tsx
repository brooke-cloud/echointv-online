// Blog 页面 Loading
export default function BlogLoading() {
  return (
    <main className="bg-white py-16">

      {/* Loading 容器 */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6">

        {/* 标题 */}
        <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200" />

        {/* 描述 */}
        <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-gray-200" />

        {/* Blog 卡片 */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {Array.from({
            length: 6,
          }).map((_, index) => (

            <div
              key={index}
              className="rounded-2xl border border-gray-200 p-7"
            >

              {/* 分类 */}
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />

              {/* 标题 */}
              <div className="mt-5 h-7 w-full animate-pulse rounded bg-gray-200" />

              {/* 第二行标题 */}
              <div className="mt-2 h-7 w-3/4 animate-pulse rounded bg-gray-200" />

              {/* 描述 */}
              <div className="mt-5 space-y-3">

                {/* 第一行 */}
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />

                {/* 第二行 */}
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}