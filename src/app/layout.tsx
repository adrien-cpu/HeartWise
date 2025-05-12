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
import type { ReactNode } from 'react';
import { getMessages, setRequestLocale } from 'next-intl/server'; // Use setRequestLocale for static rendering
import { locales, defaultLocale, isValidLocale, type Locale } from '@/i18n/settings';
import { metadata as appMetadata } from '@/app/metadata';
import { ClientSideI18n } from '@/components/ClientSideI18n';
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

// export const viewport: Viewport = {
//   themeColor: '...',
// }

// Enable static rendering for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * RootLayout component (Server Component).
 * Sets up the basic HTML structure, fonts, fetches i18n messages,
 * and passes locale and messages to the ClientSideI18n boundary.
 *
 * @param {object} props - The props for the RootLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @param {object} props.params - The route parameters.
 * @param {string} props.params.locale - The current locale from the URL.
 * @returns {Promise<JSX.Element>} The rendered RootLayout component.
 */
export default async function RootLayout({
  children,
  params: { locale: rawUrlLocale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Validate the locale from the URL. If invalid, use the default.
  // Middleware should ideally handle redirection for invalid locales.
  const effectiveLocale: Locale = isValidLocale(rawUrlLocale) ? rawUrlLocale : defaultLocale;

  if (!isValidLocale(rawUrlLocale)) {
    console.warn(`[RootLayout] URL locale "${rawUrlLocale}" is invalid. Using default locale "${effectiveLocale}". Middleware should handle redirection.`);
  }

  // Set the locale for the current request. This is necessary for
  // server-side rendering and for `getMessages` to work correctly.
  setRequestLocale(effectiveLocale);

  let messages;
  let actualLocaleForMessages: Locale = effectiveLocale; // Initialize with the current effective locale

  try {
    // getMessages will call the getRequestConfig from your i18n setup.
    // The .locale property in the result from getMessages indicates the locale
    // for which messages were actually loaded (could be default if fallback occurred).
    const result = await getMessages({ locale: effectiveLocale });
    messages = result.messages;

    // Trust the locale returned by getMessages if it's valid, as it reflects fallbacks.
    if (result.locale && isValidLocale(result.locale)) {
      actualLocaleForMessages = result.locale;
    } else {
      console.error(`[RootLayout] Received invalid or undefined locale ("${result.locale}") from getMessages, even though initial candidate was "${effectiveLocale}". Using effectiveLocale: "${effectiveLocale}" for ClientSideI18n.`);
      actualLocaleForMessages = effectiveLocale; // Fallback to the validated URL locale or default
    }

    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.error(`[RootLayout] Messages object for locale "${actualLocaleForMessages}" (derived from getMessages result.locale: "${result.locale}") is empty or invalid. This suggests a critical failure in message loading, even fallbacks.`);
      messages = {}; // Pass empty messages to prevent provider crash; translations will be missing.
    }
  } catch (error: any) {
    console.error(`[RootLayout] Critical failure in getMessages for locale "${effectiveLocale}". Error: ${error.message}.`);
    messages = {}; // Fallback to empty messages
    actualLocaleForMessages = defaultLocale; // Fallback to default locale for rendering
    console.warn(`[RootLayout] Falling back to default locale "${actualLocaleForMessages}" for ClientSideI18n due to message loading error.`);
  }
  
  // Ensure actualLocaleForMessages is a valid Locale type before rendering
  if (!isValidLocale(actualLocaleForMessages)) {
    console.error(`[RootLayout] actualLocaleForMessages is STILL invalid ("${actualLocaleForMessages}") before rendering. This is a critical state. Using hardcoded '${defaultLocale}'.`);
    actualLocaleForMessages = defaultLocale;
  }

  return (
    <html lang={actualLocaleForMessages}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientSideI18n locale={actualLocaleForMessages} messages={messages}>
          {children}
        </ClientSideI18n>
      </body>
    </html>
  );
}
