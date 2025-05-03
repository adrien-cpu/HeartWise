"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { get_user_game_preferences, set_user_game_preferences, add_user_points, add_user_reward } from "@/services/user_profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Added Card components
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Added Table components
import { Trophy } from "lucide-react"; // Added Trophy icon
import TimesUpGame from "@/components/game/times-up"; // Import the new TimesUpGame component

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
    category: "history", // Simplified category
   }
];

// Mock data for Rankings
interface RankingEntry {
  rank: number;
  name: string;
  score: number;
}
const mockRankings: RankingEntry[] = [
  { rank: 1, name: "Alice", score: 150 },
  { rank: 2, name: "Bob", score: 120 },
  { rank: 3, name: "Charlie", score: 95 },
  { rank: 4, name: "Diana", score: 80 },
  { rank: 5, name: "Ethan", score: 60 },
];


// Mock user ID - replace with actual user identification
const userId = 'user1';

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
  }, [userId, toast, t]); // Added t dependency

   // Filter questions based on preferences
   useEffect(() => {
    if (gamePreferences.length > 0) {
      setGkQuestions(generalKnowledgeQuestions.filter(q => gamePreferences.includes(q.category)));
    } else {
      // If no preferences, use all questions or a default subset
      setGkQuestions(generalKnowledgeQuestions);
    }
     setCurrentGkQuestionIndex(0); // Reset index when questions change
     setGkScore(0);
     setGkIsPlaying(false);
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
      const userAnswerLower = userGkAnswer.toLowerCase();
      const correct = userAnswerLower === correctAnswer;

      setIsGkCorrect(correct);
      setGkGameOver(true); // Mark question as over

      if (correct) {
        setGkScore((prevScore) => prevScore + 1);
        const pointsAwarded = 10;
        try {
          await add_user_points(userId, pointsAwarded);
          toast({
            title: t('correctAnswer'),
            description: t('pointsEarned', { count: pointsAwarded }),
          });

          if (gkScore + 1 >= 3) { // Check score *after* potential increment
            await add_user_reward(userId, {
              name: t('badgeGameWinnerName'),
              description: t('badgeGameWinnerDesc'),
              type: "game_winner"
            });
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
         toast({ variant: 'destructive', title: t('error'), description: t('noQuestionsForPrefs') });
         return;
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
      setGamePreferences(gamePreferences); // Revert optimistic update
    }
  };

  // --- Rendering ---
  const renderGeneralKnowledge = () => {
     const currentQuestion = gkQuestions[currentGkQuestionIndex];

    if (!gkIsPlaying) {
      return (
        <div className="text-center space-y-4">
          <p>{t('gkDescription')}</p>
           {gkQuestions.length > 0 ? (
                <Button onClick={startGkGame} size="lg">{t('startGameButton')}</Button>
           ) : (
               <p className="text-muted-foreground">{t('noQuestionsForPrefs')}</p>
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
                   onComplete={() => { /* Timeout handled by useEffect */ }}
                 >
                   {({ remainingTime }) => <span className="text-lg font-medium">{remainingTime}</span>}
                 </CountdownCircleTimer>
               </div>
            </div>
          <CardDescription className="text-lg text-center min-h-[60px] flex items-center justify-center">
            {currentQuestion.question}
          </CardDescription>
         </CardHeader>
        <CardContent className="space-y-4">
          {!gkGameOver ? (
            <>
              <Input
                type="text"
                value={userGkAnswer}
                onChange={handleGkAnswerChange}
                placeholder={t('answerPlaceholder')}
                aria-label={t('answerLabel')}
                disabled={gkGameOver}
                className="text-center"
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
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                            id="history"
                            checked={gamePreferences.includes("history")}
                            onCheckedChange={() => toggleGamePreference("history")}
                        />
                        <span className="text-sm">{t('categoryHistory')}</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                             id="science"
                            checked={gamePreferences.includes("science")}
                            onCheckedChange={() => toggleGamePreference("science")}
                        />
                        <span className="text-sm">{t('categoryScience')}</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                             id="geography"
                            checked={gamePreferences.includes("geography")}
                            onCheckedChange={() => toggleGamePreference("geography")}
                        />
                         <span className="text-sm">{t('categoryGeography')}</span>
                    </label>
                    {/* Add more categories as needed */}
                </div>
            )}
        </CardContent>
     </Card>
  );

   const renderRankings = () => (
      <Card className="w-full max-w-md">
          <CardHeader>
             <CardTitle>{t('rankingsTitle')}</CardTitle>
             <CardDescription>{t('rankingsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] text-center">{t('rankHeader')}</TableHead>
                        <TableHead>{t('nameHeader')}</TableHead>
                        <TableHead className="text-right">{t('scoreHeader')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockRankings.map((entry) => (
                       <TableRow key={entry.rank}>
                          <TableCell className="font-medium text-center">{entry.rank}</TableCell>
                          <TableCell>{entry.name}</TableCell>
                          <TableCell className="text-right">{entry.score}</TableCell>
                       </TableRow>
                    ))}
                </TableBody>
             </Table>
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
