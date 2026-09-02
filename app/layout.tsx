import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sajjad Haider | AI Developer & Full-Stack Builder',
  description: 'Portfolio of Sajjad Haider — AI developer and full-stack builder creating practical AI applications, web products and digital experiences.',
  metadataBase: new URL('https://portfolio-orpin-omega-64.vercel.app'),
  openGraph: {
    title: 'Sajjad Haider | AI Developer & Full-Stack Builder',
    description: 'Practical AI applications, full-stack products and digital systems.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
