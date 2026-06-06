"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next-intl/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locales } from '@/i18n/settings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const currentLocale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const onSelectChange = (nextLocale: string) => {
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Select value={currentLocale} onValueChange={onSelectChange}>
                        <SelectTrigger className="w-auto bg-transparent border-0 text-white hover:text-gray-300 focus:ring-0">
                            <div className="flex items-center gap-2">
                                <Globe size={20} />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                            {locales.map((locale) => (
                                <SelectItem 
                                    key={locale} 
                                    value={locale} 
                                    className="hover:bg-gray-700 focus:bg-gray-700"
                                >
                                    {locale.toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                    <p>Changer la langue</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
