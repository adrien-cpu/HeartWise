
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { get_user_game_preferences, set_user_game_preferences, add_user_points, add_user_reward, get_all_users, UserProfile } from "@/services/user_profile"; // Import get_all_users
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Loader2, ListOrdered } from "lucide-react"; // Added Loader2 and ListOrdered icons
import TimesUpGame from "@/components/game/times-up";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Import Label
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components

// Mock data for General Knowledge questions
const generalKnowledgeQuestions = [
  {
    question: "What is the capital of France?",
    answer: "Paris",
    category: "geography",
  },
  {
    question: "What is the highest mountain in the world?",
    answer: "Mount Everest",
    category: "geography",
  },
  {
    question: "What is the largest ocean in the world?",
    answer: "Pacific Ocean",
    category: "geography",
  },
   {
    question: "What is H2O?",
    answer: "Water",
    category: "science",
  },
   {
    question: "Who painted the Mona Lisa?",
    answer: "Leonardo da Vinci",
    category: "art", // Corrected category
   },
    {
     question: "In which year did the Titanic sink?",
     answer: "1912",
     category: "history",
    },
];

// Mock user ID - replace with actual user identification
const userId = 'user1';

// Available categories for preferences
const availableCategories = ["geography", "science", "art", "history"];

/**
 * @fileOverview Implements the GamePage component with multiple game modes and rankings.
 */

/**
 * @function GamePage
 * @description A component for playing games (General Knowledge, Time's Up) and viewing rankings. Includes user preferences and point awarding.
 * @returns {JSX.Element} The rendered GamePage component.
 */
const GamePage = () => {
  const t = useTranslations("Game");
  const { toast } = useToast();

  // General State
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [gamePreferences, setGamePreferences] = useState<string[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<UserProfile[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // General Knowledge Game State
  const [gkQuestions, setGkQuestions] = useState(generalKnowledgeQuestions); // Filtered questions based on prefs
  const [currentGkQuestionIndex, setCurrentGkQuestionIndex] = useState(0);
  const [userGkAnswer, setUserGkAnswer] = useState("");
  const [isGkCorrect, setIsGkCorrect] = useState<boolean | null>(null);
  const [gkScore, setGkScore] = useState(0);
  const [gkTimeRemaining, setGkTimeRemaining] = useState(15);
  const [gkGameOver, setGkGameOver] = useState(false); // Game over state for the current question
  const [gkIsPlaying, setGkIsPlaying] = useState(false); // Track if a GK game is in progress

  // Load game preferences
  useEffect(() => {
    const loadPreferences = async () => {
      setLoadingPreferences(true);
      try {
        const storedPreferences = await get_user_game_preferences(userId);
        setGamePreferences(storedPreferences);
      } catch (error) {
        console.error("Failed to load game preferences:", error);
        toast({ variant: 'destructive', title: t('error'), description: t('errorLoadingPrefs') });
      } finally {
        setLoadingPreferences(false);
      }
    };
    loadPreferences();
  }, [userId, toast, t]);

  // Fetch leaderboard data
   useEffect(() => {
    const loadLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const users = await get_all_users();
        // Sort users by points descending
        const sortedUsers = users.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
        setLeaderboardData(sortedUsers);
      } catch (error) {
        console.error("Failed to load leaderboard data:", error);
        toast({ variant: 'destructive', title: t('error'), description: t('errorLoadingLeaderboard') });
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    loadLeaderboard();
   }, [toast, t]); // Load once on mount


   // Filter questions based on preferences
   useEffect(() => {
    let filteredQuestions = generalKnowledgeQuestions;
    if (gamePreferences.length > 0) {
        // Filter only if preferences are set and not empty
        filteredQuestions = generalKnowledgeQuestions.filter(q => gamePreferences.includes(q.category));
    }
    // If filtering results in no questions, use all questions as fallback
    setGkQuestions(filteredQuestions.length > 0 ? filteredQuestions : generalKnowledgeQuestions);

    // Reset game state when preferences/questions change
    setCurrentGkQuestionIndex(0);
    setGkScore(0);
    setGkIsPlaying(false); // Stop any ongoing game
    setGkGameOver(false);
    setIsGkCorrect(null);
    setUserGkAnswer("");
    setGkTimeRemaining(15);

  }, [gamePreferences]);


  // Timer logic for General Knowledge game
  const handleGkNextQuestion = useCallback(() => {
     if (currentGkQuestionIndex + 1 < gkQuestions.length) {
       setCurrentGkQuestionIndex((prevIndex) => prevIndex + 1);
       setUserGkAnswer("");
       setIsGkCorrect(null);
       setGkTimeRemaining(15);
       setGkGameOver(false); // Reset for the next question
     } else {
       setGkIsPlaying(false); // End the game session
       toast({
         title: t('gameOverTitle'),
         description: t('gameOverScore', { score: gkScore }),
       });
        // Fetch updated leaderboard data after game ends
         const loadLeaderboard = async () => {
            setLoadingLeaderboard(true);
            try {
                const users = await get_all_users();
                const sortedUsers = users.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
                setLeaderboardData(sortedUsers);
            } catch (error) {
                console.error("Failed to reload leaderboard data:", error);
            } finally {
                setLoadingLeaderboard(false);
            }
         };
         loadLeaderboard();
     }
   }, [currentGkQuestionIndex, gkQuestions.length, gkScore, toast, t]); // Dependencies for useCallback

   useEffect(() => {
     let timer: NodeJS.Timeout | undefined;
     if (gkIsPlaying && gkTimeRemaining > 0 && !gkGameOver) {
       timer = setTimeout(() => {
         setGkTimeRemaining((prevTime) => prevTime - 1);
       }, 1000);
     } else if (gkTimeRemaining === 0 && gkIsPlaying && !gkGameOver) {
       setGkGameOver(true); // End current question state if time runs out
       toast({
         title: t('timesUpTitle'),
         description: t('timesUpDesc'),
       });
        // Automatically move to next question after a delay
        const nextQuestionTimer = setTimeout(() => {
             handleGkNextQuestion();
        }, 1500);
        return () => clearTimeout(nextQuestionTimer);
     }
     return () => clearTimeout(timer); // Cleanup the timer
   }, [gkTimeRemaining, gkIsPlaying, gkGameOver, toast, t, handleGkNextQuestion]); // Added t and handleGkNextQuestion

  // --- General Knowledge Specific Functions ---
  const handleGkAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserGkAnswer(event.target.value);
  };

  const checkGkAnswer = async () => {
    if (gkIsPlaying && !gkGameOver) {
      const currentQuestion = gkQuestions[currentGkQuestionIndex];
      if (!currentQuestion) return; // Should not happen if index is managed correctly

      const correctAnswer = currentQuestion.answer.toLowerCase();
      const userAnswerLower = userGkAnswer.toLowerCase().trim();
      const correct = userAnswerLower === correctAnswer;

      setIsGkCorrect(correct);
      setGkGameOver(true); // Mark question as over

      if (correct) {
         const newScore = gkScore + 1;
         setGkScore(newScore);
        const pointsAwarded = 10;
        try {
          await add_user_points(userId, pointsAwarded);
          toast({
            title: t('correctAnswer'),
            description: t('pointsEarnedDesc', { count: pointsAwarded }), // Use specific key
          });

          // Check if score reaches a threshold for a reward
          if (newScore >= 3) { // Example threshold
            await add_user_reward(userId, {
              name: t('badgeGameWinnerName'),
              description: t('badgeGameWinnerDesc'),
              type: "game_winner"
            });
             // Optional: Toast for badge earned
             toast({ title: t('badgeEarnedTitle'), description: t('badgeEarnedDesc', { badgeName: t('badgeGameWinnerName') }) });
          }
        } catch (error) {
          console.error("Failed to add points or reward:", error);
          toast({
            variant: 'destructive',
            title: t('error'),
            description: t('errorUpdatingScore'),
          });
        }
      } else {
        toast({
            variant: 'destructive',
          title: t('incorrectAnswer'),
          description: t('correctAnswerWas', { answer: currentQuestion.answer }),
        });
      }

      // Option: Automatically move to next after showing result for a bit
      setTimeout(handleGkNextQuestion, 2000);
    }
  };


  const startGkGame = () => {
    if (gkQuestions.length === 0) {
         // This case should be handled by the fallback in useEffect, but double-check
         toast({ variant: 'destructive', title: t('error'), description: t('noQuestionsAvailable') });
         setGkQuestions(generalKnowledgeQuestions); // Ensure there are questions
    }
    setGkScore(0);
    setGkTimeRemaining(15);
    setGkGameOver(false);
    setIsGkCorrect(null);
    setUserGkAnswer("");
    setCurrentGkQuestionIndex(0);
    setGkIsPlaying(true);
  };

  // --- Preferences Functions ---
  const toggleGamePreference = async (category: string) => {
    const newPreferences = gamePreferences.includes(category)
      ? gamePreferences.filter((id) => id !== category)
      : [...gamePreferences, category];

    setGamePreferences(newPreferences); // Optimistic UI update

    try {
      await set_user_game_preferences(userId, newPreferences);
      toast({ title: t('prefsUpdatedTitle'), description: t('prefsUpdatedDesc') });
    } catch (error) {
      console.error("Failed to save game preferences:", error);
      toast({ variant: 'destructive', title: t('error'), description: t('errorSavingPrefs') });
      // Revert optimistic update - fetch again or revert state based on previous state
       const oldPreferences = await get_user_game_preferences(userId); // Re-fetch to be sure
       setGamePreferences(oldPreferences);
    }
  };

  // --- Rendering ---

  // Helper function to get initials
  const getInitials = (name?: string): string => {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderGeneralKnowledge = () => {
     const currentQuestion = gkQuestions[currentGkQuestionIndex];

    if (!gkIsPlaying) {
      return (
        <div className="text-center space-y-4">
          <p>{t('gkDescription')}</p>
          <Button onClick={startGkGame} size="lg" disabled={loadingPreferences}>
            {loadingPreferences ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : t('startGameButton')}
          </Button>
           {gkQuestions.length === 0 && !loadingPreferences && (
               <p className="text-muted-foreground">{t('noQuestionsAvailable')}</p>
           )}
        </div>
      );
    }

     if (!currentQuestion) {
         // This state might occur briefly if questions are filtered out,
         // handle by showing a message or ending the game.
          return <p className="text-center text-muted-foreground">{t('noMoreQuestions')}</p>;
      }

    return (
      <Card className="w-full max-w-lg mx-auto">
         <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle>{t('question')} {currentGkQuestionIndex + 1} / {gkQuestions.length}</CardTitle>
              <div className="timer-wrapper">
                 <CountdownCircleTimer
                   isPlaying={gkIsPlaying && !gkGameOver}
                   key={currentGkQuestionIndex} // Reset timer on question change
                   duration={15}
                   initialRemainingTime={gkTimeRemaining}
                   colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                   colorsTime={[10, 5, 2, 0]}
                   size={50}
                   strokeWidth={4}
                   trailColor="#d3d3d3" // Light gray trail
                   onComplete={() => { /* Timeout handled by useEffect */ }}
                 >
                   {({ remainingTime }) => <span className="text-lg font-medium">{remainingTime}</span>}
                 </CountdownCircleTimer>
               </div>
            </div>
          <CardDescription className="text-lg text-center min-h-[60px] flex items-center justify-center p-2">
            {currentQuestion.question}
          </CardDescription>
         </CardHeader>
        <CardContent className="space-y-4">
          {!gkGameOver ? (
            <>
              <Label htmlFor="gkAnswer" className="sr-only">{t('answerLabel')}</Label>
              <Input
                id="gkAnswer"
                type="text"
                value={userGkAnswer}
                onChange={handleGkAnswerChange}
                placeholder={t('answerPlaceholder')}
                aria-label={t('answerLabel')}
                disabled={gkGameOver}
                className="text-center"
                autoComplete="off"
                 onKeyPress={(e) => e.key === 'Enter' && !gkGameOver && userGkAnswer.trim() && checkGkAnswer()}
              />
              <Button onClick={checkGkAnswer} className="w-full" disabled={gkGameOver || !userGkAnswer.trim()}>
                {t('submitAnswer')}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-3">
              {isGkCorrect === true && (
                <p className="text-green-600 font-semibold">
                  {t('correctAnswer')}
                </p>
              )}
              {isGkCorrect === false && (
                <p className="text-red-600 font-semibold">
                  {t('incorrectAnswer')} {t('correctAnswerWas', { answer: currentQuestion.answer })}
                </p>
              )}
              <Button onClick={handleGkNextQuestion} className="w-full">
                {currentGkQuestionIndex + 1 < gkQuestions.length ? t('nextQuestion') : t('viewResults')}
              </Button>
            </div>
          )}
        </CardContent>
         <CardFooter className="justify-center">
            <p className="text-lg font-semibold">{t('scoreLabel')}: {gkScore}</p>
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
            {loadingPreferences ? <Skeleton className="h-20 w-full" /> : (
                 <div className="grid grid-cols-2 gap-4">
                   {availableCategories.map(category => (
                     <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                            id={`pref-${category}`}
                            checked={gamePreferences.includes(category)}
                            onCheckedChange={(checked) => toggleGamePreference(category, !!checked)} // Pass boolean
                            aria-labelledby={`label-pref-${category}`}
                        />
                         <Label htmlFor={`pref-${category}`} id={`label-pref-${category}`} className="text-sm cursor-pointer">
                             {t(`category${category.charAt(0).toUpperCase() + category.slice(1)}`)}
                         </Label>
                     </div>
                   ))}
                </div>
            )}
        </CardContent>
     </Card>
  );

   const renderRankings = () => (
      <Card className="w-full max-w-md">
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><ListOrdered />{t('rankingsTitle')}</CardTitle>
             <CardDescription>{t('rankingsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
             {loadingLeaderboard ? (
                 <div className="space-y-2">
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-full" />
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
                        {leaderboardData.map((user, index) => (
                           <TableRow key={user.id} className={user.id === userId ? 'bg-primary/10' : ''}>
                              <TableCell className="font-medium text-center">{index + 1}</TableCell>
                              <TableCell>
                                  <div className="flex items-center gap-2">
                                     <Avatar className="h-6 w-6 border">
                                       <AvatarImage src={user.profilePicture} alt={user.name || 'User'} data-ai-hint={user.dataAiHint || "person"} />
                                       <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                     </Avatar>
                                     <span className={user.id === userId ? 'font-semibold' : ''}>{user.name || t('anonymousUser')}</span>
                                  </div>
                              </TableCell>
                              <TableCell className="text-right">{user.points ?? 0}</TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                 </Table>
             ) : (
                 <p className="text-center text-muted-foreground py-4">{t('noLeaderboardData')}</p>
             )}
          </CardContent>
      </Card>
   );

  return (
    <div className="container mx-auto p-4 flex flex-col items-center space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

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
           <TimesUpGame />
        </TabsContent>

        <TabsContent value="rankings" className="mt-6 flex flex-col items-center space-y-6">
           {renderRankings()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamePage;
