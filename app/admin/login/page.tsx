import { loginAdmin } from "./actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",

  robots: {
    index: false,
    follow: false,
  },
};


type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

// Admin 登录页面
export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      {/* 登录卡片 */}
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

        {/* 页面标题 */}
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Login
        </h1>

        {/* 页面说明 */}
        <p className="mt-3 text-gray-600">
          Sign in to manage Echo INTV content.
        </p>

        {error === "invalid" && (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Invalid email or password.
          </div>
        )}

        {/* 登录表单 */}
        <form
          action={loginAdmin}
          className="mt-8 space-y-6"
        >

          {/* Email */}
          <div>
            {/* Email 标题 */}
            <label
              htmlFor="email"
              className="font-medium text-gray-900"
            >
              Email
            </label>

            {/* Email 输入框 */}
            <input
              id="email"
              name="email"
              type="email"
              required
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                outline-none
                transition
                focus:border-blue-600
                focus:ring-2
                focus:ring-blue-100
              "
            />
          </div>

          {/* Password */}
          <div>
            {/* Password 标题 */}
            <label
              htmlFor="password"
              className="font-medium text-gray-900"
            >
              Password
            </label>

            {/* Password 输入框 */}
            <input
              id="password"
              name="password"
              type="password"
              required
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                outline-none
                transition
                focus:border-blue-600
                focus:ring-2
                focus:ring-blue-100
              "
            />
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            className="
              w-full
              rounded-xl
              bg-blue-600
              px-5
              py-3
              font-medium
              text-white
              transition
              hover:bg-blue-700
            "
          >
            Login
          </button>

        </form>

      </div>
    </main>
  );
}