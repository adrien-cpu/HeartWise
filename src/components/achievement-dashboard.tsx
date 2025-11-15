import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAchievements } from '@/services/achievement_service';
import { Achievement } from '@/types/Achievement';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const AchievementDashboard = () => {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const userAchievements = await getUserAchievements(user.id);
                setAchievements(userAchievements);
            } catch (err) {
                setError('Failed to load achievements.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, [user]);

    if (loading) {
        return <Skeleton className="h-48 w-full" />;
    }

    if (error) {
        return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>{error}</p></CardContent></Card>;
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>My Achievements</CardTitle>
            </CardHeader>
            <CardContent>
                {achievements.length > 0 ? (
                    <div className="space-y-4">
                        {achievements.map((ach) => (
                            <div key={ach.id} className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold">{ach.title}</h4>
                                    <p className="text-sm text-gray-500">{ach.description}</p>
                                </div>
                                {ach.unlocked ? (
                                    <Badge>Unlocked</Badge>
                                ) : (
                                    <div className="w-1/3">
                                        <Progress value={(ach.progress / ach.goal) * 100} />
                                        <p className="text-xs text-right">{ach.progress}/{ach.goal}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No achievements yet. Keep exploring!</p>
                )}
            </CardContent>
        </Card>
    );
};

export default AchievementDashboard;
