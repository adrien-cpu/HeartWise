/**
 * @fileOverview Locale-specific layout for the application.
 * @module LocaleLayout
 * @description This file defines the layout structure for localized routes.
 *              It fetches i18n messages for the current locale and provides them
 *              to client components via NextIntlClientProvider, which is wrapped
 *              by the ClientSideI18n component.
 *              This layout does NOT render <html> or <body> tags.
 */

import type { ReactNode } from 'react';
import type { AbstractIntlMessages } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales, defaultLocale, isValidLocale, type Locale } from '@/i18n/settings';
import { ClientSideI18n } from '@/components/ClientSideI18n';
// Global CSS and fonts are handled in the root src/app/layout.tsx

// Enable static rendering for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * LocaleLayout component (Server Component).
 * Fetches i18n messages for the current locale and sets up the ClientSideI18n provider.
 * Does NOT render <html> or <body> tags.
 *
 * @param {object} props - The props for the LocaleLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @param {object} props.params - The route parameters.
 * @param {string} props.params.locale - The current locale from the URL.
 * @returns {Promise<JSX.Element>} The rendered LocaleLayout component.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Access params directly since generateStaticParams provides it as an object
  const { locale: rawUrlLocale } = params;
  
  let effectiveLocale: Locale;

  if (isValidLocale(rawUrlLocale)) {
    effectiveLocale = rawUrlLocale;
  } else {
    // This scenario should ideally be caught by middleware and redirected.
    // If it reaches here, it's a fallback.
    console.warn(`[LocaleLayout] URL locale "${rawUrlLocale}" is invalid or not directly supported. Using default locale "${defaultLocale}". Middleware should handle redirection for completely unsupported locales.`);
    effectiveLocale = defaultLocale;
  }

  // Ensures that server functions like `getLocale` (from next-intl/server) know about the current locale.
  // This is critical for Server Components that use `useTranslations` or `getTranslations`.
  setRequestLocale(effectiveLocale);

  let messagesForClient: AbstractIntlMessages;
  try {
    // `getMessages` will automatically use the locale from `setRequestLocale`.
    // It should resolve to the messages loaded by `getRequestConfig` in `i18n/settings.ts`.
    const loadedMessages = await getMessages(); 
    
    if (loadedMessages && typeof loadedMessages === 'object' && Object.keys(loadedMessages).length > 0) {
      messagesForClient = loadedMessages;
    } else {
      console.error(`[LocaleLayout] Messages object from getMessages for locale "${effectiveLocale}" is missing, empty, or not an object. Check i18n/settings.ts and message files. Using empty messages for client.`);
      messagesForClient = {}; 
    }
  } catch (error: any) {
    console.error(`[LocaleLayout] Critical failure in getMessages for locale "${effectiveLocale}". Error: ${error.message}. This usually means the i18n setup in settings.ts or middleware has an issue. Falling back to empty messages.`);
    messagesForClient = {}; 
  }

  // This layout does not render <html> or <body>.
  // It provides the ClientSideI18n wrapper which includes NextIntlClientProvider.
  return (
    <ClientSideI18n locale={effectiveLocale} messages={messagesForClient}>
      {children}
    </ClientSideI18n>
  );
}