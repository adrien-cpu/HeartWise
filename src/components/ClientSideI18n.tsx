
/**
 * @fileOverview Client-side internationalization setup.
 * @module ClientSideI18n
 * @description This component acts as a client-side boundary. It initializes
 *              NextIntlClientProvider for internationalization.
 *              It receives locale and messages from server components (e.g., LocaleLayout).
 */
"use client"; // This component MUST be a client component

import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
// Global providers like AuthProvider and SidebarProvider are in the root layout (src/app/layout.tsx)

/**
 * @interface ClientSideI18nProps
 * @description Props for the ClientSideI18n component.
 */
interface ClientSideI18nProps {
  children: ReactNode;
  locale: string; 
  messages: AbstractIntlMessages; 
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
    // Update the lang attribute on the <html> tag on the client side
    // when the locale changes or on initial mount.
    if (locale && typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  
  if (!messages || typeof messages !== 'object') { 
    console.error(`ClientSideI18n: Received invalid messages object (not an object or null/undefined) for locale: ${locale}. Rendering children without NextIntlClientProvider.`);
    // Render children directly if messages are critically missing to avoid a full crash.
    // This might lead to missing translations but keeps the app from breaking entirely.
    return <>{children}</>;
  }
  
  if (Object.keys(messages).length === 0 && locale) {
      console.warn(`ClientSideI18n: Received empty messages object for locale: ${locale}. Translations might be missing or there was an error loading them on the server.`);
  }

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}
