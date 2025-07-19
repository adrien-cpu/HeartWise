"use client";

import React from 'react';
import { Link } from 'next-intl'; // Corrected import
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCheck, MessageSquareText, Users, Zap, Gamepad, Eye, MapPin, Award, Trophy, Star } from 'lucide-react';
import { UserProfile } from '@/services/user_profile';

interface RecentBadgesCardProps {
  loading: boolean;
  profile: UserProfile | null;
}

const getBadgeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'profile_complete': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'first_chat': return <MessageSquareText className="h-4 w-4 text-blue-500" />;
      case 'first_match': return <Users className="h-4 w-4 text-pink-500" />;
      case 'speed_dater': return <Zap className="h-4 w-4 text-purple-500" />;
      case 'game_winner': return <Gamepad className="h-4 w-4 text-red-500" />;
      case 'blind_exchange_participant': return <Eye className="h-4 w-4 text-indigo-500" />;
      case 'explorer': return <MapPin className="h-4 w-4 text-orange-500" />;
      case 'chat_enthusiast': return <MessageSquareText className="h-4 w-4 text-teal-500" />;
      case 'top_contributor': return <Award className="h-4 w-4 text-yellow-500" />;
      case 'game_master': return <Trophy className="h-4 w-4 text-amber-600" />;
      default: return <Star className="h-4 w-4 text-gray-400" />;
    }
};

export const RecentBadgesCard: React.FC<RecentBadgesCardProps> = ({ loading, profile }) => {
  const tDashboard = useTranslations('DashboardPage');
  const tRewards = useTranslations('RewardsPage');

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl">{tDashboard('recentBadgesTitle')}</CardTitle>
        <CardDescription>{tDashboard('recentBadgesDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        ) : profile?.rewards && profile.rewards.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.rewards.slice(0, 4).map(reward => (
              <Badge 
                key={reward.id} 
                variant="outline" 
                className="flex items-center gap-1.5 p-2 text-sm cursor-help border-gray-300" 
                title={`${tRewards(`badge_${reward.type}_name`)}: ${tRewards(`badge_${reward.type}_desc`)}`}
              >
                {getBadgeIcon(reward.type)}
                {tRewards(`badge_${reward.type}_name`)}
              </Badge>
            ))}
            {profile.rewards.length > 4 && (
              <Link href="/rewards" passHref>
                <Badge variant="secondary" className="text-sm cursor-pointer hover:bg-accent p-2">
                  +{profile.rewards.length - 4} {tDashboard('moreBadges')}
                </Badge>
              </Link>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">{tRewards('noBadges')}</p>
        )}
      </CardContent>
      {profile?.rewards && profile.rewards.length > 0 && (
        <CardFooter>
            <Link href="/rewards" passHref>
                <Button variant="link" className="p-0 h-auto text-sm text-primary hover:underline">
                    {tDashboard('viewAllRewards')}
                </Button>
            </Link>
        </CardFooter>
      )}
    </Card>
  );
};
