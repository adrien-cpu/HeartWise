"use client";

import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {useState, useEffect} from "react";
import {
  CountdownCircleTimer
} from "react-countdown-circle-timer";
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
// Import user data functions - assuming they are now in a service
import { get_user_game_preferences, set_user_game_preferences, add_user_points, add_user_reward } from "@/services/user_profile";


const questions = [
  {
    question: "What is the capital of France?",
    answer: "Paris",
  },
  {
    question: "What is the highest mountain in the world?",
    answer: "Mount Everest",
  },
  {
    question: "What is the largest ocean in the world?",
    answer: "Pacific Ocean",
  },
];

// Mock user ID - replace with actual user identification
const userId = 'user1';

/**
 * @fileOverview Implements the GamePage component with general knowledge questions and user preferences.
 */

/**
 * @function GamePage
 * @description A component for playing a general knowledge game with random questions and user-specific preferences. Awards points for correct answers and a potential badge.
 * @returns {JSX.Element} The rendered GamePage component.
 */
const GamePage = () => {
  const t = useTranslations("Game");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // Track if a game is in progress
  const [gamePreferences, setGamePreferences] = useState<string[]>([]);
  const { toast } = useToast();
  const [loadingPreferences, setLoadingPreferences] = useState(true);


    useEffect(() => {
        // Load game preferences from user data on mount
         const loadPreferences = async () => {
            setLoadingPreferences(true);
            try {
                const storedPreferences = await get_user_game_preferences(userId);
                setGamePreferences(storedPreferences);
            } catch (error) {
                 console.error("Failed to load game preferences:", error);
                 toast({ variant: 'destructive', title: "Error", description: "Could not load game preferences." });
            } finally {
                setLoadingPreferences(false);
            }
         }
        loadPreferences();
    }, [userId, toast]); // Added toast dependency

    // Effect to save preferences is removed as saving should happen on interaction, not state change.

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isPlaying && timeRemaining > 0 && !gameOver) {
      timer = setTimeout(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isPlaying && !gameOver) {
      setGameOver(true); // End game if time runs out
      toast({
          title: "Time's up!",
          description: "You ran out of time for this question.",
      });
      // Move to next question automatically or show results? For now, just ends the current question state.
      handleNextQuestion(); // Example: move to next question after time runs out
    }
     return () => clearTimeout(timer); // Cleanup the timer
  }, [timeRemaining, isPlaying, gameOver, toast]); // Removed handleNextQuestion from dependencies


  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(event.target.value);
  };

  const checkAnswer = async () => {
    if (isPlaying && !gameOver) {
      const correctAnswer = questions[currentQuestionIndex].answer.toLowerCase();
      const userAnswerLower = userAnswer.toLowerCase();

      const correct = userAnswerLower === correctAnswer;
      setIsCorrect(correct);

      if (correct) {
        setScore((prevScore) => prevScore + 1);
        const pointsAwarded = 10; // Example: Award 10 points for a correct answer
         try {
             await add_user_points(userId, pointsAwarded);
             toast({
                 title: "Correct!",
                 description: `You earned ${pointsAwarded} points.`,
             });

             // Attempt to add game winner badge if score reaches a threshold (e.g., 3)
             if (score + 1 >= 3) { // Check score *after* potential increment
                await add_user_reward(userId, {
                    name: "Quiz Whiz",
                    description: "Won a round in the game.",
                    type: "game_winner"
                });
                // Optional: Toast for the badge
             }

         } catch (error) {
             console.error("Failed to add points or reward:", error);
             toast({
                 variant: 'destructive',
                 title: "Error",
                 description: "Could not update your points or rewards.",
             });
         }
      } else {
         toast({
            title: "Incorrect!",
            description: `The correct answer was ${questions[currentQuestionIndex].answer}.`,
         });
      }

      setGameOver(true); // Set game over for the current question
      // Consider moving to the next question after a short delay or button press
      // setTimeout(handleNextQuestion, 1500); // Example delay
    }
  };

  const handleNextQuestion = () => {
    // Check if it's truly game over (all questions answered) or just question over
    if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setUserAnswer("");
        setIsCorrect(null);
        setTimeRemaining(15);
        setGameOver(false); // Reset for the next question
    } else {
        // Truly game over - maybe show a final score screen
        setIsPlaying(false); // End the game session
         toast({
            title: "Game Over!",
            description: `Your final score: ${score}`,
         });
    }
  };

  const startGame = () => {
    setScore(0); // Reset score for a new game
    setTimeRemaining(15);
    setGameOver(false);
    setIsCorrect(null); // Ensure feedback is cleared
    setCurrentQuestionIndex(0); // Start from the first question
    setIsPlaying(true);
  };

    /**
     * @function toggleGamePreference
     * @description Toggles the game preference for the user and saves it.
     * @param {string} gameId - The ID of the game preference to toggle.
     */
    const toggleGamePreference = async (gameId: string) => {
        const newPreferences = gamePreferences.includes(gameId)
            ? gamePreferences.filter((id) => id !== gameId)
            : [...gamePreferences, gameId];

        setGamePreferences(newPreferences); // Optimistic UI update

        try {
            await set_user_game_preferences(userId, newPreferences);
             toast({ title: "Preferences Updated", description: "Your game preferences have been saved." });
        } catch (error) {
             console.error("Failed to save game preferences:", error);
             toast({ variant: 'destructive', title: "Error", description: "Could not save game preferences." });
            // Revert optimistic update if needed
             setGamePreferences(gamePreferences);
        }
    };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      {!isPlaying ? (
        <div className="flex flex-col items-center space-y-6">
                    <div className="w-full max-w-md p-4 border rounded-lg">
                        <p className="mb-3 font-semibold text-center">Select Game Preferences:</p>
                        {loadingPreferences ? <p>Loading preferences...</p> : (
                             <div className="flex flex-wrap justify-center gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <Checkbox
                                        id="history"
                                        checked={gamePreferences.includes("history")}
                                        onCheckedChange={() => toggleGamePreference("history")}
                                    />
                                    <span className="text-sm">History</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <Checkbox
                                         id="science"
                                        checked={gamePreferences.includes("science")}
                                        onCheckedChange={() => toggleGamePreference("science")}
                                    />
                                    <span className="text-sm">Science</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <Checkbox
                                         id="geography"
                                        checked={gamePreferences.includes("geography")}
                                        onCheckedChange={() => toggleGamePreference("geography")}
                                    />
                                     <span className="text-sm">Geography</span>
                                </label>
                                {/* Add more preferences as needed */}
                            </div>
                        )}
                    </div>
          <div className="flex justify-center space-x-4">
             <Button onClick={startGame}>{t("randomPartner")}</Button>
             <Button onClick={startGame} disabled>{t("matchPartner")}</Button> {/* Disable match partner for now */}
           </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md border rounded-md p-6 shadow-lg">
             <div className="flex justify-between items-center mb-4">
                 <p className="font-semibold text-lg">Question {currentQuestionIndex + 1} / {questions.length}</p>
                 <div className="timer-wrapper flex items-center space-x-2">
                     <CountdownCircleTimer
                       isPlaying={isPlaying && !gameOver}
                       key={currentQuestionIndex} // Reset timer on question change
                       duration={15} // Reset duration here too
                       initialRemainingTime={timeRemaining}
                       colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                       colorsTime={[10, 5, 2, 0]}
                       size={50}
                       strokeWidth={4}
                       onComplete={() => {
                         // Timeout handled by useEffect, this is just visual
                       }}
                     >
                       {({ remainingTime }) => <span className="text-lg font-medium">{remainingTime}</span>}
                     </CountdownCircleTimer>
                 </div>
            </div>

            <p className="mb-4 text-center text-lg">{questions[currentQuestionIndex].question}</p>
            {!gameOver ? (
              <>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={handleAnswerChange}
                  placeholder={t("answer")}
                  className="border rounded-md p-2 mb-4 w-full text-center"
                  aria-label="Your answer"
                />
                 <Button onClick={checkAnswer} className="w-full">{t("submitAnswer")}</Button>

              </>
            ) : (
              <div className="text-center mt-4">
                {isCorrect === true && (
                  <p className="text-green-600 font-semibold mb-3">
                    {t("correctAnswer")}
                  </p>
                )}
                {isCorrect === false && (
                  <p className="text-red-600 font-semibold mb-3">
                    {t("incorrectAnswer")} Correct: {questions[currentQuestionIndex].answer}
                  </p>
                )}
                <Button onClick={handleNextQuestion} className="w-full">
                   {currentQuestionIndex + 1 < questions.length ? t("nextQuestion") : "View Results"}
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4 text-lg font-semibold">
              Score: {score}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
