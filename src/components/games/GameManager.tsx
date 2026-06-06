import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FlashQuestionGame from './FlashQuestionGame';
import DrawMeGame from './DrawMeGame';
import TwoTruthsOneLieGame from './TwoTruthsOneLieGame';
import StoryBuilderGame from './StoryBuilderGame';
import EmotionGuessGame from './EmotionGuessGame';
import { MusicQuizGame } from './MusicQuizGame';

type GameType = 'flash' | 'draw' | 'truth' | 'story' | 'emotion' | 'music';

interface GameManagerProps {
    onPhotoReveal: (percentage: number) => void;
    onGameSessionComplete: () => void;
}

const GameManager: React.FC<GameManagerProps> = ({
    onPhotoReveal,
    onGameSessionComplete,
}) => {
    const t = useTranslations('GameManager');
    const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
    const [gameScore, setGameScore] = useState(0);
    const [gameOrder, setGameOrder] = useState<GameType[]>([]);
    const [sessionStarted, setSessionStarted] = useState(false);
    const [currentGameIndex, setCurrentGameIndex] = useState(0);
    const [currentGame, setCurrentGame] = useState<GameType | null>(null);

    const handleGameComplete = (score: number | string) => {
        if (typeof score === 'number') {
            setGameScore(score);
        }
        // Attendre un peu avant de passer au jeu suivant ou de terminer
        setTimeout(() => {
            const currentIndex = gameOrder.indexOf(selectedGame!);
            if (currentIndex < gameOrder.length - 1) {
                setSelectedGame(gameOrder[currentIndex + 1]);
            } else {
                onGameSessionComplete();
            }
        }, 2000);
    };

    const handleDrawComplete = (drawings: { player1: string; player2: string }) => {
        // Sauvegarder les dessins et passer au jeu suivant
        const currentIndex = gameOrder.indexOf(selectedGame!);
        if (currentIndex < gameOrder.length - 1) {
            setSelectedGame(gameOrder[currentIndex + 1]);
        } else {
            onGameSessionComplete();
        }
    };

    const startGameSession = () => {
        const gameOrder: GameType[] = ['flash', 'draw', 'truth', 'story', 'emotion', 'music'];
        const shuffledGames = [...gameOrder].sort(() => Math.random() - 0.5);
        setGameOrder(shuffledGames);
        setCurrentGameIndex(0);
        setCurrentGame(shuffledGames[0]);
        setSessionStarted(true);
    };

    if (!sessionStarted) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-center">{t('selectGame')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            className="h-32"
                            onClick={() => setCurrentGame('flash')}
                        >
                            {t('flashQuestions')}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-32"
                            onClick={() => setCurrentGame('draw')}
                        >
                            {t('drawMe')}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-32"
                            onClick={() => setCurrentGame('truth')}
                        >
                            {t('twoTruthsOneLie')}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-32"
                            onClick={() => setCurrentGame('story')}
                        >
                            {t('storyBuilder')}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-32"
                            onClick={() => setCurrentGame('emotion')}
                        >
                            {t('emotionGuess')}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-32"
                            onClick={() => setCurrentGame('music')}
                        >
                            {t('musicQuiz')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {currentGame === 'flash' && (
                <FlashQuestionGame
                    onGameComplete={handleGameComplete}
                    onPhotoReveal={onPhotoReveal}
                />
            )}
            {currentGame === 'draw' && (
                <DrawMeGame
                    onGameComplete={handleDrawComplete}
                    onPhotoReveal={onPhotoReveal}
                />
            )}
            {currentGame === 'truth' && (
                <TwoTruthsOneLieGame
                    onGameComplete={handleGameComplete}
                    onPhotoReveal={onPhotoReveal}
                />
            )}
            {currentGame === 'story' && (
                <StoryBuilderGame
                    onGameComplete={handleGameComplete}
                    onPhotoReveal={onPhotoReveal}
                />
            )}
            {currentGame === 'emotion' && (
                <EmotionGuessGame
                    onGameComplete={handleGameComplete}
                    onPhotoReveal={onPhotoReveal}
                />
            )}
            {currentGame === 'music' && (
                <MusicQuizGame
                    onGameComplete={handleGameComplete}
                    onPhotoReveal={onPhotoReveal}
                />
            )}
        </div>
    );
};

export default GameManager; 