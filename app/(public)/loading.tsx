// 前台 Loading 页面
export default function PublicLoading() {
  return (
    <main className="min-h-[70vh] bg-white">

      {/* Loading 内容 */}
      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* 页面标题骨架 */}
        <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200" />

        {/* 页面描述骨架 */}
        <div className="mt-5 h-5 w-full max-w-xl animate-pulse rounded bg-gray-200" />

        {/* 卡片骨架 */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {Array.from({
            length: 6,
          }).map((_, index) => (

            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              {/* 小标签骨架 */}
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />

              {/* 标题骨架 */}
              <div className="mt-5 h-7 w-3/4 animate-pulse rounded bg-gray-200" />

              {/* 内容骨架 */}
              <div className="mt-5 space-y-3">

                {/* 第一行 */}
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />

                {/* 第二行 */}
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />

                {/* 第三行 */}
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />

              </div>
            </div>

          ))}

        </div>

      </div>

    </main>
  );
}