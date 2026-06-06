import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

interface Emotion {
    id: string;
    label: string;
    emoji: string;
}

interface Situation {
    text: string;
    emotion: string;
    player: number;
}

interface EmotionGuessGameProps {
    onGameComplete: (score: number) => void;
    onPhotoReveal: (percentage: number) => void;
}

const EmotionGuessGame: React.FC<EmotionGuessGameProps> = ({
    onGameComplete,
    onPhotoReveal,
}) => {
    const t = useTranslations('EmotionGuessGame');
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [gamePhase, setGamePhase] = useState<'writing' | 'guessing'>('writing');
    const [situations, setSituations] = useState<Situation[]>([]);
    const [currentSituation, setCurrentSituation] = useState('');
    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const maxRounds = 3;

    const emotions: Emotion[] = [
        { id: 'joy', label: 'Joie', emoji: '😊' },
        { id: 'sadness', label: 'Tristesse', emoji: '😢' },
        { id: 'anger', label: 'Colère', emoji: '😠' },
        { id: 'fear', label: 'Peur', emoji: '😨' },
        { id: 'surprise', label: 'Surprise', emoji: '😲' },
        { id: 'love', label: 'Amour', emoji: '❤️' },
        { id: 'excitement', label: 'Excitation', emoji: '🤩' },
        { id: 'anxiety', label: 'Anxiété', emoji: '😰' }
    ];

    const handleSituationSubmit = () => {
        if (currentSituation.trim() && selectedEmotion) {
            const newSituations = [...situations, {
                text: currentSituation,
                emotion: selectedEmotion,
                player: currentPlayer
            }];
            setSituations(newSituations);
            setCurrentSituation('');
            setSelectedEmotion(null);

            if (newSituations.length === maxRounds * 2) {
                setGamePhase('guessing');
            } else {
                setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
            }
        }
    };

    const handleEmotionGuess = (situationIndex: number, guessedEmotion: string) => {
        const situation = situations[situationIndex];
        if (situation.emotion === guessedEmotion) {
            setScore(score + 1);
            onPhotoReveal((score + 1) * (100 / (maxRounds * 2)));
        }

        if (situationIndex === situations.length - 1) {
            onGameComplete(score);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-center">
                    {gamePhase === 'writing'
                        ? t('describeSituation', { player: currentPlayer, round })
                        : t('guessEmotion')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    {gamePhase === 'writing' ? (
                        <motion.div
                            key="writing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                {situations.map((situation, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-3 rounded ${situation.player === 1 ? 'bg-primary/10' : 'bg-secondary/10'
                                            }`}
                                    >
                                        <p className="text-sm text-muted-foreground">
                                            {t('player', { number: situation.player })}:
                                        </p>
                                        <p>{situation.text}</p>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <Textarea
                                    value={currentSituation}
                                    onChange={(e) => setCurrentSituation(e.target.value)}
                                    placeholder={t('enterSituation')}
                                    className="min-h-[100px]"
                                />
                                <div className="grid grid-cols-4 gap-2">
                                    {emotions.map((emotion) => (
                                        <Button
                                            key={emotion.id}
                                            variant={selectedEmotion === emotion.id ? "default" : "outline"}
                                            onClick={() => setSelectedEmotion(emotion.id)}
                                            className="flex flex-col items-center gap-1"
                                        >
                                            <span className="text-xl">{emotion.emoji}</span>
                                            <span className="text-xs">{emotion.label}</span>
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    onClick={handleSituationSubmit}
                                    disabled={!currentSituation.trim() || !selectedEmotion}
                                    className="w-full"
                                >
                                    {t('submit')}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="guessing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="space-y-4">
                                {situations.map((situation, index) => (
                                    <div key={index} className="space-y-2">
                                        <p className="font-medium">{situation.text}</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {emotions.map((emotion) => (
                                                <Button
                                                    key={emotion.id}
                                                    variant="outline"
                                                    onClick={() => handleEmotionGuess(index, emotion.id)}
                                                    className="flex flex-col items-center gap-1"
                                                >
                                                    <span className="text-xl">{emotion.emoji}</span>
                                                    <span className="text-xs">{emotion.label}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default EmotionGuessGame; 