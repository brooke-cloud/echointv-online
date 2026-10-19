"use client";

import { useActionState } from "react";
import { updatePaywallSetting } from "@/app/admin/(protected)/actions";

export default function PaywallToggle({ enabled }: { enabled: boolean }) {
  const [, action, pending] = useActionState(async (_state: null, formData: FormData) => {
    await updatePaywallSetting(formData);
    return null;
  }, null);

  return (
    <form action={action} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-gray-400"}`} />
          <p className="font-bold text-gray-900">
            {enabled ? "付费墙已开启" : "全站内容已免费"}
          </p>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          {enabled
            ? "付费题目答案和面经文章需要有效的 Pro 会员才能查看。"
            : "所有访客无需购买 Pro 会员，即可查看全部题目和文章内容。"}
        </p>
      </div>

      <input type="hidden" name="enabled" value={String(!enabled)} />
      <button
        type="submit"
        disabled={pending}
        className={`min-w-48 rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-wait disabled:opacity-60 ${enabled ? "bg-gray-700 hover:bg-gray-800" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {pending ? "正在保存..." : enabled ? "关闭付费墙，全部免费" : "开启付费墙"}
      </button>
    </form>
  );
}
