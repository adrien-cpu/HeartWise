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
import { getMessages } from 'next-intl/server';
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
  params: Promise<{ locale: string }>;
}) {
  // Await params before accessing its properties
  const { locale: rawUrlLocale } = await params;
  
  let effectiveLocale: Locale;

  if (isValidLocale(rawUrlLocale)) {
    effectiveLocale = rawUrlLocale;
  } else {
    // This scenario should ideally be caught by middleware and redirected.
    // If it reaches here, it's a fallback.
    console.warn(`[LocaleLayout] URL locale "${rawUrlLocale}" is invalid or not directly supported. Using default locale "${defaultLocale}". Middleware should handle redirection for completely unsupported locales.`);
    effectiveLocale = defaultLocale;
  }

  // Load messages for the current locale
  const messages = await getMessages(effectiveLocale);

  // This layout does not render <html> or <body>.
  // It provides the ClientSideI18n wrapper which includes NextIntlClientProvider.
  return (
    <ClientSideI18n locale={effectiveLocale} messages={messages}>
      {children}
    </ClientSideI18n>
  );
}