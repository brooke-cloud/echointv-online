import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "FastPrep",
    template: "%s | FastPrep",
  },

  description:
    "Software engineering interview preparation platform with coding problems, interview experiences, and technical guides.",

  keywords: [
    "software engineering interview",
    "coding interview",
    "technical interview",
    "leetcode",
    "system design",
    "software engineer",
    "interview preparation",
  ],

  authors: [
    {
      name: "FastPrep",
    },
  ],

  creator: "FastPrep",

  publisher: "FastPrep",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    title: "FastPrep",
    description:
      "Software engineering interview preparation platform.",
    siteName: "FastPrep",
  },

  twitter: {
    card: "summary_large_image",
    title: "FastPrep",
    description:
      "Software engineering interview preparation platform.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

// 网站最外层 Root Layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 网站 Body */}
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}