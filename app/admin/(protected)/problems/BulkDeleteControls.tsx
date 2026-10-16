"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

export const BULK_DELETE_FORM_ID = "bulk-delete-problems";

function DeleteSelectedButton({ selectedCount }: { selectedCount: number }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={!selectedCount || pending} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300">{pending ? "Deleting..." : `Delete selected (${selectedCount})`}</button>;
}

export default function BulkDeleteControls({ action, total }: { action: (formData: FormData) => Promise<void>; total: number }) {
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const getCheckboxes = () => Array.from(document.querySelectorAll<HTMLInputElement>(`input[name="problemIds"][form="${BULK_DELETE_FORM_ID}"]`));
  const syncSelection = () => setSelectedCount(getCheckboxes().filter((checkbox) => checkbox.checked).length);

  useEffect(() => {
    const checkboxes = getCheckboxes();
    checkboxes.forEach((checkbox) => checkbox.addEventListener("change", syncSelection));
    syncSelection();
    return () => checkboxes.forEach((checkbox) => checkbox.removeEventListener("change", syncSelection));
  }, [total]);

  const allSelected = total > 0 && selectedCount === total;
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = selectedCount > 0 && !allSelected;
  }, [allSelected, selectedCount]);

  const toggleAll = (checked: boolean) => {
    getCheckboxes().forEach((checkbox) => { checkbox.checked = checked; });
    syncSelection();
  };

  return <form id={BULK_DELETE_FORM_ID} action={action} onSubmit={(event) => { if (!selectedCount || !window.confirm(`Delete ${selectedCount} selected problem${selectedCount === 1 ? "" : "s"}? This action cannot be undone.`)) event.preventDefault(); }} className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700"><input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={(event) => toggleAll(event.target.checked)} disabled={!total} className="h-4 w-4 rounded border-gray-300 text-blue-600" />Select all {total} problems</label>
    <div className="flex items-center gap-3"><span className="text-sm text-gray-500">{selectedCount} selected</span><DeleteSelectedButton selectedCount={selectedCount} /></div>
  </form>;
}
