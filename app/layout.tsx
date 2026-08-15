import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "FastPrep - Software Engineering Interview Preparation",
    template: "%s | FastPrep",
  },

  description:
    "Practice software engineering interview problems, read interview experiences, and prepare for technical interviews.",

  keywords: [
    "software engineering interview",
    "coding interview",
    "technical interview",
    "LeetCode",
    "software engineer",
    "interview preparation",
    "FastPrep",
  ],

  openGraph: {
    title: "FastPrep - Software Engineering Interview Preparation",
    description:
      "Prepare smarter for software engineering interviews with real interview problems and experiences.",
    url: siteUrl,
    siteName: "FastPrep",
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
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}