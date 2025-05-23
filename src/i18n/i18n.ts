export const locales = ['en', 'fr'] as const;

export const localePrefix = 'as-needed'; // Change to 'always' if you want to include the locale in the default locale

export type Locale = typeof locales[number];

export const pathnames = {
  '/': '/',
} as const;

export const defaultLocale = 'en';

/**
 * @param {string} locale
 * @returns {boolean}
 */
export function isValidLocale(locale: string): boolean {
  return locales.includes(locale as any);
}
