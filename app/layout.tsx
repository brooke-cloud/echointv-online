import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.Echo INTV.shop";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Echo INTV - Software Engineering Interview Preparation",
    template: "%s | Echo INTV",
  },

  description:
    "Practice software engineering interview problems, read interview experiences, and prepare for technical interviews.",


  verification: {
    google: "nBGCCY_cRfwqRsOhGBJRZkcddyWlxbjt-jAhViY-n7A",
  },


  keywords: [
    "software engineering interview",
    "coding interview",
    "technical interview",
    "LeetCode",
    "software engineer",
    "interview preparation",
    "Echo INTV",
  ],

  openGraph: {
    title: "Echo INTV - Software Engineering Interview Preparation",
    description:
      "Prepare smarter for software engineering interviews with real interview problems and experiences.",
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
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}