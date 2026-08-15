"use client";

import Link from "next/link";
import { useState } from "react";

// 网站 Navbar
export default function Navbar() {
  const [isOpen, setIsOpen] =
    useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      {/* Navbar 内容 */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="text-xl font-bold text-gray-900"
        >
          FastPrep
        </Link>


        {/* Desktop 导航 */}
        <nav className="hidden items-center gap-8 md:flex">

          {/* Home */}
          <Link
            href="/"
            className="font-medium text-gray-600 transition hover:text-blue-600"
          >
            Home
          </Link>

          {/* Problems */}
          <Link
            href="/problem"
            className="font-medium text-gray-600 transition hover:text-blue-600"
          >
            Problems
          </Link>

          {/* Blog */}
          <Link
            href="/blog"
            className="font-medium text-gray-600 transition hover:text-blue-600"
          >
            Blog
          </Link>

          {/* Contact */}
          <Link
            href="/contact"
            className="font-medium text-gray-600 transition hover:text-blue-600"
          >
            Contact
          </Link>

        </nav>


        {/* 手机菜单按钮 */}
        <button
          type="button"
          onClick={() =>
            setIsOpen((value) => !value)
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <span className="text-2xl leading-none">
              ×
            </span>
          ) : (
            <span className="text-xl leading-none">
              ☰
            </span>
          )}
        </button>

      </div>


      {/* 手机导航 */}
      {isOpen && (
        <nav className="border-t border-gray-200 bg-white px-6 py-4 md:hidden">

          {/* 手机导航内容 */}
          <div className="mx-auto flex max-w-7xl flex-col gap-2">

            {/* Home */}
            <Link
              href="/"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            >
              Home
            </Link>

            {/* Problems */}
            <Link
              href="/problem"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            >
              Problems
            </Link>

            {/* Blog */}
            <Link
              href="/blog"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            >
              Blog
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            >
              Contact
            </Link>

          </div>

        </nav>
      )}

    </header>
  );
}