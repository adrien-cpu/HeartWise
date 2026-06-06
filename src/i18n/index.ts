import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale, isValidLocale } from './settings';
import type { RequestConfig } from 'next-intl/server';

export async function getMessages(locale: string | undefined) {
    try {
        if (!locale || !isValidLocale(locale)) {
            locale = defaultLocale;
        }
        return (await import(`../messages/${locale}.json`)).default;
    } catch (error) {
        console.error(`Failed to load messages for locale: ${locale}`, error);
        return (await import(`../messages/${defaultLocale}.json`)).default;
    }
}

export default getRequestConfig(async ({ locale }) => {
    const effectiveLocale = locale || defaultLocale;
    const messages = await getMessages(effectiveLocale);
    return {
        messages,
        locale: effectiveLocale,
        timeZone: 'Europe/Paris',
        now: new Date(),
    } as RequestConfig;
}); 