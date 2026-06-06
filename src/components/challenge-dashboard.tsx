import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { challengeService, Challenge, UserChallenge } from '@/services/challenge_service';
import { useAuth } from '@/hooks/useAuth';
import {
    Trophy,
    Star,
    Camera,
    Users,
    Calendar,
    Gift,
    Clock,
    CheckCircle
} from 'lucide-react';

interface Props {
    userId: string;
}

const getChallengeIcon = (type: string) => {
    switch (type) {
        case 'matches_made':
            return <Users className="w-6 h-6 text-blue-500" />;
        case 'profile_completion':
            return <Star className="w-6 h-6 text-yellow-500" />;
        case 'photo_uploads':
            return <Camera className="w-6 h-6 text-purple-500" />;
        case 'active_days':
            return <Calendar className="w-6 h-6 text-green-500" />;
        default:
            return <Trophy className="w-6 h-6 text-gray-500" />;
    }
};

const getRewardIcon = (type: string) => {
    switch (type) {
        case 'badge':
            return <Trophy className="w-4 h-4" />;
        case 'points':
            return <Star className="w-4 h-4" />;
        case 'premium':
            return <Gift className="w-4 h-4" />;
        default:
            return null;
    }
};

export function ChallengeDashboard({ userId }: Props) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [activeChallenges, userChallengesData] = await Promise.all([
                challengeService.getActiveChallenges(userId),
                challengeService.getUserChallenges(userId),
            ]);

            setChallenges(activeChallenges);
            setUserChallenges(userChallengesData);
        } catch (err) {
            setError(t('ChallengeDashboard.error'));
            console.error('Erreur lors du chargement des données:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleJoinChallenge = async (challengeId: string) => {
        try {
            await challengeService.updateChallengeProgress(userId, challengeId, 0);
            await loadData();
        } catch (err) {
            console.error('Erreur lors de la participation au défi:', err);
        }
    };

    if (loading) {
        return <div className="text-center">{t('ChallengeDashboard.loading')}</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('ChallengeDashboard.currentChallenges')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {challenges.map((challenge) => {
                            const userChallenge = userChallenges.find(uc => uc.challengeId === challenge.id);
                            const isParticipating = userChallenge !== undefined;
                            const isCompleted = userChallenge?.completed;

                            return (
                                <Card key={challenge.id} className="relative overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-4">
                                            {getChallengeIcon(challenge.type)}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold">{challenge.title}</h3>
                                                    {isCompleted && (
                                                        <Badge className="bg-green-500">
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            {t('ChallengeDashboard.completed')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>

                                                {isParticipating && (
                                                    <div className="mt-2">
                                                        <Progress value={userChallenge.progress} className="mb-2" />
                                                        <div className="text-sm text-gray-500">
                                                            {t('ChallengeDashboard.progress')}: {userChallenge.progress}%
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getRewardIcon(challenge.rewards.type)}
                                                        <span className="text-sm">
                                                            {t(`ChallengeDashboard.reward.${challenge.rewards.type}`)}: {challenge.rewards.value}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm text-gray-500">
                                                            {t('ChallengeDashboard.timeLeft')}: {Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} {t('ChallengeDashboard.days')}
                                                        </span>
                                                    </div>
                                                </div>

                                                {!isParticipating && !isCompleted && (
                                                    <Button
                                                        className="w-full mt-4"
                                                        onClick={() => handleJoinChallenge(challenge.id)}
                                                    >
                                                        {t('ChallengeDashboard.join')}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 