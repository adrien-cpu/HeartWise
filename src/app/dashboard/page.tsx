
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, UserCheck, MessageSquareText, Star, Trophy } from 'lucide-react'; // Icons
import { Skeleton } from '@/components/ui/skeleton';
import { get_user, UserProfile } from '@/services/user_profile'; // Import user profile service
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock user ID for demonstration
const userId = 'user1';

/**
 * @fileOverview Implements the Intelligent User Dashboard page.
 * @module DashboardPage
 * @description Displays personalized insights, stats, and quick links for the user.
 */

/**
 * DashboardPage component.
 *
 * @component
 * @returns {JSX.Element} The rendered Dashboard page.
 */
export default function DashboardPage() {
  const t = useTranslations('DashboardPage');
  const tProfile = useTranslations('ProfilePage'); // For reusing profile strings
  const tRewards = useTranslations('RewardsPage'); // For reusing rewards strings
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for personalized advice and stats
  const mockAdvice = [
    t('mockAdvice1'),
    t('mockAdvice2'),
    t('mockAdvice3'),
  ];
  const [currentAdvice, setCurrentAdvice] = useState('');
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const userProfile = await get_user(userId);
        setProfile(userProfile);

        // Calculate profile completeness (example logic)
        let completeness = 0;
        if (userProfile.name) completeness += 25;
        if (userProfile.bio) completeness += 25;
        if (userProfile.profilePicture) completeness += 25;
        if (userProfile.interests && userProfile.interests.length > 0) completeness += 25;
        setProfileCompleteness(completeness);

        // Set random initial advice
        setCurrentAdvice(mockAdvice[Math.floor(Math.random() * mockAdvice.length)]);

      } catch (error) {
        console.error("Failed to fetch profile for dashboard:", error);
        toast({
          variant: "destructive",
          title: tProfile('fetchErrorTitle'),
          description: tProfile('fetchErrorDescription'),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, tProfile, toast]); // Dependencies

  // Helper function to get initials
  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

   // Helper to get an icon based on badge type (customize as needed)
   const getBadgeIcon = (type: string): React.ReactNode => {
     switch (type) {
       case 'profile_complete': return <UserCheck className="h-4 w-4 text-green-500" />;
       case 'first_chat': return <MessageSquareText className="h-4 w-4 text-blue-500" />;
       // Add other cases as needed from RewardsPage
       default: return <Star className="h-4 w-4 text-yellow-500" />;
     }
   };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        {loading ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
        ) : profile ? (
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={profile.profilePicture || undefined} alt={profile.name || 'User'} />
              <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{t('welcome', { name: profile.name || 'User' })}</h1>
              <p className="text-muted-foreground">{t('dashboardOverview')}</p>
            </div>
          </div>
        ) : (
           <h1 className="text-2xl font-bold">{t('welcome', { name: 'User' })}</h1>
        )}
         <Link href="/profile">
            <Button variant="outline">{tProfile('editProfile')}</Button>
         </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personalized Advice Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              {t('personalizedAdviceTitle')}
            </CardTitle>
            <CardDescription>{t('personalizedAdviceDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <p className="text-sm italic">{`"${currentAdvice}"`}</p>
            )}
          </CardContent>
        </Card>

        {/* Profile Completeness Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                {t('profileCompletenessTitle')}
            </CardTitle>
             <CardDescription>{t('profileCompletenessDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
               <Skeleton className="h-8 w-full" />
            ) : (
                <>
                    <Progress value={profileCompleteness} className="w-full mb-2" aria-label={`${t('profileCompletenessTitle')} ${profileCompleteness}%`} />
                    <p className="text-right text-sm font-medium">{profileCompleteness}%</p>
                </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity/Stats Card (Example) */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quickStatsTitle')}</CardTitle>
            <CardDescription>{t('quickStatsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                   <span className="text-muted-foreground">{t('totalPoints')}</span>
                   <span className="font-semibold flex items-center gap-1">
                     <Trophy className="h-4 w-4 text-yellow-500" />
                     {profile?.points ?? 0}
                   </span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('badgesEarned')}</span>
                   <span className="font-semibold">{profile?.rewards?.length ?? 0}</span>
                 </div>
                 {/* Add more mock stats as needed */}
              </>
            )}
          </CardContent>
        </Card>

         {/* Recent Badges Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('recentBadgesTitle')}</CardTitle>
             <CardDescription>{t('recentBadgesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                 <Skeleton className="h-10 w-10 rounded-full" />
                 <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            ) : profile?.rewards && profile.rewards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {/* Displaying first 3-4 badges */}
                 {profile.rewards.slice(0, 4).map(reward => (
                   <Badge key={reward.id} variant="secondary" className="flex items-center gap-1 text-xs" title={`${tRewards(`badge_${reward.type}_name`, {}, { fallback: reward.name })}: ${tRewards(`badge_${reward.type}_desc`, {}, { fallback: reward.description })}`}>
                      {getBadgeIcon(reward.type)}
                      {tRewards(`badge_${reward.type}_name`, {}, { fallback: reward.name })}
                   </Badge>
                 ))}
                {profile.rewards.length > 4 && (
                   <Link href="/rewards" passHref>
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">+{profile.rewards.length - 4} {t('moreBadges')}</Badge>
                   </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{tRewards('noBadges')}</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Links Card */}
        {/* <Card> ... </Card> */}

      </div>
    </div>
  );
}
