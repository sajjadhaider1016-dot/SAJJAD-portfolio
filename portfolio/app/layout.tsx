import type { Metadata, Viewport } from "next";
import "./styles.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,600;1,700&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
