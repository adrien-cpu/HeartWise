"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lightbulb, UserCheck, MessageSquareText, Star, Trophy, Users, Play, Sparkles, Zap, Search } from 'lucide-react'; // Added more icons
import { Skeleton } from '@/components/ui/skeleton';
import { get_user, UserProfile } from '@/services/user_profile';
import { useToast } from '@/hooks/use-toast';

// Mock user ID for demonstration
const userId = 'user1';

// Mock Match Suggestion Data
interface MockMatch {
  id: string;
  name: string;
  profilePicture: string;
  dataAiHint?: string;
  interests: string[];
  compatibility: number;
}

const mockMatchSuggestion: MockMatch = {
  id: 'match789',
  name: 'Sophia',
  profilePicture: 'https://picsum.photos/seed/sophia/100',
  dataAiHint: 'woman smiling',
  interests: ['Art', 'Yoga', 'Travel'],
  compatibility: 82,
};

/**
 * @fileOverview Implements the Intelligent User Dashboard page.
 * @module DashboardPage
 * @description Displays personalized insights, stats, quick links, and a mock match suggestion for the user.
 */

/**
 * DashboardPage component.
 *
 * @component
 * @returns {JSX.Element} The rendered Dashboard page.
 */
export default function DashboardPage() {
  const t = useTranslations('DashboardPage');
  const tProfile = useTranslations('ProfilePage');
  const tRewards = useTranslations('RewardsPage');
  const tHome = useTranslations('Home'); // For reusing feature names

  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAdvice, setCurrentAdvice] = useState('');
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await get_user(userId);
        setProfile(userProfile);

        let completeness = 0;
        if (userProfile.name) completeness += 20;
        if (userProfile.bio && userProfile.bio.length > 10) completeness += 20;
        if (userProfile.profilePicture) completeness += 20;
        if (userProfile.interests && userProfile.interests.length > 0) completeness += 20;
        if (userProfile.interests && userProfile.interests.length >= 3) completeness += 20; // Bonus for more interests
        setProfileCompleteness(Math.min(100, completeness));

        const mockAdvices = [
          t('mockAdvice1'),
          t('mockAdvice2'),
          t('mockAdvice3'),
        ];
        setCurrentAdvice(mockAdvices[Math.floor(Math.random() * mockAdvices.length)]);

      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: t('fetchErrorTitle'),
          description: t('fetchErrorDescription'),
        });
      }
    };

    fetchProfile();
  }, [toast, t]);

  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getBadgeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'profile_complete': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'first_chat': return <MessageSquareText className="h-4 w-4 text-blue-500" />;
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
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        ) : profile ? (
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border" data-ai-hint={profile.dataAiHint || "user"}>
              <AvatarImage src={profile.profilePicture || undefined} alt={profile.name || t('userAlt')} />
              <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{t('welcome', { name: profile.name || t('userAlt') })}</h1>
              <p className="text-muted-foreground">{t('dashboardOverview')}</p>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl font-bold">{t('welcome', { name: t('userAlt') })}</h1>
        )}
        <Link href="/profile" passHref>
          <Button variant="outline">{tProfile('editProfile')}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personalized Advice Card */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              {t('personalizedAdviceTitle')}
            </CardTitle>
            <CardDescription>{t('personalizedAdviceDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <p className="text-sm italic leading-relaxed">{`"${currentAdvice}"`}</p>
            )}
          </CardContent>
        </Card>

        {/* Profile Completeness Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              {t('profileCompletenessTitle')}
            </CardTitle>
            <CardDescription>{t('profileCompletenessDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <Progress value={profileCompleteness} className="w-full mb-2 h-3" aria-label={`${t('profileCompletenessTitle')} ${profileCompleteness}%`} />
                <p className="text-right text-sm font-medium text-primary">{profileCompleteness}%</p>
                {profileCompleteness < 100 && (
                  <Link href="/profile" passHref>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-1">{t('completeProfileLink')}</Button>
                  </Link>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="lg:col-span-1 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {t('quickActionsTitle')}
            </CardTitle>
            <CardDescription>{t('quickActionsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link href="/speed-dating" passHref>
              <Button variant="outline" className="w-full flex items-center justify-start gap-2">
                <Zap className="h-4 w-4" /> {tHome('speedDating')}
              </Button>
            </Link>
            <Link href="/blind-exchange-mode" passHref>
              <Button variant="outline" className="w-full flex items-center justify-start gap-2">
                <Users className="h-4 w-4" /> {tHome('blindExchangeMode')}
              </Button>
            </Link>
            <Link href="/game" passHref>
              <Button variant="outline" className="w-full flex items-center justify-start gap-2">
                <Play className="h-4 w-4" /> {tHome('game')}
              </Button>
            </Link>
            <Link href="/chat" passHref>
              <Button variant="outline" className="w-full flex items-center justify-start gap-2">
                <MessageSquareText className="h-4 w-4" /> {tHome('chat')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Mock Match Suggestion Card */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              {t('matchSuggestionTitle')}
            </CardTitle>
            <CardDescription>{t('matchSuggestionDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 p-3 border rounded-lg bg-muted/50">
                <Avatar className="h-16 w-16 border" data-ai-hint={mockMatchSuggestion.dataAiHint || "person"}>
                  <AvatarImage src={mockMatchSuggestion.profilePicture} alt={mockMatchSuggestion.name} />
                  <AvatarFallback>{getInitials(mockMatchSuggestion.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{mockMatchSuggestion.name}</h3>
                  <div className="flex flex-wrap gap-1 my-1">
                    {mockMatchSuggestion.interests.map(interest => (
                      <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-green-600 font-medium">{t('compatibility', { score: mockMatchSuggestion.compatibility })}</p>
                </div>
                <Button variant="default" size="sm">{t('viewProfileButton')}</Button>
              </div>
            )}
          </CardContent>
        </Card>


        {/* User Stats Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
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
                {/* Add more mock stats if relevant, e.g., "Matches Made", "Dates Scheduled" - requires backend */}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Badges Card */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{t('recentBadgesTitle')}</CardTitle>
            <CardDescription>{t('recentBadgesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-20 rounded-md" />
                <Skeleton className="h-10 w-28 rounded-md" />
              </div>
            ) : profile?.rewards && profile.rewards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.rewards.slice(0, 4).map(reward => (
                  <Badge
                    key={reward.id}
                    variant="secondary"
                    className="flex items-center gap-1.5 p-1.5 pr-2.5 text-xs cursor-help"
                    title={`${tRewards(`badge_${reward.type}_name`, { defaultValue: reward.name })}: ${tRewards(`badge_${reward.type}_desc`, { defaultValue: reward.description })}`}
                  >
                    {getBadgeIcon(reward.type)}
                    {tRewards(`badge_${reward.type}_name`, { defaultValue: reward.name })}
                  </Badge>
                ))}
                {profile.rewards.length > 4 && (
                  <Link href="/rewards" passHref>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent p-1.5 pr-2.5">+{profile.rewards.length - 4} {t('moreBadges')}</Badge>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{tRewards('noBadges')}</p>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/rewards" passHref>
              <Button variant="link" className="p-0 h-auto text-sm">{t('viewAllRewards')}</Button>
            </Link>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}

