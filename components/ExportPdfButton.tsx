"use client";
import { useState } from "react";
import { FileDown } from "lucide-react";
interface ExportPdfButtonProps {
  title: string;
}
export default function ExportPdfButton({ title }: ExportPdfButtonProps) {
  const [exporting, setExporting] = useState(false);
  const handleExport = () => {
    if (exporting) return;
    setExporting(true);
    const originalTitle = document.title;
    document.title = title;
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.title = originalTitle;
        setExporting(false);
      }, 1000);
    }, 100);
  };
  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="print:hidden inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FileDown className="h-4 w-4" />
      <span>{exporting ? "正在准备 PDF..." : "导出 PDF"}</span>
    </button>
  );
}