
"use client";

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
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
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
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth hook
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading state

/**
 * @fileOverview Home page component.
 *
 * @module Home
 *
 * @description This component is the main entry point or landing page of the HeartWise application.
 * It displays links to the core features and services, along with a sidebar for navigation.
 * It now also handles authentication state to display relevant UI elements.
 */


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
            const currentPathWithoutLocale = pathname.startsWith(`/${locale}`) ? pathname.substring(`/${locale}`.length) : pathname;
            router.replace(`/${nextLocale}${currentPathWithoutLocale || '/'}`); // Ensure path starts with /
        });
    };

     return (
        <Select value={locale} onValueChange={onSelectChange} disabled={isPending}>
          <SelectTrigger className="w-full md:w-[180px]">
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
 *              Adapts UI based on user authentication state.
 * @returns {JSX.Element} The rendered Home page layout.
 */
export default function Home() {
  const t = useTranslations('Home');
  const { currentUser, loading: authLoading, logout } = useAuth(); // Get auth state and logout function

  const getInitials = (name?: string | null): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    // SidebarProvider is now in ClientSideI18n, so not needed here directly
    // <SidebarProvider>
        <Sidebar className="bg-card text-card-foreground border-r">
            <SidebarHeader>
              <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">HeartWise</Link>
                    <p className="text-sm text-muted-foreground">{t('tagline')}</p>
                  </div>
                  <SidebarTrigger className="md:hidden"/>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                 <SidebarGroupLabel>{t('navigation')}</SidebarGroupLabel>
                 <SidebarMenu>
                    <SidebarMenuItem>
                       <Link href="/dashboard">
                         <SidebarMenuButton>
                           <Icons.home className="mr-2"/>
                           <span>{t('dashboard')}</span>
                         </SidebarMenuButton>
                       </Link>
                     </SidebarMenuItem>
                 </SidebarMenu>
               </SidebarGroup>
               <SidebarSeparator/>
              <SidebarGroup>
                <SidebarGroupLabel>{t('features')}</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/geolocation-meeting">
                      <SidebarMenuButton>
                        <Icons.mapPin className="mr-2"/>
                        <span>{t('geolocationMeeting')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/facial-analysis-matching">
                      <SidebarMenuButton>
                        <Icons.scanFace className="mr-2"/>
                        <span>{t('facialAnalysisMatching')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/ai-conversation-coach">
                      <SidebarMenuButton>
                        <Icons.messageSquare className="mr-2"/>
                        <span>{t('aiConversationCoach')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                     <Link href="/risky-words-dictionary">
                       <SidebarMenuButton>
                         <Icons.book className="mr-2"/>
                         <span>{t('riskyWordsDictionary')}</span>
                       </SidebarMenuButton>
                     </Link>
                   </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/blind-exchange-mode">
                      <SidebarMenuButton>
                        <Icons.eyeOff className="mr-2"/>
                        <span>{t('blindExchangeMode')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <Link href="/game">
                      <SidebarMenuButton>
                        <Icons.gamepad className="mr-2"/>
                        <span>{t('game')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                    <SidebarMenuItem>
                    <Link href="/speed-dating">
                      <SidebarMenuButton>
                        <Icons.zap className="mr-2"/>
                        <span>{t('speedDating')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <Link href="/chat">
                      <SidebarMenuButton>
                        <Icons.messageCircle className="mr-2"/>
                        <span>{t('chat')}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                      <Link href="/rewards">
                        <SidebarMenuButton>
                          <Icons.award className="mr-2"/>
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
              <SidebarSeparator/>
              {authLoading ? (
                <div className="flex items-center justify-center h-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex h-12 w-full items-center justify-between rounded-md text-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Avatar className="h-7 w-7 border">
                          <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || 'User'} data-ai-hint="user avatar" />
                          <AvatarFallback>{getInitials(currentUser.displayName)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{currentUser.displayName || currentUser.email || t('myAccount')}</span>
                      </div>
                      <Icons.chevronDown className="ml-2 h-4 w-4 opacity-50"/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                        <Link href="/profile"><Icons.user className="mr-2"/>{t('profile')}</Link>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem><Icons.settings className="mr-2"/>{t('settings')}</DropdownMenuItem> */}
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={logout}>
                        <Icons.logOut className="mr-2"/>{t('logout')}
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

        <main className="flex flex-col items-center justify-center min-h-screen p-8 lg:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 ease-in-out group-data-[sidebar-state=collapsed]/sidebar-wrapper:lg:ml-[var(--sidebar-width-icon)]">
             <h1 className="text-4xl font-bold mb-4 text-center">{t('mainPageTitle')}</h1>
             <p className="text-lg text-center max-w-prose mb-8 text-muted-foreground">{t('mainPageDescription')}</p>
             <Link href="/dashboard">
               <Button size="lg" variant="default">{t('goToDashboard')}</Button>
             </Link>
        </main>
    // </SidebarProvider>
  );
}
