import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { get_user_challenges } from '@/services/challenge_service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Flame } from 'lucide-react';

interface Challenge {
  id: string;
  name: string;
  description: string;
  progress: number;
  goal: number;
}

export const ChallengeDashboard = () => {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChallenges = async () => {
            if (!user) return;
            try {
                const userChallenges = await get_user_challenges(user.uid);
                setChallenges(userChallenges as Challenge[]);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, [user]);

    if (loading) {
        return <Skeleton className="h-64 w-full" />;
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
                    <Flame className="text-orange-500" />
                    Active Challenges
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {challenges.length > 0 ? (
                    challenges.map((challenge) => (
                        <div key={challenge.id}>
                            <p className="font-semibold">{challenge.name}</p>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                            <Progress value={(challenge.progress / challenge.goal) * 100} className="mt-2" />
                        </div>
                    ))
                ) : (
                    <p>No active challenges. Go start one!</p>
                )}
            </CardContent>
        </Card>
    );
};