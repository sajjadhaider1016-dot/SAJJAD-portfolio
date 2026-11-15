import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./styles.css";

const inter = localFont({ src: "../public/fonts/inter.woff2", display: "swap", variable: "--font-inter", weight: "100 900" });
const geistMono = localFont({ src: "../public/fonts/geist-mono.woff2", display: "swap", variable: "--font-geist-mono", weight: "100 900" });
const playfair = localFont({
  src: [
    { path: "../public/fonts/playfair-display-latin.woff2", weight: "400 900", style: "normal" },
    { path: "../public/fonts/playfair-display-italic-latin.woff2", weight: "400 900", style: "italic" },
  ],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sajjad-haider-portfolio.vercel.app"),
  applicationName: "Sajjad Haider Portfolio",
  title: "Sajjad Haider — AI & Full-Stack Developer",
  description:
    "Portfolio of Sajjad Haider, an AI engineer and full-stack developer building AI applications, intelligent agents, business automation, and web products.",
  alternates: { canonical: "/" },
  keywords: ["Sajjad Haider", "AI Engineer", "Full-Stack Developer", "AI Automation", "AI Applications", "Web Development"],
  authors: [{ name: "Sajjad Haider", url: "https://sajjad-haider-portfolio.vercel.app" }],
  creator: "Sajjad Haider",
  publisher: "Sajjad Haider",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    title: "Sajjad Haider — AI & Full-Stack Developer",
    description: "AI applications, intelligent agents, workflow automation, and web products by Sajjad Haider.",
    type: "website",
    url: "https://sajjad-haider-portfolio.vercel.app/",
    siteName: "Sajjad Haider Portfolio",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Sajjad Haider — AI Engineer and Full-Stack Developer" }],
  },
  twitter: { card: "summary_large_image", title: "Sajjad Haider — AI & Full-Stack Developer", description: "AI applications, intelligent agents, workflow automation, and web products.", images: ["/opengraph-image"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f0e8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
