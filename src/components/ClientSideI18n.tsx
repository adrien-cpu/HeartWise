/**
 * @fileOverview Client-side internationalization setup.
 * @module ClientSideI18n
 * @description This component acts as a client-side boundary. It initializes
 *              NextIntlClientProvider for internationalization.
 *              It receives locale and messages from server components (e.g., LocaleLayout).
 */
"use client"; // This component MUST be a client component

import type { ReactNode } from 'react';
import React, { useEffect } from 'react'; // Import useEffect
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
// SidebarProvider and AuthProvider are now in the root layout (src/app/layout.tsx)

/**
 * @interface ClientSideI18nProps
 * @description Props for the ClientSideI18n component.
 */
interface ClientSideI18nProps {
  children: ReactNode;
  locale: string; // Expecting the already validated/defaulted locale
  messages: AbstractIntlMessages; // Expecting pre-loaded messages from server
}

/**
 * ClientSideI18n component (Client Component Boundary).
 * Handles client-side initialization for NextIntlClientProvider.
 * It receives the locale and pre-loaded messages from the Server Component (LocaleLayout).
 * Also updates the document's lang attribute on the client side.
 *
 * @param {ClientSideI18nProps} props - The props for the ClientSideI18n component.
 * @returns {JSX.Element} The rendered ClientSideI18n component with the provider.
 */
export function ClientSideI18n({
  children,
  locale,
  messages
}: ClientSideI18nProps): JSX.Element {

  useEffect(() => {
    if (locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Basic check for messages. LocaleLayout should provide valid messages or an empty object as fallback.
  if (!messages || typeof messages !== 'object') { // Check if messages is an object
    console.error(`ClientSideI18n: Received invalid messages object (not an object or null/undefined) for locale: ${locale}. Rendering children without NextIntlClientProvider.`);
    // Render children directly if messages are critically problematic, though LocaleLayout aims to prevent this.
    return <>{children}</>;
  }
  
  // If messages object is empty (e.g. due to loading error in LocaleLayout), log warning but still provide provider.
  if (Object.keys(messages).length === 0) {
      console.warn(`ClientSideI18n: Received empty messages object for locale: ${locale}. Translations might be missing.`);
  }

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      // onError is optional, but can be useful for debugging missing translations
      // onError={(error) => {
      //   if (error.message.includes('MISSING_MESSAGE')) {
      //     console.warn(`Missing translation for locale "${locale}":`, error.message);
      //   } else {
      //     console.error("NextIntlClientProvider error:", error);
      //   }
      // }}
      // now is optional for time-sensitive translations
      // now={new Date()}
      // timeZone is optional
      // timeZone="Europe/Vienna"
    >
      {children}
    </NextIntlClientProvider>
  );
}
