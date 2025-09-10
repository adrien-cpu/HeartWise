"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Link } from 'next-intl';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    icon?: React.ReactNode;
    category?: string;
  };
}

export function BreadcrumbNavigation() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  
  const breadcrumbConfig: BreadcrumbConfig = {
    'dashboard': { label: t('dashboard'), icon: <Home className="w-3 h-3" /> },
    'chat': { label: t('chat'), category: 'connections' },
    'speed-dating': { label: t('speedDating'), category: 'connections' },
    'geolocation-meeting': { label: t('localMeetups'), category: 'connections' },
    'facial-analysis-matching': { label: t('smartMatching'), category: 'ai' },
    'ai-conversation-coach': { label: t('conversationCoach'), category: 'ai' },
    'blind-exchange-mode': { label: t('mysteryChat'), category: 'ai' },
    'game': { label: t('games'), category: 'entertainment' },
    'profile': { label: t('profile'), category: 'account' },
    'rewards': { label: t('rewards'), category: 'account' },
    'settings': { label: t('settings'), category: 'account' },
    'about': { label: t('about') },
    'features': { label: t('features') },
  };

  // Parse pathname to create breadcrumb items
  const pathSegments = pathname.split('/').filter(Boolean);
  const localeIndex = pathSegments.findIndex(segment => ['en', 'fr'].includes(segment));
  const contentSegments = localeIndex >= 0 ? pathSegments.slice(localeIndex + 1) : pathSegments;

  if (contentSegments.length === 0) {
    return null; // Don't show breadcrumbs on home page
  }

  const breadcrumbItems = contentSegments.map((segment, index) => {
    const config = breadcrumbConfig[segment];
    const isLast = index === contentSegments.length - 1;
    const href = '/' + contentSegments.slice(0, index + 1).join('/');
    
    return {
      segment,
      label: config?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
      icon: config?.icon,
      category: config?.category,
      href,
      isLast
    };
  });

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 max-w-screen-2xl items-center px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  <span className="sr-only">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {breadcrumbItems.length > 0 && <BreadcrumbSeparator />}
            
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.segment}>
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      {item.icon}
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href} className="flex items-center gap-1">
                        {item.icon}
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!item.isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}