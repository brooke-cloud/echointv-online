

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",

  description:
    "Contact FastPrep for software engineering interview preparation resources and services.",

  alternates: {
    canonical: "/contact",
  },
};

// Contact 页面
export default function ContactPage() {
  return (
    <main className="bg-white py-12 sm:py-16">

      {/* 页面内容容器 */}
      <div className="mx-auto max-w-4xl px-5 sm:px-6">

        {/* 页面 Header */}
        <section className="mx-auto max-w-2xl text-center">

          {/* 页面标题 */}
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Contact FastPrep
          </h1>

          {/* 页面说明 */}
          <p className="mt-5 text-base leading-8 text-gray-600 sm:text-lg">
            Have questions about interview preparation, problems,
            blog content, or our services? Feel free to contact us.
          </p>

        </section>

        {/* 联系方式 */}
        <section className="mt-12 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-2">

          {/* Email */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">

            {/* 联系方式标题 */}
            <h2 className="text-xl font-bold text-gray-900">
              Email
            </h2>

            {/* 联系方式说明 */}
            <p className="mt-3 leading-7 text-gray-600">
              Contact us by email for questions and collaboration.
            </p>

            {/* Email 地址 */}
            <p className="mt-5 break-all font-medium text-blue-600">
              contact@fastprep.com
            </p>

          </div>

          {/* Services */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">

            {/* 服务标题 */}
            <h2 className="text-xl font-bold text-gray-900">
              Interview Preparation
            </h2>

            {/* 服务说明 */}
            <p className="mt-3 leading-7 text-gray-600">
              Contact us for interview preparation, coding practice,
              mock interviews, and other related services.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}