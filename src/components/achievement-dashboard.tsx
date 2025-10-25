import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { get_user_achievements } from '@/services/achievement_service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trophy } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  date: string;
}

export const AchievementDashboard = () => {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!user) return;
            try {
                const userAchievements = await get_user_achievements(user.uid);
                setAchievements(userAchievements as Achievement[]);
            } catch (err: any) {
                setError(err.message);
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
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="text-yellow-500" />
                    My Achievements
                </CardTitle>
            </CardHeader>
            <CardContent>
                {achievements.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {achievements.map((ach) => (
                            <Badge key={ach.id} variant="secondary">{ach.name}</Badge>
                        ))}
                    </div>
                ) : (
                    <p>No achievements yet. Keep it up!</p>
                )}
            </CardContent>
        </Card>
    );
};