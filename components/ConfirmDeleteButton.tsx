"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

type ConfirmDeleteButtonProps = {
  action: () => Promise<void>;
  itemName?: string;
};

// 删除提交按钮
function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="
        rounded-xl
        bg-red-600
        px-5
        py-2.5
        font-medium
        text-white
        transition
        hover:bg-red-700
        disabled:cursor-not-allowed
        disabled:bg-red-400
      "
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}


// 删除确认组件
export default function ConfirmDeleteButton({
  action,
  itemName = "this item",
}: ConfirmDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 打开删除确认窗口 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="font-medium text-red-600 transition hover:text-red-800"
      >
        Delete
      </button>


      {isOpen && (
        <>
          {/* 页面遮罩 */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          {/* 删除确认弹窗 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">

            {/* 弹窗内容 */}
            <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">

              {/* 弹窗标题 */}
              <h2 className="text-xl font-bold text-gray-900">
                Delete Confirmation
              </h2>

              {/* 删除提示 */}
              <p className="mt-3 leading-7 text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-medium text-gray-900">
                  {itemName}
                </span>
                ? This action cannot be undone.
              </p>


              {/* 操作按钮区域 */}
              <div className="mt-7 flex justify-end gap-3">

                {/* 取消删除 */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-5
                    py-2.5
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-50
                  "
                >
                  Cancel
                </button>

                {/* 执行删除 */}
                <form action={action}>
                  {/* 删除按钮 */}
                  <DeleteSubmitButton />
                </form>

              </div>

            </div>

          </div>
        </>
      )}
    </>
  );
}