import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import CapyWalker from '@/app/components/CapyWalker';
import ParrotFlyer from '@/app/components/ParrotFlyer';

const bricolage = Bricolage_Grotesque({ variable: '--font-bricolage', subsets: ['latin'] });
const jetbrains = JetBrains_Mono({ variable: '--font-jetbrains', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tu Nombre — Software Engineer & Sound Explorer',
  description: 'Personal portfolio of software engineering, blockchain and electronic music.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink font-sans">
        {children}
        <CapyWalker />
        <ParrotFlyer />
      </body>
    </html>
  );
}
