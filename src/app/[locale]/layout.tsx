
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
import '../globals.css'; // Corrected import path

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
  let effectiveLocale: Locale;

  if (isValidLocale(rawUrlLocale)) {
    effectiveLocale = rawUrlLocale;
  } else {
    console.warn(`[RootLayout] URL locale "${rawUrlLocale}" is invalid or not directly supported. Using default locale "${defaultLocale}". Middleware should handle redirection for completely unsupported locales.`);
    effectiveLocale = defaultLocale;
  }

  // Set the request locale for server-side i18n utilities like getMessages()
  setRequestLocale(effectiveLocale);

  let messagesForClient: AbstractIntlMessages;
  const localeForClient: Locale = effectiveLocale; // The locale we intend to use for the client

  try {
    // getMessages() will use the locale set by setRequestLocale.
    // It directly returns the messages object for the effectiveLocale.
    const loadedMessages = await getMessages(); 

    if (loadedMessages && typeof loadedMessages === 'object' && Object.keys(loadedMessages).length > 0) {
      messagesForClient = loadedMessages;
    } else {
      // This case means getMessages() returned empty or invalid messages for the 'effectiveLocale'
      console.error(`[RootLayout] Messages object from getMessages for locale "${effectiveLocale}" is missing, empty, or not an object. Using empty messages for client. This might indicate a problem with the JSON files or the import in getRequestConfig.`);
      messagesForClient = {}; // Fallback to empty messages
    }

  } catch (error: any) {
    console.error(`[RootLayout] Critical failure in getMessages for effective locale "${effectiveLocale}". Error: ${error.message}.`);
    messagesForClient = {}; // Fallback to empty messages
    console.warn(`[RootLayout] Falling back to empty messages for ClientSideI18n due to catastrophic message loading error for locale "${localeForClient}".`);
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

