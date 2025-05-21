
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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
 *              The main content area now features a grid of cards highlighting core functionalities.
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
            let newPathname = pathname;
            const pathSegments = pathname.split('/');
            if (pathSegments.length > 1 && isValidLocale(pathSegments[1])) {
                newPathname = pathname.substring(pathname.indexOf('/', 1));
            }
            router.replace(`/${nextLocale}${newPathname}`);
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
                {t('locale', {locale: loc})}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  learnMoreText: string;
}

function FeatureCard({ icon, title, description, link, learnMoreText }: FeatureCardProps) {
  return (
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 border">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <div className="p-2 bg-primary/10 rounded-md text-primary">
          {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" })}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Link href={link} passHref className="w-full">
          <Button variant="outline" className="w-full">
            {learnMoreText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
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
  const tCards = useTranslations('FeatureCards');
  const { currentUser, loading: authLoading, logout } = useAuth();

  const getInitials = (name?: string | null): string => {
    if (!name) return 'U'; 
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[0] && nameParts[nameParts.length - 1]) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const features = [
    { id: 'dashboard', icon: <Icons.home />, link: '/dashboard' },
    { id: 'geolocationMeeting', icon: <Icons.mapPin />, link: '/geolocation-meeting' },
    { id: 'facialAnalysisMatching', icon: <Icons.scanFace />, link: '/facial-analysis-matching' },
    { id: 'aiConversationCoach', icon: <Icons.messageSquare />, link: '/ai-conversation-coach' },
    { id: 'riskyWordsDictionary', icon: <Icons.book />, link: '/risky-words-dictionary' },
    { id: 'blindExchangeMode', icon: <Icons.eyeOff />, link: '/blind-exchange-mode' },
    { id: 'game', icon: <Icons.gamepad />, link: '/game' },
    { id: 'speedDating', icon: <Icons.zap />, link: '/speed-dating' },
    { id: 'chat', icon: <Icons.messageCircle />, link: '/chat' },
    { id: 'rewards', icon: <Icons.award />, link: '/rewards' },
  ];

  return (
    <div className="flex h-screen">
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
                  {features.filter(f => f.id !== 'dashboard').map(feature => ( // Exclude dashboard as it's already in navigation
                    <SidebarMenuItem key={feature.id}>
                      <Link href={feature.link}>
                        <SidebarMenuButton>
                          {React.cloneElement(feature.icon as React.ReactElement, { className: "mr-2" })}
                          <span>{t(feature.id as any)}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
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
                        <Avatar className="h-7 w-7 border" data-ai-hint="user profile">
                          <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || t('myAccount')} />
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

        <main className="flex-1 flex-col p-4 md:p-8 overflow-y-auto lg:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 ease-in-out group-data-[sidebar-state=collapsed]/sidebar-wrapper:lg:ml-[var(--sidebar-width-icon)]">
             <div className="max-w-5xl mx-auto">
                 <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-foreground">{t('mainPageTitle')}</h1>
                 <p className="text-md md:text-lg text-center max-w-2xl mx-auto mb-10 text-muted-foreground">{t('mainPageDescription')}</p>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <FeatureCard
                        key={feature.id}
                        icon={feature.icon}
                        title={t(feature.id as any)}
                        description={tCards(`${feature.id}Description` as any)}
                        link={feature.link}
                        learnMoreText={tCards('learnMore')}
                        />
                    ))}
                 </div>
             </div>
        </main>
    </div>
  );
}
