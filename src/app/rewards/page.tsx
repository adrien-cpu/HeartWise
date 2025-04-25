
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, MessageSquare, Users, Zap, Star, Gamepad2, Eye, MapPin } from 'lucide-react'; // Example icons
import { Skeleton } from '@/components/ui/skeleton';
import { get_user_rewards, UserReward } from '@/services/user_profile'; // Assuming this service exists
import { useToast } from '@/hooks/use-toast';

// Mock user ID - replace with actual user identification
const userId = 'user1';

/**
 * @fileOverview Implements the Rewards page component.
 * Displays badges earned by the user based on their activity.
 */

/**
 * RewardsPage component.
 *
 * @component
 * @description Displays the user's earned badges and rewards.
 * @returns {JSX.Element} The rendered Rewards page.
 */
export default function RewardsPage() {
  const t = useTranslations('RewardsPage');
  const { toast } = useToast();
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Fetches the user's rewards data.
     * @async
     */
    const fetchRewards = async () => {
      setLoading(true);
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
        setLoading(false);
      }
    };
    fetchRewards();
  }, [t, toast]); // Added t and toast to dependency array

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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>
      <p className="text-center text-muted-foreground mb-6">{t('description')}</p>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{t('myBadges')}</CardTitle>
          <CardDescription>{t('earnedBadgesDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                 <div key={i} className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-24" />
                 </div>
              ))}
            </div>
          ) : rewards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex flex-col items-center text-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                   <div className="mb-2 p-3 bg-muted rounded-full">
                      {getBadgeIcon(reward.type)}
                   </div>
                  <h3 className="font-semibold text-sm mb-1">{t(`badge_${reward.type}_name`, {}, { fallback: reward.name })}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{t(`badge_${reward.type}_desc`, {}, { fallback: reward.description })}</p>
                   <Badge variant="secondary">{t('earned')}: {new Date(reward.dateEarned).toLocaleDateString()}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">{t('noBadges')}</p>
          )}
        </CardContent>
      </Card>

        {/* Future sections for hidden modes or premium access based on rewards */}
        {/* <Card className="max-w-4xl mx-auto mt-8"> ... </Card> */}
    </div>
  );
}

