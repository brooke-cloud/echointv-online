// Admin Loading
export default function AdminLoading() {
  return (
    <main className="py-12">

      {/* Admin Loading 容器 */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6">

        {/* 标题 */}
        <div className="h-10 w-56 animate-pulse rounded-lg bg-gray-200" />

        {/* 统计卡片 */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {Array.from({
            length: 4,
          }).map((_, index) => (

            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              {/* 名称 */}
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />

              {/* 数字 */}
              <div className="mt-5 h-10 w-20 animate-pulse rounded bg-gray-200" />

            </div>

          ))}

        </div>

        {/* 内容骨架 */}
        <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {Array.from({
            length: 2,
          }).map((_, index) => (

            <div
              key={index}
              className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white"
            />

          ))}

        </div>

      </div>

    </main>
  );
}