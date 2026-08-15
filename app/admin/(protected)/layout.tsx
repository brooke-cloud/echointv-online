import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

type ProtectedAdminLayoutProps = {
  children: React.ReactNode;
};

// Admin 后台 Layout
export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  const loggedIn =
    await isAdminLoggedIn();

  if (!loggedIn) {
    redirect(
      "/admin/login"
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:flex">

      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Admin 页面 */}
      <div className="min-w-0 flex-1">
        {children}
      </div>

    </div>
  );
}