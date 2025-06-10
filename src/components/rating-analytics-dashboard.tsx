import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ratingAnalyticsService, RatingTrend, UserGoal, RatingComparison } from '@/services/rating_analytics_service';
import { useAuth } from '@/hooks/useAuth';

interface Props {
    userId: string;
}

export function RatingAnalyticsDashboard({ userId }: Props) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [trends, setTrends] = useState<RatingTrend[]>([]);
    const [goals, setGoals] = useState<UserGoal[]>([]);
    const [comparison, setComparison] = useState<RatingComparison | null>(null);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [userId, period]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [trendsData, goalsData, comparisonData] = await Promise.all([
                ratingAnalyticsService.getRatingTrends(userId, period),
                ratingAnalyticsService.getUserGoals(userId),
                ratingAnalyticsService.getRatingComparison(userId),
            ]);

            setTrends(trendsData);
            setGoals(goalsData);
            setComparison(comparisonData);
        } catch (err) {
            setError(t('RatingAnalytics.error'));
            console.error('Erreur lors du chargement des données:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async () => {
        if (!user) return;

        try {
            const newGoal = await ratingAnalyticsService.createGoal({
                userId: user.id,
                type: 'rating',
                target: 4.5,
                current: 0,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
            });

            setGoals([...goals, newGoal]);
        } catch (err) {
            console.error('Erreur lors de la création de l\'objectif:', err);
        }
    };

    if (loading) {
        return <div className="text-center">{t('RatingAnalytics.loading')}</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="trends" className="w-full">
                <TabsList>
                    <TabsTrigger value="trends">{t('RatingAnalytics.trends')}</TabsTrigger>
                    <TabsTrigger value="goals">{t('RatingAnalytics.goals')}</TabsTrigger>
                    <TabsTrigger value="comparison">{t('RatingAnalytics.comparison')}</TabsTrigger>
                </TabsList>

                <TabsContent value="trends">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('RatingAnalytics.trendsTitle')}</CardTitle>
                            <div className="flex space-x-2">
                                <Button
                                    variant={period === 'week' ? 'default' : 'outline'}
                                    onClick={() => setPeriod('week')}
                                >
                                    {t('RatingAnalytics.week')}
                                </Button>
                                <Button
                                    variant={period === 'month' ? 'default' : 'outline'}
                                    onClick={() => setPeriod('month')}
                                >
                                    {t('RatingAnalytics.month')}
                                </Button>
                                <Button
                                    variant={period === 'year' ? 'default' : 'outline'}
                                    onClick={() => setPeriod('year')}
                                >
                                    {t('RatingAnalytics.year')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) => new Date(date).toLocaleDateString()}
                                        />
                                        <YAxis domain={[0, 5]} />
                                        <Tooltip
                                            labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                            formatter={(value: number) => value.toFixed(1)}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="averageRating"
                                            stroke="#8884d8"
                                            name={t('RatingAnalytics.averageRating')}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="goals">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('RatingAnalytics.goalsTitle')}</CardTitle>
                            <Button onClick={handleCreateGoal}>
                                {t('RatingAnalytics.createGoal')}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {goals.map((goal) => (
                                    <div key={goal.id} className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>{t(`RatingAnalytics.goalTypes.${goal.type}`)}</span>
                                            <span>
                                                {goal.current} / {goal.target}
                                            </span>
                                        </div>
                                        <Progress value={(goal.current / goal.target) * 100} />
                                        <div className="text-sm text-gray-500">
                                            {t('RatingAnalytics.deadline')}: {goal.deadline.toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comparison">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('RatingAnalytics.comparisonTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {comparison && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium">
                                                {t('RatingAnalytics.userAverage')}
                                            </h3>
                                            <p className="text-2xl font-bold">
                                                {comparison.userAverage.toFixed(1)}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium">
                                                {t('RatingAnalytics.globalAverage')}
                                            </h3>
                                            <p className="text-2xl font-bold">
                                                {comparison.globalAverage.toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium">
                                            {t('RatingAnalytics.percentile')}
                                        </h3>
                                        <p className="text-2xl font-bold">
                                            {comparison.percentile.toFixed(1)}%
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium">
                                            {t('RatingAnalytics.improvement')}
                                        </h3>
                                        <p className="text-2xl font-bold">
                                            {comparison.improvement > 0 ? '+' : ''}
                                            {comparison.improvement.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 