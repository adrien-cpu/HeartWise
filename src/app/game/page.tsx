"use client";

import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {useState, useEffect} from "react";
import {
  CountdownCircleTimer
} from "react-countdown-circle-timer";
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { get_user_game_preferences, set_user_game_preferences } from "users_data";


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

/**
 * @fileOverview Implements the GamePage component with general knowledge questions and user preferences.
 */

/**
 * @function GamePage
 * @description A component for playing a general knowledge game with random questions and user-specific preferences.
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
    const { toast } = useToast()

  useEffect(() => {
        // Load game preferences from user data on mount
        const storedPreferences = get_user_game_preferences(1); // Assuming user ID is 1
        setGamePreferences(storedPreferences);
    }, []);

    useEffect(() => {
        // Save game preferences to user data whenever they change
        set_user_game_preferences(1, gamePreferences); // Assuming user ID is 1
    }, [gamePreferences]);


  useEffect(() => {
    if (isPlaying && timeRemaining > 0 && !gameOver) {
      const timer = setTimeout(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer); // Cleanup the timer
    } else if (timeRemaining === 0 && isPlaying) {
      setGameOver(true); // End game if time runs out
            toast({
                title: "Time's up!",
                description: "You ran out of time for this question.",
            })
    }
  }, [timeRemaining, isPlaying, gameOver]);


  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(event.target.value);
  };

  const checkAnswer = () => {
    if (isPlaying) {
      const correctAnswer = questions[currentQuestionIndex].answer.toLowerCase();
      const userAnswerLower = userAnswer.toLowerCase();

      const correct = userAnswerLower === correctAnswer;
      setIsCorrect(correct);

      if (correct) {
        setScore((prevScore) => prevScore + 1);
      }

      setGameOver(true);
            toast({
                title: correct ? "Correct!" : "Incorrect!",
                description: correct
                    ? "You got the right answer."
                    : `The correct answer was ${questions[currentQuestionIndex].answer}.`,
            })
    }
  };
  const handleNextQuestion = () => {
    if (gameOver) {
      setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
      setUserAnswer("");
      setIsCorrect(null);
      setTimeRemaining(15);
      setGameOver(false); // Reset gameOver state
    }
  };

  const startGame = () => {
    //setScore(0);
    setTimeRemaining(15);
    setGameOver(false);
    setIsPlaying(true);
    setCurrentQuestionIndex(0);
  };

    /**
     * @function toggleGamePreference
     * @description Toggles the game preference for the user.
     * @param {string} gameId - The ID of the game preference to toggle.
     */
    const toggleGamePreference = (gameId: string) => {
        if (gamePreferences.includes(gameId)) {
            setGamePreferences(gamePreferences.filter((id) => id !== gameId));
        } else {
            setGamePreferences([...gamePreferences, gameId]);
        }
    };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      {!isPlaying ? (
        <div className="flex justify-center space-x-4 mb-4">
                    <div className="flex flex-col items-center">
                        <p className="mb-2">Select Game Preferences:</p>
                        <div className="flex space-x-2">
                            <label className="flex items-center space-x-2">
                                <Checkbox
                                    checked={gamePreferences.includes("history")}
                                    onCheckedChange={() => toggleGamePreference("history")}
                                />
                                <span>History</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <Checkbox
                                    checked={gamePreferences.includes("science")}
                                    onCheckedChange={() => toggleGamePreference("science")}
                                />
                                <span>Science</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <Checkbox
                                    checked={gamePreferences.includes("geography")}
                                    onCheckedChange={() => toggleGamePreference("geography")}
                                />
                                <span>Geography</span>
                            </label>
                        </div>
                    </div>
          <Button onClick={startGame}>{t("randomPartner")}</Button>
          <Button onClick={startGame}>{t("matchPartner")}</Button>
        </div>
      ) : (
        <div>
          <div className="border rounded-md p-4">
            <p className="font-semibold">{t("question")}:</p>
            <p className="mb-2">{questions[currentQuestionIndex].question}</p>
            {!gameOver ? (
              <>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={handleAnswerChange}
                  placeholder={t("answer")}
                  className="border rounded-md p-2 mb-2 w-full"
                />
                <Button onClick={checkAnswer}>{t("submitAnswer")}</Button>
                <div className="timer-wrapper">
                  <CountdownCircleTimer
                    isPlaying={isPlaying && !gameOver}
                    duration={timeRemaining}
                    colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                    colorsTime={[7, 5, 2, 0]}
                    size={50}
                    strokeWidth={4}
                  >
                    {({ remainingTime }) => remainingTime}
                  </CountdownCircleTimer>
                </div>
              </>
            ) : (
              <div>
                {isCorrect === true && (
                  <p className="text-green-500">
                    {t("correctAnswer")}
                  </p>
                )}
                {isCorrect === false && (
                  <p className="text-red-500">
                    {t("incorrectAnswer")}
                  </p>
                )}
                <Button onClick={handleNextQuestion}>
                  {t("nextQuestion")}
                </Button>
              </div>
            )}
          </div>
          {gameOver && (
            <div className="flex justify-end mt-4">
              <p>Score: {score}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GamePage;
