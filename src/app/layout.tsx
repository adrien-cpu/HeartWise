
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
import { getMessages, setRequestLocale } from 'next-intl/server';
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
  // Determine the effective locale
  const effectiveLocale: Locale = isValidLocale(rawUrlLocale) ? rawUrlLocale : defaultLocale;

  // Warn if the URL locale was invalid but allow `effectiveLocale` to proceed
  if (rawUrlLocale && !isValidLocale(rawUrlLocale)) {
    console.warn(`[RootLayout] URL locale "${rawUrlLocale}" is invalid or not directly supported. Using default locale "${effectiveLocale}". Middleware should typically handle redirection for completely unsupported locales.`);
  }

  // Set the request locale for server-side i18n utilities like getMessages()
  // This is crucial for getMessages() to pick up the correct locale context.
  setRequestLocale(effectiveLocale);

  let messagesPayload;
  let messagesForClient;
  let localeForClient: Locale = defaultLocale; // Fallback to defaultLocale

  try {
    // getMessages() will use the locale set by setRequestLocale.
    messagesPayload = await getMessages(); // No need to pass locale explicitly if setRequestLocale is used

    // Validate the locale returned by getMessages against our supported locales.
    // messagesPayload.locale should ideally match effectiveLocale or defaultLocale if a fallback occurred within getRequestConfig.
    if (messagesPayload && messagesPayload.locale && isValidLocale(messagesPayload.locale)) {
      localeForClient = messagesPayload.locale;
    } else {
      console.error(`[RootLayout] Received invalid or undefined locale ("${messagesPayload?.locale}") from getMessages. Defaulting to "${defaultLocale}" for client. Effective locale was "${effectiveLocale}".`);
      localeForClient = defaultLocale; // Ensure a valid locale is passed to client
    }

    // Ensure messages is a valid object, defaulting to empty if issues.
    if (messagesPayload && typeof messagesPayload.messages === 'object' && messagesPayload.messages !== null) {
      messagesForClient = messagesPayload.messages;
      if (Object.keys(messagesForClient).length === 0) {
        console.warn(`[RootLayout] Messages object for locale "${localeForClient}" (from getMessages result) is empty. This might indicate missing translations or a loading issue in getRequestConfig.`);
      }
    } else {
      console.error(`[RootLayout] Messages object from getMessages for locale "${localeForClient}" is missing or not an object. Using empty messages for client.`);
      messagesForClient = {};
    }

  } catch (error: any) {
    console.error(`[RootLayout] Critical failure in getMessages or processing its result for effective locale "${effectiveLocale}". Error: ${error.message}.`);
    messagesForClient = {}; // Fallback to empty messages
    localeForClient = defaultLocale; // Fallback to default locale
    console.warn(`[RootLayout] Falling back to default locale "${localeForClient}" and empty messages for ClientSideI18n due to catastrophic message loading error.`);
  }
  
  // Final sanity check for the lang attribute for <html> tag
  const langForHtml = isValidLocale(localeForClient) ? localeForClient : defaultLocale;

  return (
    <html lang={langForHtml}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientSideI18n locale={localeForClient} messages={messagesForClient}>
          {children}
        </ClientSideI18n>
      </body>
    </html>
  );
}
