"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const closeDialog = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <>
      {/* 打开删除确认窗口 */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="font-medium text-red-600 transition hover:text-red-800"
      >
        Delete
      </button>


      {isOpen && (
        <>
          {/* 页面遮罩 */}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close delete confirmation"
            className="fixed inset-0 z-40 cursor-default bg-black/40"
            onClick={closeDialog}
          />

          {/* 删除确认弹窗 */}
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain px-4 py-8 sm:px-6">

            {/* 弹窗内容 */}
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="pointer-events-auto w-full max-w-md rounded-[var(--radius-panel)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-dialog)] sm:p-7"
            >

              {/* 弹窗标题 */}
              <h2 id={titleId} className="text-xl font-bold text-gray-900">
                Delete Confirmation
              </h2>

              {/* 删除提示 */}
              <p id={descriptionId} className="mt-3 leading-7 text-gray-600">
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
                  ref={cancelRef}
                  type="button"
                  onClick={closeDialog}
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
