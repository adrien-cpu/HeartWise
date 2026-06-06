import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Star, Calendar, Users, Award } from 'lucide-react';
import { leaderboardService, LeaderboardEntry, SpecialEvent } from '@/services/leaderboard_service';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardDashboardProps {
    userId: string;
}

export function LeaderboardDashboard({ userId }: LeaderboardDashboardProps) {
    const t = useTranslations('LeaderboardDashboard');
    const { user } = useAuth();
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
    const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [leaderboard, rank, events] = await Promise.all([
                leaderboardService.getWeeklyLeaderboard(),
                leaderboardService.getUserRank(userId),
                leaderboardService.getSpecialEvents(),
            ]);

            setWeeklyLeaderboard(leaderboard);
            setUserRank(rank);
            setSpecialEvents(events);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleJoinEvent = async (eventId: string) => {
        try {
            await leaderboardService.joinSpecialEvent(userId, eventId);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                <p>{error}</p>
                <Button variant="outline" onClick={loadData} className="mt-4">
                    {t('retry')}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="weekly" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="weekly">
                        <Trophy className="w-4 h-4 mr-2" />
                        {t('weeklyLeaderboard')}
                    </TabsTrigger>
                    <TabsTrigger value="events">
                        <Calendar className="w-4 h-4 mr-2" />
                        {t('specialEvents')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="weekly" className="space-y-4">
                    {userRank && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    {t('yourRank')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={userRank.avatarUrl} />
                                            <AvatarFallback>{userRank.username[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{userRank.username}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {t('rank', { rank: userRank.rank })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{userRank.score}</p>
                                        <p className="text-sm text-muted-foreground">{t('points')}</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>{t('streak')}</span>
                                        <span>{userRank.streak} {t('days')}</span>
                                    </div>
                                    <Progress value={(userRank.streak / 7) * 100} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('topRankings')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {weeklyLeaderboard.slice(0, 10).map((entry, index) => (
                                    <div key={entry.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 text-center font-bold">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </div>
                                            <Avatar>
                                                <AvatarImage src={entry.avatarUrl} />
                                                <AvatarFallback>{entry.username[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{entry.username}</p>
                                                <div className="flex gap-2">
                                                    {entry.specialAchievements.map((achievement, i) => (
                                                        <Badge key={i} variant="secondary">
                                                            {achievement}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{entry.score}</p>
                                            <p className="text-sm text-muted-foreground">{t('points')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="events" className="space-y-4">
                    {specialEvents.map((event) => (
                        <Card key={event.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{event.title}</CardTitle>
                                    <Badge variant={event.type === 'premium' ? 'secondary' : 'default'}>
                                        {t(`eventType.${event.type}`)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">{event.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">
                                            {t('eventDate', {
                                                start: new Date(event.startDate).toLocaleDateString(),
                                                end: new Date(event.endDate).toLocaleDateString(),
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm">
                                            {t('participants', { count: event.participants.length })}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium">{t('rewards')}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm">{t('rewards.top1')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">{t('rewards.top10')}</span>
                                        </div>
                                    </div>
                                </div>

                                {!event.participants.includes(userId) && (
                                    <Button
                                        onClick={() => handleJoinEvent(event.id)}
                                        className="w-full mt-4"
                                        variant={event.type === 'premium' ? 'secondary' : 'default'}
                                    >
                                        {t('joinEvent')}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
} 