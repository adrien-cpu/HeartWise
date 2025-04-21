export const Locales = ['en', 'fr'] as const;

export const localePrefix = 'as-needed';

export type Locale = typeof Locales[number];

export const Pathnames = {
  '/': '/',
} as const;

export const DefaultLocale = 'en';

/**
 * @param {string} locale
 * @returns {boolean}
 */
export function isValidLocale(locale: string): boolean {
  return Locales.includes(locale as any);
}

export const i18n = {
  Locales,
  DefaultLocale,
  localePrefix,
  Pathnames,
  isValidLocale,
}

