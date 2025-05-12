/**
 * @fileOverview Root layout for the application.
 * @module RootLayout
 * @description This file defines the main layout structure for all pages,
 *              including HTML, body, font setup, and internationalization providers.
 *              It ensures that server-side fetched i18n messages are passed
 *              to a client boundary for client-side provider initialization.
 */

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ReactNode } from 'react';
import { getMessages } from 'next-intl/server';
import { locales, defaultLocale, isValidLocale } from '@/i18n/settings';
import { metadata as appMetadata } from '@/app/metadata';
import { ClientSideI18n } from '@/components/ClientSideI18n'; // Client boundary for providers
import './globals.css';

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
  params: { locale: urlLocale }, // Renamed for clarity
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Determine initial locale based on URL, fallback to default
  let initialLocaleCandidate = isValidLocale(urlLocale) ? urlLocale : defaultLocale;

  if (!isValidLocale(urlLocale)) {
    // This log indicates an issue potentially upstream (middleware)
    // Avoid calling notFound() here in the root layout, as it's not allowed.
    console.warn(`RootLayout: URL locale "${urlLocale}" is invalid or undefined. Using default locale "${initialLocaleCandidate}". Middleware should handle redirection.`);
  }

  let messages;
  let finalLocaleForRender; // This will be the locale for <html lang> and NextIntlClientProvider

  try {
    // getMessages internally calls getRequestConfig from i18n.ts
    // The result.locale will be the locale for which messages were actually loaded (could be default if fallback occurred)
    const result = await getMessages({ locale: initialLocaleCandidate });
    messages = result.messages;
    finalLocaleForRender = result.locale; // Use the locale returned by getRequestConfig

    // This check is important: even if getRequestConfig returns a locale, messages might be empty if all loading failed.
    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.error(`RootLayout: Messages object for locale "${finalLocaleForRender}" (from getRequestConfig) is empty or invalid. This suggests a critical failure in message loading, even fallbacks.`);
      // If messages are truly empty, we have a big problem.
      // We'll stick with defaultLocale for lang and pass empty messages to provider.
      // The provider or components might show missing translation warnings.
      finalLocaleForRender = defaultLocale; // Ensure lang attribute is at least a valid default
      messages = {}; // Pass empty messages to prevent provider crash
      console.error(`RootLayout: Using default locale "${defaultLocale}" for rendering due to critical message loading failure.`);
    }
  } catch (error: any) {
    // This catch handles errors during the getMessages call itself (e.g., if i18n.ts throws)
    console.error(`RootLayout: Critical failure in getMessages for locale "${initialLocaleCandidate}". Error: ${error.message}`);
    messages = {}; // Provide empty messages
    finalLocaleForRender = defaultLocale; // Fallback to default locale for rendering
  }

  return (
    <html lang={finalLocaleForRender}> {/* Use the locale for which messages were actually obtained/intended */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/*
          Pass locale and server-loaded messages to the Client Boundary Component.
          ClientSideI18n will use these to set up NextIntlClientProvider and AuthProvider.
        */}
        <ClientSideI18n locale={finalLocaleForRender} messages={messages}>
          {children}
        </ClientSideI18n>
      </body>
    </html>
  );
}
