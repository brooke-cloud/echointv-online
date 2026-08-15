import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type PublicLayoutProps = {
  children: React.ReactNode;
};

// 前台统一 Layout
export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">

      {/* 前台 Navbar */}
      <Navbar />

      {/* 前台页面主体 */}
      <div className="flex-1">
        {children}
      </div>

      {/* 前台 Footer */}
      <Footer />

    </div>
  );
}