
import Link from "next/link";

// 网站 Footer
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">

      {/* Footer 内容 */}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">

        {/* Footer 主体 */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          {/* 品牌区域 */}
          <div>

            {/* 网站名称 */}
            <Link
              href="/"
              className="text-xl font-bold text-gray-900"
            >
              FastPrep
            </Link>

            {/* 网站说明 */}
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
              Software engineering interview preparation,
              coding problems, and interview experiences.
            </p>

          </div>

          {/* Footer 导航 */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">

            {/* Home */}
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              Home
            </Link>

            {/* Problems */}
            <Link
              href="/problem"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              Problems
            </Link>

            {/* Blog */}
            <Link
              href="/blog"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              Blog
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              Contact
            </Link>

          </div>

        </div>

        {/* Footer 底部 */}
        <div className="mt-8 border-t border-gray-200 pt-6">

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} FastPrep. All rights reserved.
          </p>

        </div>

      </div>

    </footer>
  );
}