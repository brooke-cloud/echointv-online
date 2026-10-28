"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function GlobalFooter() {
  const pathname = usePathname();

  // The admin CMS has its own application shell and should not inherit
  // public-site navigation furniture.
  if (pathname.startsWith("/admin")) return null;

  return <Footer />;
}
