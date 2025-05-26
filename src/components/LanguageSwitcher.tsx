"use client";

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locales } from '@/i18n/settings';

export function LanguageSwitcher() {
    const t = useTranslations('Home');
    const currentLocale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const onSelectChange = (nextLocale: string) => {
        const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(?=\/|$)/, '');
        const newPathname = `/${nextLocale}${pathWithoutLocale === '' ? '' : pathWithoutLocale}`;
        router.replace(newPathname);
    };

    return (
        <Select value={currentLocale} onValueChange={onSelectChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
                {locales.map((locale) => (
                    <SelectItem key={locale} value={locale}>
                        {t(`locale${locale.charAt(0).toUpperCase() + locale.slice(1)}`)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
} 