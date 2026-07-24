import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NITH Connect - Campus App',
  description: 'The digital student companion for NIT Hamirpur. Mess menus, ID card, marketplace, blogs, and campus discussions.',
  icons: {
    icon: '/favicon.ico',
  }
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
