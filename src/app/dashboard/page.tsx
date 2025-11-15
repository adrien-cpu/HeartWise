"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lightbulb, UserCheck, MessageSquareText, BrainCircuit, Trophy, Users, Play, Sparkles, Zap, Heart } from 'lucide-react'; // Added BrainCircuit
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from "@/types/UserProfile";
import { calculateTraitCompatibility, getCompatibilityBreakdown, CompatibilityBreakdown } from '@/services/compatibility';
import { CompatibilityBreakdownDialog } from '@/components/dashboard/CompatibilityBreakdownDialog';
import Link from 'next/link';

interface MatchSuggestion extends UserProfile {
  compatibility: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matchSuggestions, setMatchSuggestions] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdvice, setCurrentAdvice] = useState('');
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  const [selectedMatch, setSelectedMatch] = useState<UserProfile | null>(null);
  const [breakdown, setBreakdown] = useState<CompatibilityBreakdown | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const userDocRef = doc(firestore, "users", user.id);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          setLoading(false);
          return;
        }
        const currentUserProfile = { id: user.id, ...userDocSnap.data() } as UserProfile;
        setUserProfile(currentUserProfile);
        calculateProfileCompleteness(currentUserProfile);

        const usersCollectionRef = collection(firestore, "users");
        const usersSnapshot = await getDocs(usersCollectionRef);
        const allUsers: UserProfile[] = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
          .filter(p => p.id !== user.id && p.questionnaireAnswers);

        const suggestions: MatchSuggestion[] = allUsers.map(otherUser => ({
          ...otherUser,
          compatibility: calculateTraitCompatibility(currentUserProfile, otherUser),
        }));

        const sortedSuggestions = suggestions.sort((a, b) => b.compatibility - a.compatibility);
        setMatchSuggestions(sortedSuggestions.slice(0, 5));

        const mockAdvices = [
          'Considérez mettre à jour votre bio pour refléter votre humeur ou intérêts actuels.',
          'Essayez d\'initier une conversation avec quelqu\'un qui partage un intérêt unique.',
          'Explorez le mode Échange aveugle pour un type de connexion différent.',
        ];
        setCurrentAdvice(mockAdvices[Math.floor(Math.random() * mockAdvices.length)]);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading]);

  const handleViewBreakdown = (match: UserProfile) => {
    if (userProfile) {
      const breakdownData = getCompatibilityBreakdown(userProfile, match);
      setSelectedMatch(match);
      setBreakdown(breakdownData);
      setIsBreakdownOpen(true);
    }
  };

  const calculateProfileCompleteness = (profile: UserProfile) => {
    let completeness = 0;
    if (profile.name) completeness += 20;
    if (profile.bio && profile.bio.length > 10) completeness += 20;
    if (profile.profilePicture) completeness += 20;
    if (profile.questionnaireAnswers && Object.keys(profile.questionnaireAnswers).length > 0) completeness += 40;
    setProfileCompleteness(Math.min(100, completeness));
  }

  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
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
            ) : userProfile ? (
            <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border">
                <AvatarImage src={userProfile.profilePicture || undefined} alt={userProfile.name || 'User'} />
                <AvatarFallback className="text-2xl">{getInitials(userProfile.name)}</AvatarFallback>
                </Avatar>
                <div>
                <h1 className="text-3xl font-bold">Bienvenue {userProfile.name || 'User'} !</h1>
                <p className="text-muted-foreground">Voici votre tableau de bord HeartWise personnalisé.</p>
                </div>
            </div>
            ) : (
            <h1 className="text-3xl font-bold">Bienvenue sur HeartWise</h1>
            )}
            <Link href="/profile" passHref>
            <Button variant="outline">Éditer le profil</Button>
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lightbulb className="h-6 w-6 text-primary" /> Conseil personnalisé</CardTitle>
                </CardHeader>
                <CardContent>{loading ? <Skeleton className="h-10 w-full" /> : <p className="text-sm italic leading-relaxed">{`"${currentAdvice}"`}</p></CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCheck className="h-6 w-6 text-primary" /> Complétude du profil</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-full" /> : <><Progress value={profileCompleteness} className="w-full mb-2 h-3" /><p className="text-right text-sm font-medium text-primary">{profileCompleteness}%</p>{profileCompleteness < 100 && <Link href="/profile" passHref><Button variant="link" size="sm" className="p-0 h-auto mt-1">Compléter le profil</Button></Link>}</>}
                </CardContent>
            </Card>

             <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Heart className="h-6 w-6 text-primary" /> Suggestions de matchs</CardTitle>
                    <CardDescription>Profils sélectionnés en fonction de votre compatibilité.</CardDescription>
                </CardHeader>
                <CardContent>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg bg-muted/50">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="flex-grow space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : matchSuggestions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matchSuggestions.map(match => (
                        <div key={match.id} className="flex flex-col items-center text-center p-4 border rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <Avatar className="h-20 w-20 border mb-3">
                            <AvatarImage src={match.profilePicture} alt={match.name} />
                            <AvatarFallback>{getInitials(match.name)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-lg font-semibold">{match.name}</h3>
                        <p className="text-sm text-green-600 font-medium mb-2">{match.compatibility}% compatible</p>
                        <Button variant="default" size="sm" onClick={() => handleViewBreakdown(match)}>Voir la compatibilité</Button>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">Aucune suggestion pour le moment. Complétez votre questionnaire pour commencer !</p>
                )}
                </CardContent>
            </Card>

            <Card className="lg:col-span-1 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> Actions rapides</CardTitle>
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
                    <Link href="/culture-quiz" passHref>
                    <Button variant="outline" className="w-full flex items-center justify-start gap-2">
                        <BrainCircuit className="h-4 w-4" /> Quiz Découverte
                    </Button>
                    </Link>
                    <Link href="/chat" passHref>
                    <Button variant="outline" className="w-full flex items-center justify-start gap-2">
                        <MessageSquareText className="h-4 w-4" /> Chat
                    </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </div>

      {selectedMatch && (
        <CompatibilityBreakdownDialog
          isOpen={isBreakdownOpen}
          onClose={() => setIsBreakdownOpen(false)}
          breakdown={breakdown}
          userName={selectedMatch.name || 'ce profil'}
        />
      )}
    </>
  );
}
