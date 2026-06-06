import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { achievementService, Achievement, Recommendation } from '@/services/achievement_service';
import { useAuth } from '@/hooks/useAuth';
import {
    Star,
    Users,
    Calendar,
    ThumbsUp,
    MessageSquare,
    Eye,
    Heart,
    Award,
    ArrowRight
} from 'lucide-react';

interface Props {
    userId: string;
}

const getAchievementIcon = (type: string) => {
    switch (type) {
        case 'rating_milestone':
            return <Star className="w-6 h-6 text-yellow-500" />;
        case 'rating_count':
            return <Users className="w-6 h-6 text-blue-500" />;
        case 'active_user':
            return <Calendar className="w-6 h-6 text-green-500" />;
        case 'positive_feedback':
            return <ThumbsUp className="w-6 h-6 text-purple-500" />;
        case 'feedback_provider':
            return <MessageSquare className="w-6 h-6 text-indigo-500" />;
        case 'profile_views':
            return <Eye className="w-6 h-6 text-pink-500" />;
        case 'match_maker':
            return <Heart className="w-6 h-6 text-red-500" />;
        default:
            return <Award className="w-6 h-6 text-gray-500" />;
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high':
            return 'bg-red-100 text-red-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'low':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export function AchievementDashboard({ userId }: Props) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [achievementsData, recommendationsData] = await Promise.all([
                achievementService.getUserAchievements(userId),
                achievementService.getUserRecommendations(userId),
            ]);

            setAchievements(achievementsData);
            setRecommendations(recommendationsData);
        } catch (err) {
            setError(t('AchievementDashboard.error'));
            console.error('Erreur lors du chargement des données:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAction = (actionUrl?: string) => {
        if (actionUrl) {
            window.location.href = actionUrl;
        }
    };

    if (loading) {
        return <div className="text-center">{t('AchievementDashboard.loading')}</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="achievements" className="w-full">
                <TabsList>
                    <TabsTrigger value="achievements">{t('AchievementDashboard.achievements')}</TabsTrigger>
                    <TabsTrigger value="recommendations">{t('AchievementDashboard.recommendations')}</TabsTrigger>
                </TabsList>

                <TabsContent value="achievements">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('AchievementDashboard.achievementsTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {achievements.map((achievement) => (
                                    <Card key={achievement.id} className="relative overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-4">
                                                {getAchievementIcon(achievement.type)}
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{achievement.title}</h3>
                                                    <p className="text-sm text-gray-500">{achievement.description}</p>
                                                    <Progress value={achievement.progress} className="mt-2" />
                                                </div>
                                            </div>
                                            {achievement.completed && (
                                                <Badge className="absolute top-2 right-2 bg-green-500">
                                                    {t('AchievementDashboard.completed')}
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="recommendations">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('AchievementDashboard.recommendationsTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recommendations.map((recommendation) => (
                                    <Card key={recommendation.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-semibold">{recommendation.title}</h3>
                                                        <Badge className={getPriorityColor(recommendation.priority)}>
                                                            {t(`AchievementDashboard.priority.${recommendation.priority}`)}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{recommendation.description}</p>
                                                </div>
                                                {recommendation.actionUrl && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleAction(recommendation.actionUrl)}
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 