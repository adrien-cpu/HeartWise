import {
    NextIntlClientProvider,
    useMessages,
} from 'next-intl';
import {locales} from '@/i18n/settings';
import {ReactNode, useMemo} from 'react';

export function ClientSideI18n({
    children,
    locale,
}: {children: ReactNode, locale: string}) {
    const messages = useMessages();
    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
