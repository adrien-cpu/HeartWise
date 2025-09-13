"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lightbulb, UserCheck, MessageSquareText, Star, Trophy, Users, Play, Sparkles, Zap, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { get_user, UserProfile } from '@/services/user_profile';
import Link from 'next/link';

// Mock user ID for demonstration
const userId = 'user1';

interface MockMatch {
  id: string;
  name: string;
  profilePicture: string;
  dataAiHint?: string;
  interests: string[];
  compatibility: number;
}

const mockMatchSuggestion: MockMatch = {
  id: 'match789',
  name: 'Sophia',
  profilePicture: 'https://picsum.photos/seed/sophia/100',
  dataAiHint: 'woman smiling',
  interests: ['Art', 'Yoga', 'Travel'],
  compatibility: 82,
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAdvice, setCurrentAdvice] = useState('');
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await get_user(userId);
        setProfile(userProfile);

        let completeness = 0;
        if (userProfile.name) completeness += 20;
        if (userProfile.bio && userProfile.bio.length > 10) completeness += 20;
        if (userProfile.profilePicture) completeness += 20;
        if (userProfile.interests && userProfile.interests.length > 0) completeness += 20;
        if (userProfile.interests && userProfile.interests.length >= 3) completeness += 20;
        setProfileCompleteness(Math.min(100, completeness));

        const mockAdvices = [
          'Considérez mettre à jour votre bio pour refléter votre humeur ou intérêts actuels.',
          'Essayez d\'initier une conversation avec quelqu\'un qui partage un intérêt unique.',
          'Explorez le mode Échange aveugle pour un type de connexion différent.',
        ];
        setCurrentAdvice(mockAdvices[Math.floor(Math.random() * mockAdvices.length)]);

      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getBadgeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'profile_complete': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'first_chat': return <MessageSquareText className="h-4 w-4 text-blue-500" />;
      default: return <Star className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        {loading ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        ) : profile ? (
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border" data-ai-hint={profile.dataAiHint || "user"}>
              <AvatarImage src={profile.profilePicture || undefined} alt={profile.name || 'User'} />
              <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Bienvenue {profile.name || 'User'} !</h1>
              <p className="text-muted-foreground">Voici votre tableau de bord HeartWise personnalisé.</p>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl font-bold">Bienvenue User !</h1>
        )}
        <Link href="/profile" passHref>
          <Button variant="outline">Éditer le profil</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personalized Advice Card */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              Conseil personnalisé
            </CardTitle>
            <CardDescription>Une suggestion pour améliorer votre expérience</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <p className="text-sm italic leading-relaxed">{`"${currentAdvice}"`}</p>
            )}
          </CardContent>
        </Card>

        {/* Profile Completeness Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              Complétude du profil
            </CardTitle>
            <CardDescription>Complétez votre profil pour de meilleurs matchs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <Progress value={profileCompleteness} className="w-full mb-2 h-3" />
                <p className="text-right text-sm font-medium text-primary">{profileCompleteness}%</p>
                {profileCompleteness < 100 && (
                  <Link href="/profile" passHref>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-1">Compléter le profil</Button>
                  </Link>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="lg:col-span-1 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Actions rapides
            </CardTitle>
            <CardDescription>Accédez directement aux fonctionnalités clés</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link href="/speed-dating" passHref>
              <Button variant="outline" className="w-full flex items-center justify-start gap-2">
                <Zap className="h-4 w-4" /> Speed Dating
              </Button>
            </Link>
            <Link href="/blind-exchange-mode" passHref>
              <Button variant="outline" className="w-full flex items-center justify-start gap-2">
                <Users className="h-4 w-4" /> Échange aveugle
              </Button>
            </Link>
            <Link href="/game" passHref>
              <Button variant="outline" className="w-full flex items-center justify-start gap-2">
                <Play className="h-4 w-4" /> Jeux
              </Button>
            </Link>
            <Link href="/chat" passHref>
              <Button variant="outline" className="w-full flex items-center justify-start gap-2">
                <MessageSquareText className="h-4 w-4" /> Chat
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Mock Match Suggestion Card */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Suggestion de match
            </CardTitle>
            <CardDescription>Quelqu'un qui pourrait vous plaire !</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 p-3 border rounded-lg bg-muted/50">
                <Avatar className="h-16 w-16 border" data-ai-hint={mockMatchSuggestion.dataAiHint || "person"}>
                  <AvatarImage src={mockMatchSuggestion.profilePicture} alt={mockMatchSuggestion.name} />
                  <AvatarFallback>{getInitials(mockMatchSuggestion.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{mockMatchSuggestion.name}</h3>
                  <div className="flex flex-wrap gap-1 my-1">
                    {mockMatchSuggestion.interests.map(interest => (
                      <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-green-600 font-medium">{mockMatchSuggestion.compatibility}% compatible</p>
                </div>
                <Button variant="default" size="sm">Voir le profil</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Stats Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Statistiques rapides</CardTitle>
            <CardDescription>Aperçu de votre activité récente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Points totaux</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    {profile?.points ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Badges gagnés</span>
                  <span className="font-semibold">{profile?.rewards?.length ?? 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Badges Card */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Badges récents</CardTitle>
            <CardDescription>Vos derniers accomplissements</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-20 rounded-md" />
                <Skeleton className="h-10 w-28 rounded-md" />
              </div>
            ) : profile?.rewards && profile.rewards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.rewards.slice(0, 4).map(reward => (
                  <Badge
                    key={reward.id}
                    variant="secondary"
                    className="flex items-center gap-1.5 p-1.5 pr-2.5 text-xs cursor-help"
                    title={`${reward.name}: ${reward.description}`}
                  >
                    {getBadgeIcon(reward.type)}
                    {reward.name}
                  </Badge>
                ))}
                {profile.rewards.length > 4 && (
                  <Link href="/rewards" passHref>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent p-1.5 pr-2.5">+{profile.rewards.length - 4} de plus</Badge>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun badge gagné pour le moment</p>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/rewards" passHref>
              <Button variant="link" className="p-0 h-auto text-sm">Voir toutes les récompenses</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}