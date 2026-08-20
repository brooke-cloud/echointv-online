import { Metadata } from "next";
import PricingTable from "@/components/PricingTable";
import FAQ from "@/components/FAQ";

export const metadata: Metadata = {
  title: "会员方案与定价",
  description: "选择适合您的 EchoINTV 求职备战方案，解锁大厂高频面试真题与 1 对 1 导师辅导。",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Hero 标题 */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            投资自己的未来，<br />
            <span className="text-blue-600">高效斩获大厂高薪 Offer</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            清晰透明的阶梯定价，从免费刷题到 1 对 1 尊享辅导，助您在秋招与跳槽中脱颖而出。
          </p>
        </div>

        {/* 阶梯定价表格 */}
        <PricingTable />

        {/* 常见问题解答 */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">常见问题解答 (FAQ)</h2>
            <p className="text-sm text-gray-500 mt-2">关于套餐与辅导服务的常见疑问</p>
          </div>
          <FAQ />
        </div>
      </div>
    </div>
  );
}