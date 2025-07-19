/**
 * @fileOverview Root layout for the application.
 * @module RootLayout
 * @description This file defines the main HTML shell for the application,
 *              including <html> and <body> tags, global CSS, and font setup.
 */

import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HeartWise - Find Your Perfect Match 💖',
  description: 'Connect with like-minded people and find meaningful relationships with HeartWise, the smart dating app.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale="en" messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
