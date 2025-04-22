export const Locales = ['en', 'fr'] as const;

export const localePrefix = 'as-needed';

export type Locale = typeof Locales[number];

export const pathnames = {
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

const i18n = {
  Locales,
  DefaultLocale,
  localePrefix,
  pathnames,
  isValidLocale,
};

export default i18n;
