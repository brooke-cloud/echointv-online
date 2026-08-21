// app/admin/(protected)/layout.tsx

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 直接放行，由外层统一鉴权，不再进行二次拦截
  return <>{children}</>;
}