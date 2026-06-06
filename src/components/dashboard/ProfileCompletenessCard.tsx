"use client";

import React from 'react';
import { Link } from 'next-intl'; // Corrected import
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCheck } from 'lucide-react';
import { UserProfile } from '@/services/user_profile';

interface ProfileCompletenessCardProps {
  loading: boolean;
  profile: UserProfile | null;
}

const calculateProfileCompleteness = (profile: UserProfile | null): number => {
  if (!profile) return 0;
  let completeness = 0;
  if (profile.name) completeness += 20;
  if (profile.bio && profile.bio.length > 10) completeness += 20;
  if (profile.profilePicture && !profile.profilePicture.includes('picsum.photos')) completeness += 20; // Check it's not a placeholder
  if (profile.interests && profile.interests.length > 0) completeness += 20;
  if (profile.interests && profile.interests.length >= 3) completeness += 20; // Bonus for more interests
  return Math.min(100, completeness);
};

export const ProfileCompletenessCard: React.FC<ProfileCompletenessCardProps> = ({ loading, profile }) => {
  const t = useTranslations('DashboardPage');
  const completeness = calculateProfileCompleteness(profile);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <UserCheck className="h-6 w-6 text-primary" />
          {t('profileCompletenessTitle')}
        </CardTitle>
        <CardDescription>{t('profileCompletenessDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/4 ml-auto" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Progress value={completeness} className="flex-1 h-3" aria-label={`${t('profileCompletenessTitle')} ${completeness}%`} />
              <span className="text-lg font-bold text-primary">{completeness}%</span>
            </div>
            {completeness < 100 && (
              <Link href="/profile" passHref>
                <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary hover:underline">
                  {t('completeProfileLink')}
                </Button>
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
