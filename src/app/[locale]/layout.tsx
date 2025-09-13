/**
 * @fileOverview Root layout for the application with internationalization support.
 * @module LocaleLayout
 * @description This file defines the main HTML shell for the application,
 *              including <html> and <body> tags, global CSS, font setup,
 *              and wraps the application with necessary providers like AuthProvider.
 */

import '../globals.css'; // Adjust the import path if necessary
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HeartWise - Find Your Perfect Match 💖',
  description: 'Connect with like-minded people and find meaningful relationships with HeartWise, the smart dating app.',
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning> {/* Use locale for lang attribute */}
      <head />
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={messages}> {/* Use locale here as well */}
            <AuthProvider> {/* Wrap children with AuthProvider */}
                {children}
            </AuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
