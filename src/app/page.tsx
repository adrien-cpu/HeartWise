"use client";

import type { ReactNode } from 'react';
import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
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
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslations, useLocale } from 'next-intl';
import { locales, defaultLocale, isValidLocale } from '@/i18n/settings';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth hook
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading state

/**
 * @fileOverview Home page component for the HeartWise application.
 * @module HomePage
 * @description This component serves as the main landing page and includes the primary navigation sidebar.
 *              It displays links to core features and adapts the sidebar footer based on user authentication state.
 */


/**
 * LanguageSwitcher component.
 * Allows users to switch the application's language.
 * @component
 * @returns {JSX.Element} The rendered LanguageSwitcher component.
 */
function LanguageSwitcher(): JSX.Element {
  const t = useTranslations('Home');
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  /**
   * Handles the language change event.
   * @param {string} nextLocale - The selected locale code.
   */
  const onSelectChange = (nextLocale: string) => {
    startTransition(() => {
      // Extraire le chemin sans la locale
      const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');
      // Construire le nouveau chemin avec la nouvelle locale
      const newPathname = `/${nextLocale}${pathWithoutLocale}`;
      router.replace(newPathname);
    });
  };

  return (
    <Select value={currentLocale} onValueChange={onSelectChange} disabled={isPending}>
      <SelectTrigger className="w-full md:w-[180px]" aria-label={t('selectLanguage')}>
        <SelectValue placeholder={t('selectLanguage')} />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {t('locale', { locale: loc })}
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
 *              Adapts UI based on user authentication state.
 * @returns {JSX.Element} The rendered Home page layout.
 */
export default function Home(): JSX.Element {
  const t = useTranslations('Home');
  const { currentUser, loading: authLoading, logout } = useAuth(); // Get auth state and logout function

  /**
   * Generates initials from a user's name for avatar fallbacks.
   * @param {string | null | undefined} name - The user's name.
   * @returns {string} The initials (e.g., "JD" for "John Doe").
   */
  const getInitials = (name?: string | null): string => {
    if (!name) return 'U'; // Default for User
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    // SidebarProvider is now in ClientSideI18n, via RootLayout and ClientLayout
    <div className="flex h-screen">
      <Sidebar className="bg-card text-card-foreground border-r">
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">HeartWise</Link>
              <p className="text-sm text-muted-foreground">{t('tagline')}</p>
            </div>
            <SidebarTrigger className="md:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t('navigation')}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard">
                  <SidebarMenuButton>
                    <Icons.home className="mr-2" />
                    <span>{t('dashboard')}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>{t('features')}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/geolocation-meeting">
                  <SidebarMenuButton>
                    <Icons.mapPin className="mr-2" />
                    <span>{t('geolocationMeeting')}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/facial-analysis-matching">
                  <SidebarMenuButton>
                    <Icons.scanFace className="mr-2" />
                    <span>{t('facialAnalysisMatching')}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/ai-conversation-coach">
                  <SidebarMenuButton>
                    <Icons.messageSquare className="mr-2" />
                    <span>{t('aiConversationCoach')}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/risky-words-dictionary">
                  <SidebarMenuButton>
                    <Icons.book className="mr-2" />
                    <span>{t('riskyWordsDictionary')}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/blind-exchange-mode">
                  <SidebarMenuButton>
                    <Icons.eyeOff className="mr-2" />
                    <span>{t('blindExchangeMode')}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/game">
                  <SidebarMenuButton>
                    <Icons.gamepad className="mr-2" />
                    <span>{t('game')}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/speed-dating">
                  <SidebarMenuButton>
                    <Icons.zap className="mr-2" />
                    <span>{t('speedDating')}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/chat">
                  <SidebarMenuButton>
                    <Icons.messageCircle className="mr-2" />
                    <span>{t('chat')}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/rewards">
                  <SidebarMenuButton>
                    <Icons.award className="mr-2" />
                    <span>{t('rewards')}</span>
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
          <SidebarSeparator />
          {authLoading ? (
            <div className="flex items-center justify-center h-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-12 w-full items-center justify-between rounded-md text-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="h-7 w-7 border" data-ai-hint="user profile">
                      <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || t('myAccount')} />
                      <AvatarFallback>{getInitials(currentUser.displayName)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{currentUser.displayName || currentUser.email || t('myAccount')}</span>
                  </div>
                  <Icons.chevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile"><Icons.user className="mr-2" />{t('profile')}</Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem><Icons.settings className="mr-2"/>{t('settings')}</DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <Icons.logOut className="mr-2" />{t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-2">
              <Button variant="outline" asChild size="sm">
                <Link href="/login">{t('loginButton')}</Link>
              </Button>
              <Button variant="default" asChild size="sm">
                <Link href="/signup">{t('signupButton')}</Link>
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <h1 className="text-4xl font-bold text-center mb-6">{t('welcome')}</h1>
            <p className="text-xl text-muted-foreground text-center mb-8 max-w-2xl">{t('description')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              <div className="card-rencontre">
                <span className="icon-rencontre">💞</span>
                <h2>{t('features.matchmaking.title')}</h2>
                <p>{t('features.matchmaking.description')}</p>
                <Link href="/matchmaking" className="w-full flex justify-center">
                  <button className="btn-rencontre">{t('features.matchmaking.cta')}</button>
                </Link>
              </div>
              <div className="card-rencontre">
                <span className="icon-rencontre">💬</span>
                <h2>{t('features.chat.title')}</h2>
                <p>{t('features.chat.description')}</p>
                <Link href="/chat" className="w-full flex justify-center">
                  <button className="btn-rencontre">{t('features.chat.cta')}</button>
                </Link>
              </div>
              <div className="card-rencontre">
                <span className="icon-rencontre">⚡</span>
                <h2>{t('features.speedDating.title')}</h2>
                <p>{t('features.speedDating.description')}</p>
                <Link href="/speed-dating" className="w-full flex justify-center">
                  <button className="btn-rencontre">{t('features.speedDating.cta')}</button>
                </Link>
              </div>
              <div className="card-rencontre">
                <span className="icon-rencontre">🏆</span>
                <h2>{t('features.rewards.title')}</h2>
                <p>{t('features.rewards.description')}</p>
                <Link href="/rewards" className="w-full flex justify-center">
                  <button className="btn-rencontre">{t('features.rewards.cta')}</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
