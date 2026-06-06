"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Award } from 'lucide-react';
import { UserProfile } from '@/services/user_profile';

interface QuickStatsCardProps {
  loading: boolean;
  profile: UserProfile | null;
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({ loading, profile }) => {
  const t = useTranslations('DashboardPage');

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl">{t('quickStatsTitle')}</CardTitle>
        <CardDescription>{t('quickStatsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </>
        ) : profile ? (
          <>
            <div className="flex items-center justify-between text-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {t('totalPoints')}
              </span>
              <span className="font-bold text-primary">{profile.points ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-500" />
                {t('badgesEarned')}
              </span>
              <span className="font-bold text-primary">{profile.rewards?.length ?? 0}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t('profileDataUnavailable')}</p>
        )}
      </CardContent>
    </Card>
  );
};
