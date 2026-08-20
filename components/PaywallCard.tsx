import Link from "next/link";

export default function PaywallCard({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="relative -mt-24 pt-28 pb-6 bg-gradient-to-t from-white via-white/95 to-transparent text-center px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-blue-100 shadow-2xl space-y-5 ring-1 ring-blue-500/20">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 text-2xl rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          🔒
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-gray-900">此题目为 Pro 会员专享</h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            免费版仅可体验前 5 道真题。升级 Pro 会员即可解锁全站 100% 大厂高频真题与详细最优题解！
          </p>
        </div>

        <div className="pt-2">
          {isLoggedIn ? (
            <Link
              href="/pricing"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition"
            >
              升级 Pro 会员（$9.9/月）→
            </Link>
          ) : (
            <div className="space-y-2.5">
              <Link
                href="/login"
                className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition"
              >
                立即登录 / 注册 →
              </Link>
              <Link
                href="/pricing"
                className="block text-xs font-medium text-blue-600 hover:underline"
              >
                查看 Pro 会员方案详情
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}