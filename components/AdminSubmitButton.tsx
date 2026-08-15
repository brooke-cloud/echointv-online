"use client";

import { useFormStatus } from "react-dom";

type AdminSubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
};

// Admin 表单提交按钮
export default function AdminSubmitButton({
  children,
  pendingText = "Saving...",
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="
        rounded-xl
        bg-blue-600
        px-6
        py-3
        font-medium
        text-white
        transition
        hover:bg-blue-700
        disabled:cursor-not-allowed
        disabled:bg-blue-400
      "
    >
      {pending ? pendingText : children}
    </button>
  );
}