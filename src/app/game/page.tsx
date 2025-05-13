
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { get_user_game_preferences, set_user_game_preferences, add_user_points, add_user_reward, get_all_users, UserProfile } from "@/services/user_profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Loader2, ListOrdered, Play, Check, X, RotateCcw, Gamepad2 } from "lucide-react"; // Added Gamepad2
import TimesUpGame from "@/components/game/times-up";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Question, Difficulty } from '@/ai/questionnaires/questionnaire_structure';
import * as ExampleQuestions from '@/ai/questionnaires/examples';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

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
  const { currentUser, loading: authLoading } = useAuth();
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


  const refreshLeaderboard = useCallback(async () => {
    if (!currentUser) return;
    setIsRefreshingLeaderboard(true);
    try {
        const users = await get_all_users();
        const sortedUsers = users.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
        setLeaderboardData(sortedUsers);
    } catch (error) {
         console.error("Failed to reload leaderboard data:", error);
         toast({ variant: "destructive", title: t('error'), description: t('errorLoadingLeaderboard')});
    } finally {
        setIsRefreshingLeaderboard(false);
    }
  }, [currentUser, t, toast]);


  // Load initial data (preferences, leaderboard)
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push('/login');
      return;
    }

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
  }, [currentUser, authLoading, router, toast, t, refreshLeaderboard]);

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
         description: t('gameOverScore', { score: gkScore }),
       });
        if (currentUser && gkScore > 0) {
            if (gkScore >= Math.floor(gkQuestions.length / 2) && gkQuestions.length > 0) {
                 try {
                    await add_user_reward(currentUser.uid, {
                        name: t('badgeGameWinnerName'),
                        description: t('badgeGameWinnerDesc'),
                        type: "game_winner"
                    });
                    toast({ title: t('badgeEarnedTitle'), description: t('badgeEarnedDesc', { badgeName: t('badgeGameWinnerName') }) });
                 } catch (badgeError) {
                    console.error("Failed to add game winner badge:", badgeError);
                 }
            }
        }
        await refreshLeaderboard();
     }
   }, [currentGkQuestionIndex, gkQuestions.length, gkScore, toast, t, currentUser, refreshLeaderboard]);

   useEffect(() => {
     let timer: NodeJS.Timeout | undefined;
     if (gkIsPlaying && gkTimeRemaining > 0 && !gkQuestionOver) {
       timer = setTimeout(() => {
         setGkTimeRemaining((prevTime) => prevTime - 1);
       }, 1000);
     } else if (gkTimeRemaining === 0 && gkIsPlaying && !gkQuestionOver) {
       setGkQuestionOver(true);
       setIsGkCorrect(false);
       const currentQuestion = gkQuestions[currentGkQuestionIndex];
       toast({
         title: t('timesUpTitle'),
         description: currentQuestion ? t('correctAnswerWas', { answer: currentQuestion.answer }) : t('timesUpDesc'),
         variant: 'destructive'
       });
        const nextQuestionTimer = setTimeout(() => {
             handleGkNextQuestion();
        }, 2500);
        return () => clearTimeout(nextQuestionTimer);
     }
     return () => clearTimeout(timer);
   }, [gkTimeRemaining, gkIsPlaying, gkQuestionOver, toast, t, handleGkNextQuestion, currentGkQuestionIndex, gkQuestions]);

  const handleGkAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserGkAnswer(event.target.value);
  };

  const checkGkAnswer = async () => {
    if (!currentUser || !gkIsPlaying || gkQuestionOver || !gkQuestions[currentGkQuestionIndex]) return;

    setGkQuestionOver(true);
    const currentQuestion = gkQuestions[currentGkQuestionIndex];
    // Assuming 'answer' is the correct answer string in the Question object
    const correctAnswer = (currentQuestion.answers[0] || '').toLowerCase().trim(); // Fallback for missing answer
    const userAnswerLower = userGkAnswer.toLowerCase().trim();
    const correct = userAnswerLower === correctAnswer;

    setIsGkCorrect(correct);

    if (correct) {
      const newScore = gkScore + 1;
      setGkScore(newScore);
      const pointsAwarded = 10;
      try {
        await add_user_points(currentUser.uid, pointsAwarded);
        toast({
          title: t('correctAnswer'),
          description: t('pointsEarnedDesc', { count: pointsAwarded }),
        });
      } catch (error) {
        console.error("Failed to add points:", error);
        toast({ variant: 'destructive', title: t('error'), description: t('errorUpdatingScore')});
      }
    } else {
      toast({
        variant: 'destructive',
        title: t('incorrectAnswer'),
        description: t('correctAnswerWas', { answer: currentQuestion.answers[0] || 'N/A' }),
      });
    }
    setTimeout(handleGkNextQuestion, 2000);
  };

  const startGkGame = () => {
    if (gkQuestions.length === 0) {
         toast({ variant: 'destructive', title: t('error'), description: t('noQuestionsForPrefs') });
         setGkQuestions(allGKQuestions.sort(() => Math.random() - 0.5));
    }
    setGkScore(0);
    setGkTimeRemaining(15);
    setGkQuestionOver(false);
    setIsGkCorrect(null);
    setUserGkAnswer("");
    setCurrentGkQuestionIndex(0);
    setGkIsPlaying(true);
  };

  const toggleGamePreference = async (category: string, checked: boolean) => {
    if (!currentUser) return;
    const newPreferences = checked
      ? [...gamePreferences, category]
      : gamePreferences.filter((pref) => pref !== category);

    setGamePreferences(newPreferences);
    try {
      await set_user_game_preferences(currentUser.uid, newPreferences);
      toast({ title: t('prefsUpdatedTitle'), description: t('prefsUpdatedDesc') });
    } catch (error) {
      console.error("Failed to save game preferences:", error);
      toast({ variant: 'destructive', title: t('error'), description: t('errorSavingPrefs') });
      const oldPreferences = await get_user_game_preferences(currentUser.uid);
      setGamePreferences(oldPreferences);
    }
  };

  const handleTimesUpGameComplete = async () => {
    await refreshLeaderboard();
  };
  
  const getInitials = (name?: string | null): string => {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (authLoading || (loadingPageData && !currentUser)) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
   if (!currentUser) {
     return <div className="container mx-auto p-4 text-center"><p className="text-destructive">{t('mustBeLoggedIn')}</p></div>;
   }

  const renderGeneralKnowledge = () => {
     const currentQuestion = gkQuestions[currentGkQuestionIndex];

    if (!gkIsPlaying) {
      return (
        <div className="text-center space-y-4 p-6">
          <p>{t('gkDescription')}</p>
          <Button onClick={startGkGame} size="lg" disabled={gkQuestions.length === 0 && !loadingPageData}>
            <Play className="mr-2 h-5 w-5" />
            {t('startGameButton')}
          </Button>
           {(gkQuestions.length === 0 && !loadingPageData) && (
               <p className="text-muted-foreground mt-2">{t('noQuestionsForPrefsLong')}</p>
           )}
        </div>
      );
    }

     if (!currentQuestion) {
        return (
          <div className="text-center p-6">
            <p className="text-muted-foreground">{t('noMoreQuestions')}</p>
            <Button onClick={startGkGame} className="mt-4">
                <RotateCcw className="mr-2 h-4 w-4" />{t('tuPlayAgain')}
            </Button>
          </div>
        );
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
                   colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                   colorsTime={[10, 6, 3, 0]}
                   size={50}
                   strokeWidth={4}
                   trailColor="hsl(var(--muted))"
                   onComplete={() => { /* Time up handled by useEffect */ }}
                 >
                   {({ remainingTime: rt }) => <span className="text-lg font-medium">{rt}</span>}
                 </CountdownCircleTimer>
               </div>
            </div>
          <CardDescription className="text-lg text-center min-h-[60px] flex items-center justify-center p-2">
            {currentQuestion.question}
          </CardDescription>
         </CardHeader>
        <CardContent className="space-y-4">
          {!gkQuestionOver ? (
            <>
              <Label htmlFor="gkAnswer" className="sr-only">{t('answerLabel')}</Label>
              <Input
                id="gkAnswer"
                type="text"
                value={userGkAnswer}
                onChange={handleGkAnswerChange}
                placeholder={t('answerPlaceholder')}
                aria-label={t('answerLabel')}
                className="text-center"
                autoComplete="off"
                onKeyPress={(e) => e.key === 'Enter' && userGkAnswer.trim() && checkGkAnswer()}
              />
              <Button onClick={checkGkAnswer} className="w-full" disabled={!userGkAnswer.trim()}>
                {t('submitAnswer')}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-3">
              {isGkCorrect === true && <div className="flex items-center justify-center text-2xl font-semibold text-green-600"><Check className="h-8 w-8 mr-2"/>{t('correctAnswer')}</div>}
              {isGkCorrect === false && (
                <div className="flex flex-col items-center text-xl font-semibold text-destructive">
                    <div className="flex items-center"><X className="h-7 w-7 mr-2"/>{t('incorrectAnswer')}</div>
                    <span className="text-sm mt-1">{t('correctAnswerWas', { answer: currentQuestion.answers[0] || 'N/A' })}</span>
                </div>
              )}
              <Button onClick={handleGkNextQuestion} className="w-full mt-2">
                {currentGkQuestionIndex + 1 < gkQuestions.length ? t('nextQuestion') : t('viewResults')}
              </Button>
            </div>
          )}
        </CardContent>
         <CardFooter className="justify-center">
            <p className="text-lg font-semibold flex items-center gap-1">
                <Trophy className="h-5 w-5 text-yellow-500" />
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
                         <Label htmlFor={`pref-${category}`} id={`label-pref-${category}`} className="text-sm cursor-pointer">
                             {t(`category${category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace(/\s+/g, '')}`, {}, {fallback: category})}
                         </Label>
                     </div>
                   ))}
                </div>
            )}
        </CardContent>
     </Card>
  );

   const renderRankings = () => (
      <Card className="w-full max-w-lg">
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><ListOrdered />{t('rankingsTitle')}</CardTitle>
             <CardDescription>{t('rankingsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
             {isRefreshingLeaderboard && leaderboardData.length === 0 ? ( // Show skeletons only on initial load or if empty
                 <div className="space-y-2">
                     {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                 </div>
             ) : leaderboardData.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] text-center">{t('rankHeader')}</TableHead>
                            <TableHead>{t('nameHeader')}</TableHead>
                            <TableHead className="text-right">{t('scoreHeader')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboardData.slice(0, 10).map((user, index) => (
                           <TableRow key={user.id} className={user.id === currentUser?.uid ? 'bg-primary/10' : ''}>
                              <TableCell className="font-medium text-center">{index + 1}</TableCell>
                              <TableCell>
                                  <div className="flex items-center gap-2">
                                     <Avatar className="h-8 w-8 border" data-ai-hint={user.dataAiHint || "person"}>
                                       <AvatarImage src={user.profilePicture} alt={user.name || t('anonymousUser')} />
                                       <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                     </Avatar>
                                     <span className={user.id === currentUser?.uid ? 'font-semibold' : ''}>{user.name || t('anonymousUser')}</span>
                                  </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">{user.points ?? 0}</TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                 </Table>
             ) : (
                 <p className="text-center text-muted-foreground py-4">{t('noLeaderboardData')}</p>
             )}
             {isRefreshingLeaderboard && <div className="flex justify-center mt-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          </CardContent>
      </Card>
   );

  return (
    <div className="container mx-auto p-4 flex flex-col items-center space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Gamepad2 className="h-8 w-8 text-primary"/>{t('title')}</h1>

      <Tabs defaultValue="general-knowledge" className="w-full max-w-3xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general-knowledge">{t('tabGeneralKnowledge')}</TabsTrigger>
          <TabsTrigger value="times-up">{t('tabTimesUp')}</TabsTrigger>
          <TabsTrigger value="rankings">{t('tabRankings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general-knowledge" className="mt-6 flex flex-col items-center space-y-6">
            {renderPreferences()}
            {renderGeneralKnowledge()}
        </TabsContent>

        <TabsContent value="times-up" className="mt-6 flex flex-col items-center space-y-6">
           <TimesUpGame userId={currentUser.uid} onGameComplete={handleTimesUpGameComplete} />
        </TabsContent>

        <TabsContent value="rankings" className="mt-6 flex flex-col items-center space-y-6">
           {renderRankings()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamePage;
