
"use client";

import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {Icons} from "@/components/icons";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {useTranslations} from 'next-intl';
import {useLocale} from 'next-intl';
import { locales } from '@/i18n/settings';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';


/**
 * @fileOverview Home page component.
 *
 * @module Home
 *
 * @description This component is the main dashboard of the HeartWise application.
 * It displays links to the core features and services, along with a sidebar for navigation.
 */

/**
 * HomeClient component.
 *
 * @component
 * @description The main dashboard content of the HeartWise application.
 * @returns {JSX.Element} The rendered Home page client content.
 */
function HomeClient() {
    const t = useTranslations('Home');

    return (
        <>
            <h1 className="text-4xl font-bold mb-4">{t('dashboardTitle')}</h1>
            <p className="text-lg mb-8">{t('dashboardDescription')}:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/geolocation-meeting">
                    <Button className="w-full">{t('geolocationMeeting')}</Button>
                </Link>
                <Link href="/facial-analysis-matching">
                    <Button className="w-full">{t('facialAnalysisMatching')}</Button>
                </Link>
                <Link href="/ai-conversation-coach">
                    <Button className="w-full">{t('aiConversationCoach')}</Button>
                </Link>
                <Link href="/blind-exchange-mode">
                    <Button className="w-full">{t('blindExchangeMode')}</Button>
                </Link>
                <Link href="/game">
                    <Button className="w-full">{t('game')}</Button>
                </Link>
                 <Link href="/speed-dating">
                  <Button className="w-full">{t('speedDating')}</Button>
                </Link>
                <Link href="/profile">
                    <Button variant="secondary" className="w-full">{t('profile')}</Button>
                </Link>
            </div>
        </>
    );
}

/**
 * LanguageSwitcher component.
 *
 * @component
 * @description A component to switch the application language.
 * @returns {JSX.Element} The rendered LanguageSwitcher component.
 */
function LanguageSwitcher() {
    const t = useTranslations('Home');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    /**
     * Handles the language change event.
     * @param {string} nextLocale - The selected locale code.
     */
    const onSelectChange = (nextLocale: string) => {
        startTransition(() => {
            router.replace(pathname, {locale: nextLocale});
        });
    };

     return (
        <Select value={locale} onValueChange={onSelectChange} disabled={isPending}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('selectLanguage')} />
          </SelectTrigger>
          <SelectContent>
            {locales.map((cur) => (
              <SelectItem key={cur} value={cur}>
                {t('locale', {locale: cur})}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
}

/**
 * Home page layout component.
 *
 * @component
 * @description The main layout structure for the home page, including the sidebar and main content area.
 * @returns {JSX.Element} The rendered Home page layout.
 */
export default function Home() {
  const t = useTranslations('Home');

  return (
    <SidebarProvider>
        <Sidebar className="bg-gray-100 dark:bg-gray-900">
            <SidebarHeader>
              <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="text-lg font-semibold">HeartWise</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('tagline')}</p>
                  </div>
                  <SidebarTrigger className="md:hidden"/>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>{t('features')}</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/geolocation-meeting">
                      <SidebarMenuButton>
                        <Icons.home className="mr-2 h-4 w-4"/>
                        <span>{t('geolocationMeeting')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/facial-analysis-matching">
                      <SidebarMenuButton>
                        <Icons.user className="mr-2 h-4 w-4"/>
                        <span>{t('facialAnalysisMatching')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/ai-conversation-coach">
                      <SidebarMenuButton>
                        <Icons.messageSquare className="mr-2 h-4 w-4"/>
                        <span>{t('aiConversationCoach')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/blind-exchange-mode">
                      <SidebarMenuButton>
                        <Icons.shield className="mr-2 h-4 w-4"/>
                        <span>{t('blindExchangeMode')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <Link href="/game">
                      <SidebarMenuButton>
                        <Icons.circle className="mr-2 h-4 w-4"/>
                        <span>{t('game')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                    <SidebarMenuItem>
                    <Link href="/speed-dating">
                      <SidebarMenuButton>
                        <Icons.circle className="mr-2 h-4 w-4"/>
                        <span>{t('speedDating')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                    <SidebarMenuItem>
                    <Link href="/profile">
                      <SidebarMenuButton>
                        <Icons.user className="mr-2 h-4 w-4"/>
                        <span>{t('profile')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
               <div className="mt-auto p-2">
                   <LanguageSwitcher />
                </div>
            </SidebarContent>
            <SidebarFooter>
              <SidebarSeparator/>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex h-8 w-full items-center justify-between rounded-md">
                    <Avatar className="mr-2 h-6 w-6">
                      <AvatarImage src="https://picsum.photos/50/50" alt="Avatar"/>
                      <AvatarFallback>CM</AvatarFallback>
                    </Avatar>
                    <span>{t('myAccount')}</span>
                    <Icons.chevronDown className="ml-2 h-4 w-4 opacity-50"/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href="/profile"><DropdownMenuItem>{t('profile')}</DropdownMenuItem></Link>
                  <DropdownMenuItem>{t('settings')}</DropdownMenuItem>
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem>{t('logout')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </Sidebar>

        <main className="flex flex-col items-center justify-center min-h-screen p-8 lg:ml-64">
            <HomeClient />
        </main>
    </SidebarProvider>
  );
}
