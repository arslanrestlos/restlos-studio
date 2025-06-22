import type { Metadata } from 'next';
import { Roboto_Condensed } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const robotoCondensed = Roboto_Condensed({
  variable: '--font-roboto-condensed',
  subsets: ['latin'],
  weight: ['300', '400', '700'], // Light, Regular, Bold
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RESTLOS Studio',
  description: 'Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${robotoCondensed.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
