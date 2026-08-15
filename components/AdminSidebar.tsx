"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAdmin } from "@/app/admin/(protected)/actions";

// Admin Sidebar
export default function AdminSidebar() {
  const [isOpen, setIsOpen] =
    useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* 手机 Admin Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 md:hidden">

        {/* Admin 名称 */}
        <Link
          href="/admin"
          onClick={closeMenu}
          className="font-bold text-gray-900"
        >
          FastPrep Admin
        </Link>

        {/* 手机菜单按钮 */}
        <button
          type="button"
          onClick={() =>
            setIsOpen((value) => !value)
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700"
          aria-label="Toggle admin menu"
          aria-expanded={isOpen}
        >
          {isOpen ? "×" : "☰"}
        </button>

      </div>


      {/* 手机 Admin Menu */}
      {isOpen && (
        <div className="border-b border-gray-200 bg-white p-5 md:hidden">

          {/* 手机后台导航 */}
          <nav className="flex flex-col gap-2">

            {/* Dashboard */}
            <Link
              href="/admin"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              Dashboard
            </Link>

            {/* Problems */}
            <Link
              href="/admin/problems"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              Problems
            </Link>

            {/* Blog */}
            <Link
              href="/admin/posts"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              Blog Posts
            </Link>

            {/* Website */}
            <Link
              href="/"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              View Website
            </Link>

            {/* Logout */}
            <form action={logoutAdmin}>
              {/* Logout 按钮 */}
              <button
                type="submit"
                className="w-full rounded-lg px-4 py-3 text-left font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </form>

          </nav>

        </div>
      )}


      {/* Desktop Sidebar */}
      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-gray-200 bg-white md:block">

        {/* Sidebar 内容 */}
        <div className="sticky top-0 flex h-screen flex-col p-6">

          {/* Logo */}
          <div>
            {/* Admin 名称 */}
            <h2 className="text-2xl font-bold text-gray-900">
              FastPrep Admin
            </h2>

            {/* Admin 说明 */}
            <p className="mt-2 text-sm text-gray-500">
              Content Management
            </p>
          </div>


          {/* 导航 */}
          <nav className="mt-10 flex flex-col gap-2">

            {/* Dashboard */}
            <Link
              href="/admin"
              className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
            >
              Dashboard
            </Link>

            {/* Problems */}
            <Link
              href="/admin/problems"
              className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
            >
              Problems
            </Link>

            {/* Blog */}
            <Link
              href="/admin/posts"
              className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
            >
              Blog Posts
            </Link>

            {/* Website */}
            <Link
              href="/"
              className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
            >
              View Website
            </Link>

          </nav>


          {/* Logout */}
          <div className="mt-auto">

            {/* Logout Form */}
            <form action={logoutAdmin}>

              {/* Logout 按钮 */}
              <button
                type="submit"
                className="w-full rounded-lg border border-red-200 px-4 py-3 text-left font-medium text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>

            </form>

          </div>

        </div>

      </aside>
    </>
  );
}