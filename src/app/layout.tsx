/**
 * @fileOverview Root layout for the application.
 * @module RootLayout
 * @description This file defines the main layout structure for all pages,
 *              including HTML, body, font setup, and internationalization providers.
 *              It ensures that server-side fetched i18n messages are passed
 *              to a client boundary for client-side provider initialization.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ReactNode } from 'react';
import { getMessages } from 'next-intl/server';
import { defaultLocale, isValidLocale } from '@/i18n/settings';
import { metadata as appMetadata } from '@/app/metadata';
import { ClientSideI18n } from '@/components/ClientSideI18n'; // Client boundary for providers
import './globals.css';
import Footer from '@/components/Footer';
import GlobalLanguageSwitcher from '@/components/GlobalLanguageSwitcher';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = appMetadata;

// Optional: Define viewport settings if needed
// export const viewport: Viewport = {
//   themeColor: '...',
// }

/**
 * RootLayout component (Server Component).
 * Sets up the basic HTML structure, fonts, fetches i18n messages,
 * and passes locale and messages to the ClientSideI18n boundary
 * for client-side context setup (NextIntlClientProvider and AuthProvider).
 *
 * @param {object} props - The props for the RootLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @param {object} props.params - The route parameters.
 * @param {string} props.params.locale - The current locale from the URL.
 * @returns {Promise<JSX.Element>} The rendered RootLayout component.
 */
export default async function RootLayout({
  children,
  params: { locale }, // Receive locale from params
}: {
  children: ReactNode;
  params: { locale: string };
}): Promise<JSX.Element> {
  // Validate locale or use default. Middleware should ideally handle this.
  const effectiveLocale = isValidLocale(locale) ? locale : defaultLocale;

  if (!isValidLocale(locale)) {
    // Log removed: The error message "RootLayout received potentially invalid locale"
    // indicates an issue potentially upstream (middleware or routing), but the
    // fallback mechanism below ensures the app uses the default locale.
    // Removing the log cleans the console while the fallback ensures functionality.
  }

  // Fetch messages for the effective locale on the server.
  let messages;
  try {
    messages = await getMessages({ locale: effectiveLocale });
    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      // This case means messages were "loaded" but are empty or invalid.
      console.error(`Critical error: Messages object for locale "${effectiveLocale}" is empty or invalid after loading attempt.`);
      // Attempt to load default locale messages as a hard fallback
      if (effectiveLocale !== defaultLocale) {
        console.warn(`Attempting to load messages for default locale: "${defaultLocale}" as a fallback.`);
        messages = await getMessages({ locale: defaultLocale });
        if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
          throw new Error(`Fallback default locale messages ("${defaultLocale}") are also missing, empty, or invalid.`);
        }
      } else {
        throw new Error(`Default locale messages ("${defaultLocale}") are missing, empty, or invalid.`);
      }
    }
  } catch (error: any) {
    console.error(`Failed to load messages in RootLayout for locale "${effectiveLocale}" (or fallback):`, error.message);
    // Critical error, i18n won't work properly.
    // Render children within a basic HTML structure, and ClientSideI18n will handle the error display.
    // Passing null or an empty messages object to ClientSideI18n will trigger its internal error handling.
    messages = {}; // Pass empty messages to indicate failure to ClientSideI18n
  }

  return (
    <html lang={effectiveLocale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientSideI18n locale={effectiveLocale} messages={messages}>
          <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="w-full flex items-center justify-end bg-background border-b border-border px-4 py-2">
              <GlobalLanguageSwitcher />
            </header>
            {/* Contenu principal */}
            <main className="flex-1 flex flex-col items-center justify-center">
              <div className="max-w-5xl w-full mx-auto">
                {children}
              </div>
            </main>
            {/* Footer */}
            <Footer />
          </div>
        </ClientSideI18n>
      </body>
    </html>
  );
}
