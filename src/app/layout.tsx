/**
 * @fileOverview Root layout for the application.
 * @module RootLayout
 * @description This file defines the main HTML shell for the application,
 *              including <html> and <body> tags, global CSS, and font setup.
 *              Locale-specific providers and message loading are handled by the nested `src/app/[locale]/layout.tsx`.
 */

import { Geist } from 'next/font/google';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from '@/i18n';
import { AuthProvider } from '@/contexts/AuthContext';
import '../app/globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'HeartWise - Trouvez des connexions significatives',
  description: 'Une application de rencontres intelligente qui vous aide à trouver des connexions significatives.',
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
              <Toaster />
              <Sonner />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
