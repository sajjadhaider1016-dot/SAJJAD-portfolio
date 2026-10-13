import type { Metadata, Viewport } from "next";
import { Geist, Plus_Jakarta_Sans } from "next/font/google";
import { ToastProvider } from "@/components/store/ToastProvider";
import { site } from "@/data/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Sajjad Haider | AI & Full-Stack Developer",
    template: "%s | Sajjad Haider",
  },
  description: "AI & Full-Stack Developer focused on AI chatbots, agents, automation, Next.js, React, Node.js, and Meta account recovery.",
  openGraph: {
    title: "Sajjad Haider | AI & Full-Stack Developer",
    description: "AI chatbots, agents, automation systems, and modern full-stack products by Sajjad Haider.",
    url: site.url,
    type: "website",
    locale: "en_PK",
    siteName: "Sajjad Haider",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070708",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${plusJakarta.variable} h-full antialiased light`}>
      <body className="page-bg min-h-full">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
