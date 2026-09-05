import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import CapyWalker from '@/app/components/CapyWalker';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tu Nombre — Software Engineer & Sound Explorer',
  description: 'Portfolio personal de ingeniería de software, blockchain y música electrónica.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#060f1e] text-slate-100">
        {children}
        <CapyWalker />
      </body>
    </html>
  );
}
