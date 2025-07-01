/**
 * @fileOverview Root layout for the application.
 * @module RootLayout
 * @description This file defines the main HTML shell for the application,
 *              including <html> and <body> tags, global CSS, and font setup.
 */

import './globals.css'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata = {
  title: 'HeartWise - Trouvez des connexions significatives',
  description: 'Une application de rencontres intelligente qui vous aide à trouver des connexions significatives.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider locale="en" messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
