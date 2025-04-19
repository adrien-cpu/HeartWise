const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'fr'],
} as const;

export default i18n;

export const pathnames = {
  '/': '/',
  '/geolocation-meeting': {
    en: '/geolocation-meeting',
    fr: '/rencontres-geolocalisees'
  },
  '/facial-analysis-matching': {
    en: '/facial-analysis-matching',
    fr: '/analyse-faciale'
  },
  '/ai-conversation-coach': {
    en: '/ai-conversation-coach',
    fr: '/coach-ia-conversation'
  },
  '/blind-exchange-mode': {
    en: '/blind-exchange-mode',
    fr: '/rencontre-aveugle'
  }
} as const;

export type I18nPaths = typeof pathnames;
