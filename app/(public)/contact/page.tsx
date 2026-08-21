// app/(public)/contact/page.tsx

import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Echo INTV",
  description:
    "Contact Echo INTV for software engineering interview preparation resources and services.",
  alternates: {
    canonical: "/contact",
  },
};

// Contact 页面
export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white py-12 sm:py-20">
      {/* 页面内容容器（已添加 mx-auto 实现完美居中） */}
      <div className="mx-auto max-w-4xl px-5 sm:px-6 space-y-12">
        
        {/* 背景介绍 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl tracking-tight">
            背景
          </h2>
          
          <div className="space-y-4 text-base leading-relaxed text-gray-700 sm:text-lg sm:leading-8">
            <p>
              当前求职竞争之激烈，大家有目共睹。很多同学在准备阶段就陷入困局：明明拿到了面试，却不知如何系统备战；刷题刷到身心俱疲，临场又因过度紧张而功亏一篑，白白浪费来之不易的机会。以国内同学为例，问题尤为典型——刷题量虽足，但一到英文面试或限时OA就容易卡壳；项目经历写得像产品说明书，讲不清技术选型与个人贡献；八股文背得滚瓜烂熟，系统设计却毫无头绪。
            </p>
            <p>
              随着交流增多，我们发现，很多同学其实足够努力，却始终缺少一条清晰可循的准备路径。具体来看：有人刷题上千，却适应不了限时环境；有人项目丰富，却说不透自己的技术贡献；还有人能力均衡，却在 Coding、BQ 和 System Design 之间无法合理分配精力。而一旦转向外部求助，又常被信息不透明、沟通层级复杂、方案与自身基础脱节等问题困扰，进一步加剧了迷茫和低效。
            </p>
            <p className="font-semibold text-blue-900 bg-blue-50/50 p-4 rounded-xl border border-blue-100/60">
              因此，Echo INTV推出专业的面试辅助服务，通过实时提供文档答案、解题思路，帮助面试者快速通过面试。
            </p>
          </div>
        </section>

        {/* 服务内容 */}
        <section className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl tracking-tight">
            服务内容
          </h2> 
          
          <div className="space-y-4 text-base leading-relaxed text-gray-700 sm:text-lg sm:leading-8">
            <p>
              面试辅助服务，专为线上面试场景设计。当您通过 Zoom、Teams、Google Meet 等平台参与面试时，我们的专业团队会以安全的远程监控形式，密切关注您的面试进程，并在另一台设备或指定平台上适时传递辅助信息。这些信息包括关键要点提醒、回答策略指导、专业知识补充以及语言表达优化，帮助您在高压环境下依然保持思维清晰、表达流畅。
            </p>
            <p>
              我们的辅助内容全面覆盖面试全流程，包含 BQ 问题、项目简历深挖、技术八股、算法 Coding、系统设计等所有常见考察模块。针对项目部分，我们需要您提前提供项目文档，以便团队充分熟悉。
            </p>
            <p>
              服务主要面向北美与国内准备 Intern、New Grad、跳槽或转码的 CS 学生和职场新人，覆盖方向包括 SDE、MLE、DE、DS 等岗位，并兼顾算法题、OOD、系统设计、行为面试和项目深挖等具体环节。
            </p>
            <p>
              除求职面试外，我们也提供课程项目与个人项目辅导，涵盖需求拆解、代码评审、debug、技术选型和部署建议。所有内容都会根据您的个人基础和目标灵活调整，拒绝统一模板。团队支持中英文沟通，并能适配北美、国内及跨时区求职场景。
            </p>
            <p>
              随着经验积累，我们持续整理常见问题、复盘方法和技术资料，力求让每一次服务都更稳定、更清晰、更有针对性。如果你需要专业的面试辅导，欢迎随时联系我们。
            </p>
          </div>
        </section>

        {/* 联系方式 */}
        <section className="pt-4 border-t border-gray-100 grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Email */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-6 sm:p-8 flex flex-col justify-between hover:shadow-sm transition">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Email
              </h2>
              <p className="mt-3 leading-7 text-gray-600">
                Contact us by email for questions and collaboration.
              </p>
            </div>
            
            <div className="mt-5">
              <a
                href="mailto:echointv@gmail.com"
                className="font-medium text-blue-600 hover:underline break-all text-base"
              >
                echointv@gmail.com
              </a>
            </div>
          </div>

          {/* Wechat */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-6 sm:p-8 hover:shadow-sm transition space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              Wechat ：<span className="text-blue-600 font-mono">lububu611</span>
            </h2>

            <p className="text-sm text-gray-600">
              添加微信咨询求职辅导、模拟面试及相关定制服务。
            </p>

            <div className="pt-2">
              <Image
                src="/wechat-qrcode.png"
                alt="微信二维码"
                width={180}
                height={180}
                className="rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
              />
              <span className="mt-3 block text-xs text-gray-500">
                扫码添加微信（备注：Echo INTV 求职咨询）
              </span>
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}