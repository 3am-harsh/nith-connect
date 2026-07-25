import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NITH Connect - Campus App',
  description: 'The digital student companion for NIT Hamirpur. Mess menus, ID card, marketplace, blogs, and campus discussions.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  }
};

export const viewport = {
  themeColor: '#2a9d8f',
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
