
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useToast } from '@/hooks/use-toast';
import { add_user_points, add_user_reward } from '@/services/user_profile';
import { Loader2, Play, Check, X, RotateCcw, Trophy } from 'lucide-react';

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
 * @module TimesUpGame
 */

interface TimesUpGameProps {
  userId: string; // User ID for attributing points and rewards
  onGameComplete?: () => void; // Optional callback when a game round finishes
}

/**
 * @function TimesUpGame
 * @description A component handling the logic and UI for the Time's Up game mode.
 * @param {TimesUpGameProps} props - Props for the TimesUpGame component.
 * @returns {JSX.Element} The rendered TimesUpGame component.
 */
export default function TimesUpGame({ userId, onGameComplete }: TimesUpGameProps) {
  const t = useTranslations('Game');
  const { toast } = useToast();

  const [gameState, setGameState] = useState<GameState>('ready');
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roundDuration = 60;
  const pointsPerWord = 5;

  const setupGame = useCallback(() => {
    setWords(shuffleArray([...timesUpWords]));
    setCurrentWordIndex(0);
    setScore(0);
    setRound(1);
    setTimeRemaining(roundDuration);
    setIsPlaying(false);
    setGameState('ready');
  }, []);

  useEffect(() => {
    setupGame();
  }, [setupGame]);

  const endRound = useCallback(async (finalScore: number) => {
    setIsPlaying(false);
    setGameState('roundOver');
    toast({
      title: t('tuRoundOver'),
      description: t('tuWordsGuessed', { count: finalScore }),
    });

    if (finalScore > 0 && userId) {
      setIsLoading(true);
      try {
        const pointsAwarded = finalScore * pointsPerWord;
        await add_user_points(userId, pointsAwarded);
        toast({
            title: t('pointsAwardedTitle'),
            description: t('pointsEarnedDesc', { count: pointsAwarded }),
        });

        // Example: Award a badge if score is above a certain threshold
        if (finalScore >= 5) { // Arbitrary threshold for a badge
          await add_user_reward(userId, {
            name: t('badgeGameWinnerName'), // Assuming a generic game winner badge
            description: t('badgeGameWinnerDesc'),
            type: "game_winner"
          });
          toast({ title: t('badgeEarnedTitle'), description: t('badgeEarnedDesc', { badgeName: t('badgeGameWinnerName') }) });
        }
      } catch (err) {
        console.error("Failed to add points/reward:", err);
        toast({ variant: 'destructive', title: t('error'), description: t('errorUpdatingScore') });
      } finally {
        setIsLoading(false);
      }
    }
    onGameComplete?.(); // Call the callback if provided
  }, [toast, t, pointsPerWord, userId, onGameComplete]); // Added userId and onGameComplete

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isPlaying && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isPlaying) {
      endRound(score);
    }
    return () => clearTimeout(timer);
  }, [timeRemaining, isPlaying, score, endRound]);

  const startRound = () => {
    setupGame();
    setTimeRemaining(roundDuration);
    setIsPlaying(true);
    setGameState('playing');
  };

  const handleNextWord = (guessed: boolean) => {
    if (!isPlaying) return;

    const newScore = guessed ? score + 1 : score;

    if (currentWordIndex + 1 < words.length) {
      setCurrentWordIndex((prev) => prev + 1);
      if (guessed) {
        setScore(newScore);
      }
    } else {
      endRound(newScore);
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

        {gameState === 'playing' && (
          <>
            <div className="timer-wrapper mb-4">
              <CountdownCircleTimer
                isPlaying={isPlaying}
                key={round}
                duration={roundDuration}
                initialRemainingTime={timeRemaining}
                colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                colorsTime={[45, 25, 10, 0]}
                size={80}
                strokeWidth={6}
                onComplete={() => { /* Timer end handled by useEffect */ }}
              >
                {({ remainingTime: rt }) => <span className="text-2xl font-bold">{rt}</span>}
              </CountdownCircleTimer>
            </div>
            <p className="text-sm text-muted-foreground">{t('tuDescribe')}</p>
            <p className="text-4xl font-bold text-center p-4 bg-secondary rounded-md min-h-[80px] flex items-center justify-center">
              {currentWord || '...'}
            </p>
            <p className="text-lg font-semibold flex items-center gap-1"><Trophy className="h-5 w-5 text-yellow-500"/> {t('scoreLabel')}: {score}</p>
          </>
        )}

        {gameState === 'roundOver' && (
           <div className="text-center space-y-4">
                <p className="text-xl font-semibold">{t('tuRoundOver')}</p>
                <p className="text-lg">{t('tuFinalScore', { score: score })}</p>
                 {isLoading && <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-2" />}
                <Button onClick={startRound} variant="outline" disabled={isLoading}>
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
             <Check className="mr-2 h-5 w-5"/> {t('tuGotIt')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
