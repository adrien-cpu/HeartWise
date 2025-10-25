"use client"

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, MessageSquare, Users, Zap, Star, Gamepad2, Eye, MapPin, Trophy, HelpCircle, Lock, Sparkles, Brain, MessageCircleHeart, UserCheck, Filter, TrendingUp, Settings, Loader2, Gem, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { get_user, UserProfile, UserReward, PremiumFeatures } from '@/services/user_profile';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Reward {
    id: string;
    title: string;
    description: string;
    cost: number; // Points cost
}

// In a real app, this would come from a static config or a 'rewards' collection in Firestore
const availableRewards: Reward[] = [
    { id: 'reward1', title: 'Profile Badge', description: 'Get a special badge on your profile.', cost: 100 },
    { id: 'reward2', title: 'Spotlight Hour', description: 'Feature your profile for one hour.', cost: 250 },
    { id: 'reward3', title: '5 Extra Swipes', description: 'Get 5 extra daily swipes.', cost: 50 },
];

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
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [premiumFeaturesDisplay, setPremiumFeaturesDisplay] = useState<any[]>([]);
  const [points, setPoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const fetchPoints = async () => {
        try {
            setLoadingPoints(true);
            // This is a placeholder. You need a robust service to get user points.
            // For demo, we'll just use a mock value.
            setTimeout(() => { // Simulating network delay
                setPoints(500); // Mock points
                setLoadingPoints(false);
            }, 1000)

        } catch (err) {
            console.error("Error fetching user points: ", err);
            setError("Failed to load your points.");
            setLoadingPoints(false);
        }
    };

    fetchPoints();

  }, [currentUser, authLoading, router, toast, t]);

    const handleRedeem = (reward: Reward) => {
        if (points < reward.cost) {
            alert("You don't have enough points for this reward.");
            return;
        }
        // In a real app, you would have a Firestore function or backend endpoint
        // to handle the reward redemption logic atomically.
        console.log(`Redeeming ${reward.title} for ${currentUser?.uid}`);
        alert(`${reward.title} redeemed! (Simulation)`);
        setPoints(points - reward.cost);
    };

    if (authLoading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>
    }

    if (!currentUser) {
        return (
            <div className="container mx-auto p-4 flex justify-center">
                <Alert variant="destructive" className="max-w-lg">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Please Log In</AlertTitle>
                <AlertDescription>You need to be logged in to view and redeem rewards.</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold">Rewards Center</h1>
                <p className="text-lg text-gray-600">Use your points to unlock special features!</p>
                <Card className="max-w-xs mx-auto mt-4">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Your Points</CardTitle>
                        <Gem className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {loadingPoints ? 
                            <Loader2 className="h-6 w-6 animate-spin" /> : 
                            <div className="text-2xl font-bold">{points}</div>
                        }
                    </CardContent>
                </Card>
            </header>

            {error && (
                <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRewards.map(reward => (
                    <Card key={reward.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{reward.title}</CardTitle>
                            <CardDescription>{reward.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                           <div className="flex items-center text-lg font-bold text-primary">
                             <Gem className="h-5 w-5 mr-2" />
                             <span>{reward.cost} Points</span>
                           </div>
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Button 
                                onClick={() => handleRedeem(reward)} 
                                disabled={points < reward.cost || loadingPoints}
                                className="w-full"
                            >
                                Redeem
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default RewardsPage;
