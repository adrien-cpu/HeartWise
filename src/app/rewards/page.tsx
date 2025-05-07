"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, MessageSquare, Users, Zap, Star, Gamepad2, Eye, MapPin, Trophy, HelpCircle, Lock, Sparkles, Brain, MessageCircleHeart, UserCheck } from 'lucide-react'; // Added new icons
import { Skeleton } from '@/components/ui/skeleton';
import { get_user_rewards, UserReward, get_user_points, UserProfile, get_user_premium_features, PremiumFeatures, get_user } from '@/services/user_profile';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import Link from 'next/link';

// Mock user ID - replace with actual user identification
const userId = 'user1';

interface PremiumFeatureDisplayData {
  id: keyof PremiumFeatures; // Use keys from PremiumFeatures interface
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  unlockConditionKey: string;
  unlockValue: string | number;
  isLocked: boolean;
  unlockDetails?: string; // More detailed explanation for unlocking
}


/**
 * @fileOverview Implements the Rewards page component.
 * Displays badges earned by the user, their total points, and information on premium features and how to unlock them.
 */

/**
 * RewardsPage component.
 *
 * @component
 * @description Displays the user's earned badges, rewards, total points, and guides on how to earn more. Shows status of premium features.
 * @returns {JSX.Element} The rendered Rewards page.
 */
export default function RewardsPage() {
  const t = useTranslations('RewardsPage');
  const tProfile = useTranslations('ProfilePage');
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Combined state for premium features display
  const [premiumFeaturesDisplay, setPremiumFeaturesDisplay] = useState<PremiumFeatureDisplayData[]>([]);


  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingProfile(true);
      try {
        const profile = await get_user(userId);
        setUserProfile(profile);

        // Define premium features and their unlock status based on fetched profile
        const featuresData: PremiumFeatureDisplayData[] = [
          {
            id: 'advancedFilters',
            icon: <Icons.filter className="h-6 w-6 text-primary" />,
            titleKey: 'premiumAdvancedFiltersTitle',
            descriptionKey: 'premiumAdvancedFiltersDesc',
            unlockConditionKey: 'pointsNeeded',
            unlockValue: 500,
            isLocked: !(profile.premiumFeatures?.advancedFilters),
            unlockDetails: t('unlockAdvancedFiltersDetails', { points: 500 }),
          },
          {
            id: 'profileBoost',
            icon: <Icons.trendingUp className="h-6 w-6 text-primary" />,
            titleKey: 'premiumProfileBoostTitle',
            descriptionKey: 'premiumProfileBoostDesc',
            unlockConditionKey: 'badgeNeeded',
            unlockValue: t('badgeTopContributorName'),
            isLocked: !(profile.premiumFeatures?.profileBoost),
            unlockDetails: t('unlockProfileBoostDetails', { badgeName: t('badgeTopContributorName')}),
          },
          {
            id: 'exclusiveModes',
            icon: <Icons.gamepad2 className="h-6 w-6 text-primary" />,
            titleKey: 'premiumExclusiveModesTitle',
            descriptionKey: 'premiumExclusiveModesDesc',
            unlockConditionKey: 'badgeNeeded',
            unlockValue: t('badgeGameMasterName'),
            isLocked: !(profile.premiumFeatures?.exclusiveModes),
            unlockDetails: t('unlockExclusiveModesDetails', { badgeName: t('badgeGameMasterName')}),
          },
        ];
        setPremiumFeaturesDisplay(featuresData);

      } catch (error) {
        console.error("Failed to fetch user data for rewards:", error);
        toast({
          variant: "destructive",
          title: tProfile('fetchErrorTitle'),
          description: tProfile('fetchErrorDescription'),
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [t, tProfile, toast]); // Ensure t and tProfile are stable or part of dependencies if they change

  // Helper to get an icon based on badge type
  const getBadgeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'profile_complete': return <UserCheck className="h-5 w-5 text-green-500" />;
      case 'first_chat': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'first_match': return <Users className="h-5 w-5 text-pink-500" />;
      case 'speed_dater': return <Zap className="h-5 w-5 text-purple-500" />;
      case 'game_winner': return <Gamepad2 className="h-5 w-5 text-red-500" />;
      case 'blind_exchange_participant': return <Eye className="h-5 w-5 text-indigo-500" />;
      case 'explorer': return <MapPin className="h-5 w-5 text-orange-500" />;
      case 'chat_enthusiast': return <MessageCircleHeart className="h-5 w-5 text-teal-500" />;
      case 'top_contributor': return <Award className="h-5 w-5 text-yellow-500" />;
      case 'game_master': return <Trophy className="h-5 w-5 text-amber-600" />;
      default: return <Star className="h-5 w-5 text-gray-400" />;
    }
  };

   const earningMethods = [
     { icon: <UserCheck className="h-4 w-4 text-green-500" />, text: t('earnPointsProfile'), points: t('pointsValue', { value: 50 }) },
     { icon: <MessageSquare className="h-4 w-4 text-blue-500" />, text: t('earnPointsFirstChat'), points: t('pointsValue', { value: 20 }) },
     { icon: <Gamepad2 className="h-4 w-4 text-red-500" />, text: t('earnPointsGameWin'), points: t('pointsValue', { value: 15 }) },
     { icon: <Zap className="h-4 w-4 text-purple-500" />, text: t('earnPointsSpeedDate'), points: t('pointsValue', { value: 25 }) },
     { icon: <Brain className="h-4 w-4 text-indigo-500" />, text: t('earnPointsBlindExchange'), points: t('pointsValue', { value: 30 }) },
     { icon: <MessageCircleHeart className="h-4 w-4 text-teal-500" />, text: t('earnPointsManyMessages'), points: t('pointsValue', { value: 40 }) }, // Example for Chat Enthusiast
   ];


  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
          {/* Points Card */}
          <Card className="lg:col-span-1">
             <CardHeader>
               <CardTitle>{t('yourPoints')}</CardTitle>
               <CardDescription>{t('pointsDesc')}</CardDescription>
             </CardHeader>
             <CardContent className="flex flex-col items-center justify-center space-y-2 h-full pt-6 pb-6">
                 {loadingProfile ? (
                    <>
                     <Skeleton className="h-16 w-16 rounded-full" />
                     <Skeleton className="h-8 w-24 mt-2" />
                    </>
                 ) : userProfile?.points !== undefined ? (
                     <>
                        <Trophy className="h-16 w-16 text-primary mb-2" />
                        <p className="text-5xl font-bold">{userProfile.points}</p>
                        <p className="text-sm text-muted-foreground">{t('pointsSuffix')}</p>
                    </>
                 ) : (
                    <p>{t('noPoints')}</p>
                 )}
             </CardContent>
          </Card>

           {/* Badges Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('myBadges')}</CardTitle>
              <CardDescription>{t('earnedBadgesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProfile ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                     <div key={i} className="flex flex-col items-center space-y-2 p-4 border rounded-lg bg-muted animate-pulse">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-20" />
                     </div>
                  ))}
                </div>
              ) : userProfile?.rewards && userProfile.rewards.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userProfile.rewards.map((reward) => (
                    <div key={reward.id} className="flex flex-col items-center text-center p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-card">
                       <div className="mb-2 p-2 bg-muted rounded-full">
                          {getBadgeIcon(reward.type)}
                       </div>
                      <h3 className="font-semibold text-sm mb-1">{t(`badge_${reward.type}_name`, {}, { fallback: reward.name })}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{t(`badge_${reward.type}_desc`, {}, { fallback: reward.description })}</p>
                       <Badge variant="secondary" className="text-xs">{t('earned')}: {new Date(reward.dateEarned).toLocaleDateString()}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">{t('noBadges')}</p>
              )}
            </CardContent>
          </Card>
      </div>

       {/* How to Earn Points Card */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary"/>{t('howToEarnTitle')}</CardTitle>
                <CardDescription>{t('howToEarnDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {earningMethods.map((method, index) => (
                        <li key={index} className="flex items-center justify-between text-sm p-2 border-b last:border-b-0">
                            <div className="flex items-center gap-2">
                                {method.icon}
                                <span>{method.text}</span>
                            </div>
                            <Badge variant="outline">{method.points}</Badge>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Link href="/dashboard" passHref>
                    <Button variant="link">{t('exploreFeaturesLink')}</Button>
                </Link>
            </CardFooter>
        </Card>

         {/* Premium Features Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary"/>{t('premiumFeaturesTitle')}</CardTitle>
                <CardDescription>{t('premiumFeaturesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loadingProfile ? (
                    [...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-lg"/>)
                ) : premiumFeaturesDisplay.length > 0 ? (
                    premiumFeaturesDisplay.map((feature) => (
                    <Card key={feature.id} className={`relative overflow-hidden flex flex-col ${feature.isLocked ? 'bg-muted/50' : 'bg-card'}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">{t(feature.titleKey)}</CardTitle>
                            {feature.icon}
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-xs text-muted-foreground">{t(feature.descriptionKey)}</p>
                            {feature.isLocked && (
                                <div className="mt-3">
                                    <Badge variant="secondary" className="text-xs">
                                        <Lock className="mr-1 h-3 w-3" />
                                        {t('locked')}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {feature.unlockDetails}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                         {!feature.isLocked && (
                            <CardFooter>
                                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">{t('featureUnlocked')}</Button>
                            </CardFooter>
                        )}
                         {feature.isLocked && (
                             <CardFooter>
                                 <Button size="sm" variant="outline" className="w-full" disabled>{t('unlockFeature')}</Button>
                             </CardFooter>
                         )}
                    </Card>
                ))
                ) : (
                     <p className="text-muted-foreground col-span-full text-center">{t('noPremiumFeatures')}</p>
                )}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">{t('premiumMoreComingSoon')}</p>
             </CardFooter>
        </Card>
    </div>
  );
}
