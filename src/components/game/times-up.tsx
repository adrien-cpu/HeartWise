
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useToast } from '@/hooks/use-toast';
import { add_user_points } from '@/services/user_profile'; // Assuming points service exists
import { Loader2, Play, Check, X, RotateCcw, ChevronsRight } from 'lucide-react'; // Icons

// Mock user ID - replace with actual user identification
const userId = 'user1';

// Mock words for Time's Up
const timesUpWords = [
  "Elephant", "Sunshine", "Library", "Guitar", "Adventure", "Chocolate", "Mountain", "Telescope", "Whisper", "Dragon",
  "Bicycle", "Ocean", "Pancakes", "Mystery", "Fireworks", "Robot", "Garden", "Pirate", "Moonlight", "Jungle"
];

// Shuffle function (Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

type GameState = 'ready' | 'playing' | 'roundOver' | 'gameOver';

/**
 * @fileOverview Implements the Time's Up game component.
 */

/**
 * @function TimesUpGame
 * @description A component handling the logic and UI for the Time's Up game mode.
 * @returns {JSX.Element} The rendered TimesUpGame component.
 */
export default function TimesUpGame() {
  const t = useTranslations('Game'); // Use Game namespace for translations
  const { toast } = useToast();

  const [gameState, setGameState] = useState<GameState>('ready');
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1); // Could have multiple rounds later
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds per round
  const [isPlaying, setIsPlaying] = useState(false); // For timer control
  const [isLoading, setIsLoading] = useState(false); // For async operations

  const roundDuration = 60; // Base duration

  // Initialize or reset game
  const setupGame = useCallback(() => {
    setWords(shuffleArray([...timesUpWords]));
    setCurrentWordIndex(0);
    setScore(0);
    setRound(1);
    setTimeRemaining(roundDuration);
    setIsPlaying(false);
    setGameState('ready');
  }, []); // No dependencies needed if timesUpWords is constant

  useEffect(() => {
    setupGame(); // Setup game on initial mount
  }, [setupGame]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isPlaying && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isPlaying) {
      // Round Over
      setIsPlaying(false);
      setGameState('roundOver');
      toast({
        title: t('tuRoundOver'),
        description: t('tuWordsGuessed', { count: score }),
      });
      // Award points based on score
       if (score > 0) {
         add_user_points(userId, score * 5) // Example: 5 points per word
           .catch(err => console.error("Failed to add points:", err));
       }
    }
    return () => clearTimeout(timer);
  }, [timeRemaining, isPlaying, score, toast, t]);

  const startRound = () => {
    setTimeRemaining(roundDuration);
    setIsPlaying(true);
    setGameState('playing');
  };

  const handleNextWord = (guessed: boolean) => {
    if (!isPlaying) return;

    if (guessed) {
      setScore((prev) => prev + 1);
    }

    if (currentWordIndex + 1 < words.length) {
      setCurrentWordIndex((prev) => prev + 1);
    } else {
      // No more words, end round early
      setIsPlaying(false);
      setGameState('roundOver');
      toast({
        title: t('tuRoundOver'),
        description: t('tuWordsGuessed', { count: score + (guessed ? 1 : 0) }), // Adjust score if last word was guessed
      });
        // Award points
        if (score + (guessed ? 1 : 0) > 0) {
           add_user_points(userId, (score + (guessed ? 1 : 0)) * 5)
             .catch(err => console.error("Failed to add points:", err));
         }
    }
  };

  const currentWord = words[currentWordIndex];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{t('tabTimesUp')}</CardTitle>
        <CardDescription>{t('timesUpDescription')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center min-h-[250px] space-y-6">
        {gameState === 'ready' && (
          <>
            <Play className="h-16 w-16 text-primary" />
            <p className="text-lg font-semibold">{t('tuGetReady')}</p>
            <Button onClick={startRound} size="lg">{t('tuStartRound')}</Button>
          </>
        )}

        {(gameState === 'playing' || gameState === 'roundOver' && timeRemaining > 0) && ( // Show timer and word while playing or if round ended but timer visible
          <>
            <div className="timer-wrapper mb-4">
              <CountdownCircleTimer
                isPlaying={isPlaying}
                key={round} // Reset timer visually when round changes
                duration={roundDuration}
                initialRemainingTime={timeRemaining}
                colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                colorsTime={[45, 25, 10, 0]} // Adjusted timings
                size={80}
                strokeWidth={6}
                onComplete={() => { /* Timer end handled by useEffect */ }}
              >
                {({ remainingTime }) => <span className="text-2xl font-bold">{remainingTime}</span>}
              </CountdownCircleTimer>
            </div>
            <p className="text-sm text-muted-foreground">{t('tuDescribe')}</p>
            <p className="text-4xl font-bold text-center p-4 bg-secondary rounded-md min-h-[80px] flex items-center justify-center">
              {currentWord || '...'}
            </p>
          </>
        )}

        {gameState === 'roundOver' && (
           <div className="text-center space-y-4">
                <p className="text-xl font-semibold">{t('tuRoundOver')}</p>
                <p className="text-lg">{t('tuFinalScore', { score: score })}</p>
                <Button onClick={setupGame} variant="outline">
                     <RotateCcw className="mr-2 h-4 w-4"/> {t('tuPlayAgain')}
                </Button>
           </div>
        )}

      </CardContent>

      {gameState === 'playing' && (
        <CardFooter className="grid grid-cols-2 gap-4">
          <Button onClick={() => handleNextWord(false)} variant="outline" size="lg" disabled={!isPlaying}>
            <X className="mr-2 h-5 w-5 text-destructive"/> {t('tuSkip')}
          </Button>
          <Button onClick={() => handleNextWord(true)} variant="default" size="lg" disabled={!isPlaying}>
             <Check className="mr-2 h-5 w-5 text-primary-foreground"/> {t('tuGotIt')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
