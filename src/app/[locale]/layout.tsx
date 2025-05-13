
/**
 * @fileOverview Locale-specific layout for the application.
 * @module LocaleLayout
 * @description This file defines the layout structure for localized routes.
 *              It fetches i18n messages for the current locale and provides them
 *              to client components via NextIntlClientProvider, which is wrapped
 *              by the ClientSideI18n component.
 *              This layout does NOT render <html> or <body> tags, as those are
 *              handled by the root layout (src/app/layout.tsx).
 */

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { getMessages, setRequestLocale } from 'next-intl/server'; // Use setRequestLocale for static rendering
import { locales, defaultLocale, isValidLocale, type Locale } from '@/i18n/settings';
import { metadata as appMetadata } from '@/app/metadata'; // Base metadata
import { ClientSideI18n } from '@/components/ClientSideI18n';
// Global CSS is imported in the root src/app/layout.tsx
// Fonts are also handled in the root src/app/layout.tsx

// export const metadata: Metadata = appMetadata; // Metadata can be exported here if it's locale-specific
// For now, using global metadata from app/metadata.ts, potentially overridden by pages.

// Enable static rendering for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * LocaleLayout component (Server Component).
 * Fetches i18n messages for the current locale and sets up the ClientSideI18n provider.
 *
 * @param {object} props - The props for the LocaleLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @param {object} props.params - The route parameters.
 * @param {string} props.params.locale - The current locale from the URL.
 * @returns {Promise<JSX.Element>} The rendered LocaleLayout component.
 */
export default async function LocaleLayout({
  children,
  params: { locale: rawUrlLocale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  let effectiveLocale: Locale;

  if (isValidLocale(rawUrlLocale)) {
    effectiveLocale = rawUrlLocale;
  } else {
    console.warn(`[LocaleLayout] URL locale "${rawUrlLocale}" is invalid or not directly supported. Using default locale "${defaultLocale}". Middleware should handle redirection for completely unsupported locales.`);
    effectiveLocale = defaultLocale;
  }

  // Set the request locale for server-side i18n utilities like getMessages()
  // This is crucial for next-intl to work correctly in Server Components.
  setRequestLocale(effectiveLocale);

  let messagesForClient: AbstractIntlMessages;
  const localeForClient: Locale = effectiveLocale;

  try {
    const loadedMessages = await getMessages(); // getMessages() will use the locale set by setRequestLocale.
    
    if (loadedMessages && typeof loadedMessages === 'object' && Object.keys(loadedMessages).length > 0) {
      messagesForClient = loadedMessages;
    } else {
      console.error(`[LocaleLayout] Messages object from getMessages for locale "${effectiveLocale}" is missing, empty, or not an object. Using empty messages for client. This might indicate a problem with the JSON files or the import in getRequestConfig (i18n/settings.ts).`);
      messagesForClient = {}; // Fallback to empty messages
    }
  } catch (error: any) {
    console.error(`[LocaleLayout] Critical failure in getMessages for effective locale "${effectiveLocale}". Error: ${error.message}.`);
    messagesForClient = {}; // Fallback to empty messages
    console.warn(`[LocaleLayout] Falling back to empty messages for ClientSideI18n due to catastrophic message loading error for locale "${localeForClient}".`);
  }

  // This layout does not render <html> or <body>.
  // It provides the ClientSideI18n wrapper which includes NextIntlClientProvider.
  return (
    <ClientSideI18n locale={localeForClient} messages={messagesForClient}>
      {children}
    </ClientSideI18n>
  );
}

