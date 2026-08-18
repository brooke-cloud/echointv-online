"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyButtonProps = {
  text: string;
};

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800/80 px-2.5 py-1 text-xs font-medium text-gray-300 backdrop-blur transition hover:border-gray-500 hover:bg-gray-700 hover:text-white"
      title="复制代码"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 text-gray-400" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}