/**
 * @fileOverview Configuration settings for internationalization (i18n) using next-intl.
 */

import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
 
// If not using sentry, just delete this function.
export async function handleI18n() {
  // We're revalidating the request config on each request to ensure
  // we're picking up the latest messages.
  return getRequestConfig(async ({locale}) => ({
    messages: (await import(`../messages/${locale}.json`)).default
  }));
}

export const locales = ['en', 'fr'] as const;
export const localePrefix = 'as-needed';
export type Locale = typeof locales[number];
export const pathnames = {
  '/': '/'
} as const;
export const defaultLocale = 'en';

export function isValidLocale(locale: string): boolean {
  return locales.includes(locale as any);
}

export const config = {
  // Provide the locales that should be supported
  locales,
  // Provide the default locale to be used
  defaultLocale,
  localePrefix,
  pathnames
};
