"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import dynamic from 'next/dynamic';
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Trophy, ListOrdered, Play, Check, X, RotateCcw, Gamepad2 } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import AuthGuard from "@/components/auth-guard";
import { useRouter } from "next/navigation";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Question, Difficulty } from '@/ai/questionnaires/questionnaire_structure';
import * as ExampleQuestions from '@/ai/questionnaires/examples';
import { get_user_game_preferences, set_user_game_preferences, get_all_users, add_user_points, add_user_reward, UserProfile } from '@/services/user_profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Dynamically import TimesUpGame
const TimesUpGame = dynamic(() => import('@/components/game/times-up'), {
  loading: () => <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false // Time's Up game might have client-side specific logic that's better off not SSR'd
});

// Combine all example questions into one array
const allGKQuestions: Question[] = [
  ...ExampleQuestions.EXAMPLE_QUESTIONS_SCIENCE_EASY,
  ...ExampleQuestions.EXAMPLE_QUESTIONS_SCIENCE_MEDIUM,
  ...ExampleQuestions.EXAMPLE_QUESTIONS_SCIENCE_HARD,
  ...ExampleQuestions.EXAMPLE_QUESTIONS_HISTORY_EASY,
  ...ExampleQuestions.EXAMPLE_QUESTIONS_HISTORY_MEDIUM,
  ...ExampleQuestions.EXAMPLE_QUESTIONS_HISTORY_HARD,
  ...ExampleQuestions.EXAMPLE_QUESTIONS_GENERAL_CULTURE_EASY,
  ...ExampleQuestions.EXAMPLE_QUESTIONS_GENERAL_CULTURE_MEDIUM,
  ...ExampleQuestions.EXAMPLE_QUESTIONS_GENERAL_CULTURE_HARD,
];

// Available categories for preferences, derived from question themes
const availableCategories = Array.from(new Set(allGKQuestions.map(q => q.theme)));

/**
 * @fileOverview Implements the GamePage component with multiple game modes and rankings.
 * @module GamePage
 * @description A component for playing games (General Knowledge, Time's Up) and viewing rankings. Includes user preferences and point awarding.
 *              User authentication is required. Game data (preferences, scores, rewards) is persisted via Firestore.
 */
const GamePage = (): JSX.Element => {
  const t = useTranslations("Game");
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuthContext();
  const router = useRouter();

  // General State
  const [loadingPageData, setLoadingPageData] = useState(true);
  const [gamePreferences, setGamePreferences] = useState<string[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<UserProfile[]>([]);
  const [isRefreshingLeaderboard, setIsRefreshingLeaderboard] = useState(false);

  // General Knowledge Game State
  const [gkQuestions, setGkQuestions] = useState<Question[]>([]);
  const [currentGkQuestionIndex, setCurrentGkQuestionIndex] = useState(0);
  const [userGkAnswer, setUserGkAnswer] = useState("");
  const [isGkCorrect, setIsGkCorrect] = useState<boolean | null>(null);
  const [gkScore, setGkScore] = useState(0);
  const [gkTimeRemaining, setGkTimeRemaining] = useState(15);
  const [gkQuestionOver, setGkQuestionOver] = useState(false);
  const [gkIsPlaying, setGkIsPlaying] = useState(false);

  // Load initial data (preferences, leaderboard)
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const refreshLeaderboard = async () => {
      setIsRefreshingLeaderboard(true);
      try {
        const users = await get_all_users();
        const sortedUsers = users.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
        setLeaderboardData(sortedUsers);
      } catch (error) {
        console.error("Failed to reload leaderboard data:", error);
        toast({ variant: "destructive", title: t('error'), description: t('errorLoadingLeaderboard') });
      } finally {
        setIsRefreshingLeaderboard(false);
      }
    };

    const loadData = async () => {
      setLoadingPageData(true);
      try {
        const prefs = await get_user_game_preferences(currentUser.uid);
        setGamePreferences(prefs);
        await refreshLeaderboard(); // Initial leaderboard load
      } catch (error) {
        console.error("Failed to load game page data:", error);
        toast({ variant: 'destructive', title: t('error'), description: t('errorLoadingData') });
      } finally {
        setLoadingPageData(false);
      }
    };
    loadData();
  }, [currentUser, authLoading, router, toast, t]);

  // Filter questions based on preferences
  useEffect(() => {
    let filteredQuestions = allGKQuestions;
    if (gamePreferences.length > 0) {
      filteredQuestions = allGKQuestions.filter(q => gamePreferences.includes(q.theme));
    }
    const shuffledQuestions = [...filteredQuestions].sort(() => Math.random() - 0.5);
    setGkQuestions(shuffledQuestions.length > 0 ? shuffledQuestions : allGKQuestions.sort(() => Math.random() - 0.5));

    setCurrentGkQuestionIndex(0);
    setGkScore(0);
    setGkIsPlaying(false);
    setGkQuestionOver(false);
    setIsGkCorrect(null);
    setUserGkAnswer("");
    setGkTimeRemaining(15);
  }, [gamePreferences]);

  const refreshLeaderboard = useCallback(async () => {
    if (!currentUser) return;
    setIsRefreshingLeaderboard(true);
    try {
      const users = await get_all_users();
      const sortedUsers = users.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
      setLeaderboardData(sortedUsers);
    } catch (error) {
      console.error("Failed to reload leaderboard data:", error);
    } finally {
      setIsRefreshingLeaderboard(false);
    }
  }, [currentUser]);

  const handleGkNextQuestion = useCallback(async () => {
    if (currentGkQuestionIndex + 1 < gkQuestions.length) {
      setCurrentGkQuestionIndex((prevIndex) => prevIndex + 1);
      setUserGkAnswer("");
      setIsGkCorrect(null);
      setGkTimeRemaining(15);
      setGkQuestionOver(false);
    } else {
      setGkIsPlaying(false);
      toast({
        title: t('gameOverTitle'),
        description: t('gameOverScore', { score: gkScore })
      });
      await refreshLeaderboard();
    }
  }, [currentGkQuestionIndex, gkQuestions.length, gkScore, toast, t, refreshLeaderboard]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (gkIsPlaying && gkTimeRemaining > 0 && !gkQuestionOver) {
      timer = setTimeout(() => {
        setGkTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (gkTimeRemaining === 0 && gkIsPlaying && !gkQuestionOver) {
      setGkQuestionOver(true);
      toast({
        title: t('timesUpTitle'),
        description: t('timesUpDesc')
      });
      const nextQuestionTimer = setTimeout(() => {
        handleGkNextQuestion();
      }, 1500);
      return () => clearTimeout(nextQuestionTimer);
    }
    return () => clearTimeout(timer);
  }, [gkTimeRemaining, gkIsPlaying, gkQuestionOver, toast, t, handleGkNextQuestion]);

  const handleGkAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserGkAnswer(event.target.value);
  };

  const checkGkAnswer = async () => {
    if (!currentUser || !gkQuestions[currentGkQuestionIndex]) return;

    const currentQuestion = gkQuestions[currentGkQuestionIndex];
    const correct = userGkAnswer.toLowerCase().trim() === currentQuestion.answers[0].toLowerCase().trim();
    setIsGkCorrect(correct);

    if (correct) {
      const newScore = gkScore + 1;
      setGkScore(newScore);
      const pointsAwarded = 10;
      try {
        await add_user_points(currentUser.uid, pointsAwarded);
        toast({
          title: t('correctAnswer'),
          description: t('pointsEarnedDesc', { count: pointsAwarded })
        });

        if (newScore >= 3) {
          await add_user_reward(currentUser.uid, {
            name: t('badgeGameWinnerName'),
            description: t('badgeGameWinnerDesc'),
            type: "game_winner",
            icon: 'trophy'
          });
        }
      } catch (error) {
        console.error("Failed to add points:", error);
        toast({ variant: "destructive", title: t('error'), description: t('errorUpdatingScore') });
      }
    } else {
      toast({
        variant: 'destructive',
        title: t('incorrectAnswer'),
        description: t('correctAnswerWas', { answer: currentQuestion.answers[0] })
      });
    }

    setGkQuestionOver(true);
    const nextQuestionTimer = setTimeout(() => {
      handleGkNextQuestion();
    }, 1500);
    return () => clearTimeout(nextQuestionTimer);
  };

  const startGkGame = () => {
    if (gkQuestions.length === 0) {
      toast({ variant: "destructive", title: t('error'), description: t('noQuestionsForPrefs') });
      setGkQuestions(allGKQuestions.sort(() => Math.random() - 0.5));
    }
    setGkScore(0);
    setCurrentGkQuestionIndex(0);
    setUserGkAnswer("");
    setIsGkCorrect(null);
    setGkTimeRemaining(15);
    setGkQuestionOver(false);
    setGkIsPlaying(true);
  };

  const toggleGamePreference = async (category: string, checked: boolean) => {
    if (!currentUser) return;
    try {
      const newPreferences = checked
        ? [...gamePreferences, category]
        : gamePreferences.filter(pref => pref !== category);

      await set_user_game_preferences(currentUser.uid, newPreferences);
      setGamePreferences(newPreferences);
    } catch (error) {
      console.error("Failed to update game preferences:", error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('errorUpdatingPrefs')
      });
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderGeneralKnowledge = () => {
    if (!gkIsPlaying) {
      return (
        <div className="text-center space-y-4 p-6">
          <p>{t('gkDescription')}</p>
          <Button onClick={startGkGame} size="lg" disabled={gkQuestions.length === 0 && !loadingPageData}>
            <Play className="mr-2 h-5 w-5" />
            {t('startGameButton')}
          </Button>
          {gkQuestions.length === 0 && !loadingPageData && (
            <p className="text-muted-foreground mt-2">{t('noQuestionsForPrefsLong')}</p>
          )}
        </div>
      );
    }

    const currentQuestion = gkQuestions[currentGkQuestionIndex];
    if (!currentQuestion) {
      return <p className="text-center text-muted-foreground">{t('noMoreQuestions')}</p>;
    }

    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>{t('question')} {currentGkQuestionIndex + 1} / {gkQuestions.length}</CardTitle>
            <div className="timer-wrapper">
              <CountdownCircleTimer
                isPlaying={gkIsPlaying && !gkQuestionOver}
                key={currentGkQuestionIndex}
                duration={15}
                initialRemainingTime={gkTimeRemaining}
                colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                colorsTime={[10, 5, 2, 0]}
                size={50}
                strokeWidth={4}
                trailColor="#d3d3d3"
                onComplete={() => { /* Timeout handled by useEffect */ }}
              >
                {({ remainingTime }) => <span className="text-lg font-medium">{remainingTime}</span>}
              </CountdownCircleTimer>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-lg">{currentQuestion.question}</p>
            <Input
              value={userGkAnswer}
              onChange={handleGkAnswerChange}
              placeholder={t('answerPlaceholder')}
              disabled={gkQuestionOver}
              className="text-center"
              autoComplete="off"
              onKeyPress={(e) => e.key === 'Enter' && userGkAnswer.trim() && checkGkAnswer()}
            />
            <Button onClick={checkGkAnswer} className="w-full" disabled={!userGkAnswer.trim()}>
              {t('submitAnswer')}
            </Button>
            {isGkCorrect !== null && (
              <div className={`text-center p-2 rounded ${isGkCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isGkCorrect ? t('correct') : t('incorrect')}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-lg font-semibold flex items-center gap-1">
            <Trophy className="h-5 w-5" />
            {t('scoreLabel')}: {gkScore}
          </p>
        </CardFooter>
      </Card>
    );
  };

  const renderPreferences = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('preferencesTitle')}</CardTitle>
        <CardDescription>{t('preferencesDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingPageData ? <Skeleton className="h-24 w-full" /> : (
          <div className="grid grid-cols-2 gap-4">
            {availableCategories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`pref-${category}`}
                  checked={gamePreferences.includes(category)}
                  onCheckedChange={(checked) => toggleGamePreference(category, Boolean(checked))}
                  aria-labelledby={`label-pref-${category}`}
                />
                <Label htmlFor={`pref-${category}`} id={`label-pref-${category}`}>
                  {t(`category.${category}`)}
                </Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderRankings = () => (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('rankingsTitle')}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshLeaderboard}
            disabled={isRefreshingLeaderboard}
          >
            {isRefreshingLeaderboard ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            {t('refreshRankings')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('rank')}</TableHead>
                <TableHead>{t('player')}</TableHead>
                <TableHead className="text-right">{t('points')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{user.points || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Tabs defaultValue="general-knowledge" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general-knowledge">{t('tabGeneralKnowledge')}</TabsTrigger>
          <TabsTrigger value="times-up">{t('tabTimesUp')}</TabsTrigger>
          <TabsTrigger value="rankings">{t('tabRankings')}</TabsTrigger>
        </TabsList>
        <TabsContent value="general-knowledge">
          {renderGeneralKnowledge()}
        </TabsContent>
        <TabsContent value="times-up" className="mt-6 flex flex-col items-center space-y-6">
          <Suspense fallback={<div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <TimesUpGame userId={currentUser?.uid} onGameComplete={refreshLeaderboard} />
          </Suspense>
        </TabsContent>
        <TabsContent value="rankings" className="mt-6 flex flex-col items-center space-y-6">
          {renderRankings()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamePage;