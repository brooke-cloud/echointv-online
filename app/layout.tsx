import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.echointv.shop";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Echo INTV – Software Engineering Interview Preparation",
    template: "%s | Echo INTV",
  },

  description:
    "Practice solving software engineering interview questions, read various interview experiences, and prepare yourself for technical interviews.",

  verification: {
    google: "nBGCCY_cRfwqRsOhGBJRZkcddyWlxbjt-jAhViY-n7A",
  },

  keywords: [
    "软件工程面试",
    "编码面试",
    "技术面试",
    "LeetCode",
    "软件工程师",
    "面试准备",
    "Echo INTV",
  ],

  openGraph: {
    title: "Echo INTV - Preparation for Software Engineering Interviews",
    description:
      "准备好应对软件工程相关面试，通过实际的面试问题和经验来提升自己的能力。",
    url: siteUrl,
    siteName: "Echo INTV",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Google Analytics 统计代码（仅在配置了 NEXT_PUBLIC_GA_ID 时加载） */}
        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        <Navbar />
        {children}
      </body>
    </html>
  );
}