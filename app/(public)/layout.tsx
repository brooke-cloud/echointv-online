



type PublicLayoutProps = {
  children: React.ReactNode;
};

// 前台统一 Layout
export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 前台页面主体 */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}