import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserChallenges, UserChallenge } from '@/services/challenge_service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const ChallengeDashboard = () => {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState<UserChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChallenges = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const userChallenges = await getUserChallenges(user.id);
                setChallenges(userChallenges);
            } catch (err) {
                setError('Failed to load challenges.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
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
                <CardTitle>Active Challenges</CardTitle>
            </CardHeader>
            <CardContent>
                {challenges.length > 0 ? (
                    <div className="space-y-4">
                        {challenges.map((challenge) => (
                            <div key={challenge.id}>
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-semibold">{challenge.title}</h4>
                                    <Badge variant={challenge.completed ? "default" : "secondary"}>
                                        {challenge.completed ? 'Completed' : 'In Progress'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">{challenge.description}</p>
                                <Progress value={(challenge.progress / challenge.goal) * 100} />
                                <p className="text-xs text-right mt-1">{challenge.progress}/{challenge.goal} {challenge.task}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No active challenges. New challenges appear weekly!</p>
                )}
            </CardContent>
        </Card>
    );
};

export default ChallengeDashboard;
