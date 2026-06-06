import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './settings';

export default getRequestConfig(async ({ locale }) => {
  const effectiveLocale = locale || defaultLocale;
  return {
    locale: effectiveLocale,
    messages: (await import(`./messages/${effectiveLocale}.json`)).default,
    timeZone: 'Europe/Paris'
  };
});

export const localePrefix = 'as-needed';

export type Locale = typeof locales[number];

export const pathnames = {
  '/': '/',
} as const;

/**
 * @param {string} locale
 * @returns {boolean}
 */
export function isValidLocale(locale: string): boolean {
  return locales.includes(locale as any);
}
