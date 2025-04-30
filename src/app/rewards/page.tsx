"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, MessageSquare, Users, Zap, Star, Gamepad2, Eye, MapPin, Trophy, HelpCircle, Lock } from 'lucide-react'; // Added HelpCircle, Lock icons
import { Skeleton } from '@/components/ui/skeleton';
import { get_user_rewards, UserReward, get_user_points } from '@/services/user_profile'; // Import points related functions
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Mock user ID - replace with actual user identification
const userId = 'user1';

/**
 * @fileOverview Implements the Rewards page component.
 * Displays badges earned by the user, their total points, and placeholder sections for earning points and premium features.
 */

/**
 * RewardsPage component.
 *
 * @component
 * @description Displays the user's earned badges, rewards, total points, and guides on how to earn more. Includes placeholders for potential premium features unlocked by points/rewards. **Requires Backend:** Actual point/reward tracking, unlocking logic for premium features.
 * @returns {JSX.Element} The rendered Rewards page.
 */
export default function RewardsPage() {
  const t = useTranslations('RewardsPage');
  const { toast } = useToast();
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [points, setPoints] = useState<number | null>(null);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [loadingPoints, setLoadingPoints] = useState(true);

  useEffect(() => {
    /**
     * Fetches the user's rewards data.
     * @async
     */
    const fetchRewards = async () => {
      setLoadingRewards(true);
      try {
        const userRewards = await get_user_rewards(userId);
        setRewards(userRewards);
      } catch (error) {
        console.error("Failed to fetch rewards:", error);
        toast({
          variant: "destructive",
          title: t('fetchErrorTitle'),
          description: t('fetchErrorDescription'),
        });
      } finally {
        setLoadingRewards(false);
      }
    };

    /**
     * Fetches the user's points data.
     * @async
     */
     const fetchPoints = async () => {
        setLoadingPoints(true);
        try {
            const userPoints = await get_user_points(userId);
            setPoints(userPoints);
        } catch (error) {
            console.error("Failed to fetch points:", error);
             toast({
               variant: "destructive",
               title: t('fetchErrorTitle'), // Can reuse or create a specific title
               description: "Could not load your points.", // Simplified description
             });
        } finally {
            setLoadingPoints(false);
        }
    };


    fetchRewards();
    fetchPoints();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // Removed t from dependency array as it's stable

  // Helper to get an icon based on badge type (customize as needed)
  const getBadgeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'profile_complete': return <Award className="h-5 w-5 text-yellow-500" />;
      case 'first_chat': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'first_match': return <Users className="h-5 w-5 text-green-500" />;
      case 'speed_dater': return <Zap className="h-5 w-5 text-purple-500" />;
      case 'game_winner': return <Gamepad2 className="h-5 w-5 text-red-500" />;
      case 'blind_exchange_participant': return <Eye className="h-5 w-5 text-gray-500" />;
      case 'explorer': return <MapPin className="h-5 w-5 text-orange-500" />;
      default: return <Star className="h-5 w-5 text-gray-400" />;
    }
  };

   // Mock data for "How to Earn Points"
   const earningMethods = [
     { icon: <Award className="h-4 w-4 text-yellow-500" />, text: t('earnPointsProfile'), points: t('pointsValue', { value: 50 }) },
     { icon: <MessageSquare className="h-4 w-4 text-blue-500" />, text: t('earnPointsFirstChat'), points: t('pointsValue', { value: 20 }) },
     { icon: <Gamepad2 className="h-4 w-4 text-red-500" />, text: t('earnPointsGameWin'), points: t('pointsValue', { value: 15 }) },
     { icon: <Zap className="h-4 w-4 text-purple-500" />, text: t('earnPointsSpeedDate'), points: t('pointsValue', { value: 25 }) },
   ];

   // Mock data for "Premium Features"
   const premiumFeatures = [
       { icon: <Lock className="h-4 w-4 text-primary"/>, text: t('premiumFeatureAdvancedFilters') },
       { icon: <Lock className="h-4 w-4 text-primary"/>, text: t('premiumFeatureSeeLikes') },
       { icon: <Lock className="h-4 w-4 text-primary"/>, text: t('premiumFeatureProfileBoost') },
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
                 {loadingPoints ? (
                    <>
                     <Skeleton className="h-16 w-16 rounded-full" />
                     <Skeleton className="h-8 w-24 mt-2" />
                    </>
                 ) : points !== null ? (
                     <>
                        <Trophy className="h-16 w-16 text-primary mb-2" />
                        <p className="text-5xl font-bold">{points}</p>
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
              {loadingRewards ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                     <div key={i} className="flex flex-col items-center space-y-2 p-4 border rounded-lg bg-muted animate-pulse">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-20" />
                     </div>
                  ))}
                </div>
              ) : rewards.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {rewards.map((reward) => (
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
                        <li key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                {method.icon}
                                <span>{method.text}</span>
                            </div>
                            <Badge variant="outline">{method.points}</Badge>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>

         {/* Premium Features Placeholder Card */}
        <Card>
            <CardHeader>
                <CardTitle>{t('premiumFeaturesTitle')}</CardTitle>
                <CardDescription>{t('premiumFeaturesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                 <ul className="space-y-3">
                    {premiumFeatures.map((feature, index) => (
                         <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            {feature.icon}
                            <span>{feature.text} ({t('comingSoon')})</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>

    </div>
  );
}
