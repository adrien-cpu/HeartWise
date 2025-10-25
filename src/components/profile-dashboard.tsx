import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User } from 'lucide-react';

export const ProfileDashboard = () => {
    const { user } = useAuth();
    const { userProfile, loading, error } = useUserProfile();

    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        );
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
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={userProfile?.profilePicture || ''} alt={userProfile?.name || 'User'} />
                    <AvatarFallback>{userProfile?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <User />
                        {userProfile?.name}
                    </CardTitle>
                    <CardDescription>{userProfile?.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <p>{userProfile?.bio || 'No bio available.'}</p>
            </CardContent>
        </Card>
    );
};