import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { get_user_rating_analytics, RatingAnalytics } from '@/services/rating_analytics_service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Star } from 'lucide-react';

export const RatingAnalyticsDashboard = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<RatingAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user) return;
            try {
                const userAnalytics = await get_user_rating_analytics(user.uid);
                setAnalytics(userAnalytics);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user]);

    if (loading) {
        return <Skeleton className="h-80 w-full" />;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    const chartData = analytics ? [
        { name: '1 Star', count: analytics.distribution['1'] || 0 },
        { name: '2 Stars', count: analytics.distribution['2'] || 0 },
        { name: '3 Stars', count: analytics.distribution['3'] || 0 },
        { name: '4 Stars', count: analytics.distribution['4'] || 0 },
        { name: '5 Stars', count: analytics.distribution['5'] || 0 },
    ] : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="text-blue-500" />
                    Rating Analytics
                </CardTitle>
            </CardHeader>
            <CardContent>
                {analytics ? (
                    <div>
                        <p className="text-lg font-bold">Average Rating: {analytics.average.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Total Ratings: {analytics.total}</p>
                        <div className="h-64 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <p>No rating data available yet.</p>
                )}
            </CardContent>
        </Card>
    );
};