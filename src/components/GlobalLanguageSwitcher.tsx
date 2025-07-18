"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales, isValidLocale } from '@/i18n/settings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function GlobalLanguageSwitcher() {
    const currentLocale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const onSelectChange = (nextLocale: string) => {
        const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');
        const newPathname = `/${nextLocale}${pathWithoutLocale}`;
        router.replace(newPathname);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Select value={currentLocale} onValueChange={onSelectChange}>
                        <SelectTrigger className="w-[140px] ml-auto mr-4 mt-4" aria-label="Changer la langue">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {locales.map((loc) => (
                                <SelectItem key={loc} value={loc}>{loc.toUpperCase() as React.ReactNode}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Change Language</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
