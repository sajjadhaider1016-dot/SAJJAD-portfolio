import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./styles.css";

const geist = localFont({ src: "../public/fonts/geist.woff2", display: "swap", variable: "--font-geist", weight: "100 900" });
const inter = localFont({ src: "../public/fonts/inter.woff2", display: "swap", variable: "--font-inter", weight: "100 900" });
const geistMono = localFont({ src: "../public/fonts/geist-mono.woff2", display: "swap", variable: "--font-geist-mono", weight: "100 900" });

export const metadata: Metadata = {
  title: "Sajjad Haider — AI & Full-Stack Developer",
  description:
    "Explore Sajjad Haider’s illustrated architectural portfolio: AI applications, automation systems, and thoughtful full-stack products.",
  openGraph: {
    title: "Sajjad Haider — AI & Full-Stack Developer",
    description: "A portfolio you can walk through.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f0e8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
