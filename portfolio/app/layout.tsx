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
  title: "Sajjad Haider — AI & Full-Stack Developer",
  description:
    "Sajjad Haider is an AI and full-stack developer building web applications, AI tools, and workflow automation.",
  openGraph: {
    title: "Sajjad Haider — AI & Full-Stack Developer",
    description: "Selected web applications, AI tools, and software projects by Sajjad Haider.",
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
    <html lang="en" className={`${inter.variable} ${geistMono.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
