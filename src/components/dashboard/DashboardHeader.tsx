"use client";

import React from 'react';
import { Link } from 'next-intl'; // Corrected import
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfile } from '@/services/user_profile';
import { User } from 'firebase/auth';

interface DashboardHeaderProps {
  loading: boolean;
  profile: UserProfile | null;
  user: User | null;
}

const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ loading, profile, user }) => {
  const t = useTranslations('DashboardPage');
  const tProfile = useTranslations('ProfilePage');

  if (loading) {
    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }

  const displayName = profile?.name || user?.displayName || t('userAlt');

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarImage src={profile?.profilePicture || undefined} alt={displayName} />
          <AvatarFallback className="text-2xl bg-primary/20">{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('welcome', { name: displayName })}</h1>
          <p className="text-muted-foreground">{t('dashboardOverview')}</p>
        </div>
      </div>
      <Link href="/profile" passHref>
        <Button variant="outline" className="shrink-0">{tProfile('editProfile')}</Button>
      </Link>
    </div>
  );
};
