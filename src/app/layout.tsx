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
import { locales, defaultLocale, isValidLocale, Locale } from '@/i18n/settings'; // Import Locale type
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
  let initialLocaleCandidate: Locale;
  if (isValidLocale(urlLocale)) {
    initialLocaleCandidate = urlLocale;
  } else {
    console.warn(`RootLayout: URL locale "${urlLocale}" is invalid or undefined. Using default locale "${defaultLocale}". Middleware should handle redirection.`);
    initialLocaleCandidate = defaultLocale;
  }

  let messages;
  let finalLocaleForRender: Locale; // This will be the locale for <html lang> and NextIntlClientProvider

  try {
    // getMessages internally calls getRequestConfig from i18n.ts
    // The result.locale will be the locale for which messages were actually loaded (could be default if fallback occurred)
    const result = await getMessages({ locale: initialLocaleCandidate });
    messages = result.messages;
    
    // Validate result.locale from getMessages
    if (result.locale && isValidLocale(result.locale)) {
      finalLocaleForRender = result.locale;
    } else {
      console.error(`RootLayout: Received invalid or undefined locale ("${result.locale}") from getMessages, even though initial candidate was "${initialLocaleCandidate}". Falling back to default: "${defaultLocale}".`);
      finalLocaleForRender = defaultLocale;
    }

    // Check if messages object is valid
    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.error(`RootLayout: Messages object for locale "${finalLocaleForRender}" (derived from getMessages result.locale: "${result.locale}") is empty or invalid. This suggests a critical failure in message loading, even fallbacks.`);
      // If messages are empty, we should still try to render with a valid locale string
      // finalLocaleForRender should already be a valid Locale type from the check above.
      // If it somehow wasn't, the hardcoded 'en' below will catch it.
      messages = {}; // Pass empty messages to prevent provider crash, but translations will be missing.
    }
  } catch (error: any) {
    console.error(`RootLayout: Critical failure in getMessages for locale "${initialLocaleCandidate}". Error: ${error.message}. Stack: ${error.stack}`);
    messages = {};
    finalLocaleForRender = defaultLocale; // Fallback to default locale for rendering
  }

  // Final safeguard for finalLocaleForRender before using it in <html> and passing to ClientSideI18n
  if (!isValidLocale(finalLocaleForRender)) {
    console.error(`RootLayout: finalLocaleForRender is STILL invalid ("${finalLocaleForRender}") before rendering. This is a critical state. Using hardcoded '${defaultLocale}'.`);
    finalLocaleForRender = defaultLocale; 
  }


  return (
    <html lang={finalLocaleForRender}>
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

