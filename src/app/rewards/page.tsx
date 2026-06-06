"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, MessageSquare, Users, Zap, Star, Gamepad2, Eye, MapPin, Trophy, HelpCircle, Lock, Sparkles, Brain, MessageCircleHeart, UserCheck, Filter, TrendingUp, Settings, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { get_user, UserProfile, UserReward, PremiumFeatures } from '@/services/user_profile';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Define unlock thresholds and badge types
const ADVANCED_FILTERS_POINTS_THRESHOLD = 500;
const PROFILE_BOOST_BADGE_TYPE = 'top_contributor'; // Example badge type
const EXCLUSIVE_MODES_BADGE_TYPE = 'game_master';   // Example badge type


interface PremiumFeatureDisplayData {
  id: keyof PremiumFeatures;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  unlockConditionKey: 'pointsNeeded' | 'badgeNeeded';
  unlockValue: string | number;
  isLocked: boolean;
  unlockDetailsKey: string; // Key for translated unlock details string
  progress?: number;
  ctaLink?: string; // Optional link for CTA if feature is unlocked
  ctaKey?: string; // Optional translation key for CTA button
}


/**
 * @fileOverview Implements the Rewards page component.
 * Displays badges earned by the user, their total points, and information on premium features and how to unlock them.
 * User authentication is required.
 */

/**
 * RewardsPage component.
 *
 * @component
 * @description Displays the user's earned badges, rewards, total points, and guides on how to earn more. Shows status and progress of premium features.
 * @returns {JSX.Element} The rendered Rewards page.
 */
const RewardsPage = () => {
  const t = useTranslations('RewardsPage');
  const tProfile = useTranslations('ProfilePage');
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [premiumFeaturesDisplay, setPremiumFeaturesDisplay] = useState<PremiumFeatureDisplayData[]>([]);


  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      setLoadingProfile(true);
      try {
        const profile = await get_user(currentUser.uid);
        setUserProfile(profile);

        const features = profile.premiumFeatures || { advancedFilters: false, profileBoost: false, exclusiveModes: false };
        const userPoints = profile.points || 0;
        const userRewards = profile.rewards || [];

        const featuresData: PremiumFeatureDisplayData[] = [
          {
            id: 'advancedFilters',
            icon: <Filter className="h-6 w-6 text-primary" />,
            titleKey: 'premiumAdvancedFiltersTitle',
            descriptionKey: 'premiumAdvancedFiltersDesc',
            unlockConditionKey: 'pointsNeeded',
            unlockValue: ADVANCED_FILTERS_POINTS_THRESHOLD,
            isLocked: !(features.advancedFilters),
            unlockDetailsKey: 'unlockAdvancedFiltersDetails',
            progress: features.advancedFilters ? 100 : Math.min(100, Math.floor((userPoints / ADVANCED_FILTERS_POINTS_THRESHOLD) * 100)),
            ctaLink: "/some-search-page-with-filters", // Example link
            ctaKey: "useAdvancedFilters"
          },
          {
            id: 'profileBoost',
            icon: <TrendingUp className="h-6 w-6 text-primary" />,
            titleKey: 'premiumProfileBoostTitle',
            descriptionKey: 'premiumProfileBoostDesc',
            unlockConditionKey: 'badgeNeeded',
            unlockValue: PROFILE_BOOST_BADGE_TYPE,
            isLocked: !(features.profileBoost),
            unlockDetailsKey: 'unlockProfileBoostDetails',
            progress: features.profileBoost || userRewards.some(r => r.type === PROFILE_BOOST_BADGE_TYPE) ? 100 : 0,
            ctaLink: "/profile?boost=true", // Example link
            ctaKey: "activateProfileBoost"
          },
          {
            id: 'exclusiveModes',
            icon: <Gamepad2 className="h-6 w-6 text-primary" />,
            titleKey: 'premiumExclusiveModesTitle',
            descriptionKey: 'premiumExclusiveModesDesc',
            unlockConditionKey: 'badgeNeeded',
            unlockValue: EXCLUSIVE_MODES_BADGE_TYPE,
            isLocked: !(features.exclusiveModes),
            unlockDetailsKey: 'unlockExclusiveModesDetails',
            progress: features.exclusiveModes || userRewards.some(r => r.type === EXCLUSIVE_MODES_BADGE_TYPE) ? 100 : 0,
            ctaLink: "/game?mode=exclusive", // Example link
            ctaKey: "playExclusiveGames"
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
        setUserProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [currentUser, authLoading, router, t, tProfile, toast]);

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
    { icon: <Eye className="h-4 w-4 text-indigo-500" />, text: t('earnPointsBlindExchange'), points: t('pointsValue', { value: 30 }) },
    { icon: <MessageCircleHeart className="h-4 w-4 text-teal-500" />, text: t('earnPointsManyMessages'), points: t('pointsValue', { value: 40 }) },
  ];

  if (authLoading || (loadingProfile && !currentUser)) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        <p className="text-destructive mb-4">{t('authRequired')}</p>
        <Button onClick={() => router.push('/login')}>{tProfile('returnToLogin')}</Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
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
                    <h3 className="font-semibold text-sm mb-1">{t(`badge_${reward.type}_name`, { defaultValue: reward.name })}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{t(`badge_${reward.type}_desc`, { defaultValue: reward.description })}</p>
                    <Badge variant="secondary" className="text-xs">{t('earned')}: {new Date(reward.dateEarned.toDate()).toLocaleDateString()}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">{t('noBadges')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" />{t('howToEarnTitle')}</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" />{t('premiumFeaturesTitle')}</CardTitle>
          <CardDescription>{t('premiumFeaturesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingProfile ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-60 w-full rounded-lg" />)
          ) : premiumFeaturesDisplay.length > 0 ? (
            premiumFeaturesDisplay.map((feature) => (
              <Card key={feature.id} className={`relative overflow-hidden flex flex-col ${feature.isLocked ? 'bg-muted/50' : 'bg-card border-green-500 shadow-green-200/50 shadow-md'}`}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium">{t(feature.titleKey)}</CardTitle>
                    <CardDescription className="text-xs">{t(feature.descriptionKey)}</CardDescription>
                  </div>
                  {feature.icon}
                </CardHeader>
                <CardContent className="flex-grow pt-2 space-y-2">
                  {feature.isLocked ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Lock className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{t('locked')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t(feature.unlockDetailsKey, {
                          points: feature.unlockConditionKey === 'pointsNeeded' ? feature.unlockValue : '',
                          badgeName: feature.unlockConditionKey === 'badgeNeeded' ? t(`badge_${feature.unlockValue}_name`) : ''
                        })}
                      </p>
                      {feature.progress !== undefined && feature.progress < 100 && (
                        <div className="pt-2">
                          <Progress value={feature.progress} className="h-1.5" aria-label={`${t('unlockProgress')} ${feature.progress}%`} />
                          <p className="text-xs text-muted-foreground mt-1 text-right">{feature.progress}%</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-600">{t('featureUnlocked')}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    size="sm"
                    variant={feature.isLocked ? "outline" : "default"}
                    className="w-full"
                    disabled={feature.isLocked}
                    onClick={() => {
                      if (feature.ctaLink && !feature.isLocked) {
                        router.push(feature.ctaLink);
                      } else if (feature.isLocked) {
                        toast({
                          title: t('featureLockedTitle'),
                          description: t(feature.unlockDetailsKey, {
                            points: feature.unlockConditionKey === 'pointsNeeded' ? feature.unlockValue : '',
                            badgeName: feature.unlockConditionKey === 'badgeNeeded' ? t(`badge_${feature.unlockValue}_name`) : ''
                          })
                        });
                      } else {
                        toast({ title: t(feature.titleKey), description: t('featureInDevelopment') });
                      }
                    }}
                  >
                    {feature.isLocked ? t('unlockFeature') : t(feature.ctaKey || 'useFeature')}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center">{t('noPremiumFeatures')}</p>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            {t('premiumFeaturesNote')}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RewardsPage;