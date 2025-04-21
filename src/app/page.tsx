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

/**
 * @fileOverview Home page component.
 *
 * @module Home
 *
 * @description This component is the main dashboard of the HeartWise application.
 * It displays links to the core features and services, along with a sidebar for navigation.
 */

/**
 * Home component.
 *
 * @component
 * @description The main dashboard of the HeartWise application.
 * @returns {JSX.Element} The rendered Home page.
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
            </div>
        </>
    );
}

export default function Home() {
  const t = useTranslations('Home');

  return (
    <>
      <Sidebar className="bg-gray-100">
        <SidebarHeader>
          <div className="space-y-2">
            <h1 className="text-lg font-semibold">HeartWise</h1>
            <p className="text-sm text-gray-500">{t('tagline')}</p>
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
            </SidebarMenu>
          </SidebarGroup>
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
              <DropdownMenuItem>{t('profile')}</DropdownMenuItem>
              <DropdownMenuItem>{t('settings')}</DropdownMenuItem>
              <DropdownMenuSeparator/>
              <DropdownMenuItem>{t('logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="flex flex-col items-center justify-center min-h-screen p-8 ml-64">
          <HomeClient />
      </main>
    </>
  );
}
