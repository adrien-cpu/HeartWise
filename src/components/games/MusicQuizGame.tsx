import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, SkipForward, Heart } from 'lucide-react';

interface MusicQuizGameProps {
    onGameComplete: (score: number) => void;
    onPhotoReveal: (percentage: number) => void;
}

interface Question {
    id: number;
    text: string;
    type: 'artist' | 'genre' | 'playlist' | 'favorite';
    options?: string[];
}

interface MusicService {
    name: 'spotify' | 'deezer' | 'youtube';
    icon: React.ReactNode;
    color: string;
}

const musicServices: MusicService[] = [
    {
        name: 'spotify',
        icon: <Music className="w-6 h-6" />,
        color: '#1DB954'
    },
    {
        name: 'deezer',
        icon: <Music className="w-6 h-6" />,
        color: '#00C7F2'
    },
    {
        name: 'youtube',
        icon: <Music className="w-6 h-6" />,
        color: '#FF0000'
    }
];

const questions: Question[] = [
    {
        id: 1,
        text: "Quel est votre artiste préféré ?",
        type: 'artist'
    },
    {
        id: 2,
        text: "Quel genre musical vous fait vibrer ?",
        type: 'genre',
        options: ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classique', 'Électronique']
    },
    {
        id: 3,
        text: "Quelle est votre playlist préférée ?",
        type: 'playlist'
    },
    {
        id: 4,
        text: "Quelle chanson vous fait danser ?",
        type: 'favorite'
    }
];

export const MusicQuizGame: React.FC<MusicQuizGameProps> = ({
    onGameComplete,
    onPhotoReveal
}) => {
    const t = useTranslations('MusicQuizGame');
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [selectedService, setSelectedService] = useState<MusicService | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);

    const handleAnswer = (answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion]: answer
        }));

        // Simuler une vérification de réponse
        const isCorrect = Math.random() > 0.5; // À remplacer par la vraie logique
        if (isCorrect) {
            setScore(prev => prev + 1);
            onPhotoReveal(25); // 25% de la photo dévoilée par bonne réponse
        }

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            if (currentPlayer === 1) {
                setCurrentPlayer(2);
                setCurrentQuestion(0);
            } else {
                onGameComplete(score);
            }
        }
    };

    const handleServiceSelect = (service: MusicService) => {
        setSelectedService(service);
        // Ici, nous ajouterons la logique d'authentification pour chaque service
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {t('playerTurn', { player: currentPlayer })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <h3 className="text-lg font-medium">
                                {questions[currentQuestion].text}
                            </h3>

                            {!selectedService ? (
                                <div className="grid grid-cols-3 gap-4">
                                    {musicServices.map(service => (
                                        <Button
                                            key={service.name}
                                            variant="outline"
                                            className="flex flex-col items-center gap-2 p-4"
                                            onClick={() => handleServiceSelect(service)}
                                            style={{ borderColor: service.color }}
                                        >
                                            {service.icon}
                                            <span className="capitalize">{service.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {questions[currentQuestion].options ? (
                                        <RadioGroup
                                            onValueChange={handleAnswer}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            {questions[currentQuestion].options?.map(option => (
                                                <div key={option} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={option} id={option} />
                                                    <Label htmlFor={option}>{option}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    ) : (
                                        <div className="space-y-4">
                                            <Input
                                                placeholder={t('typeAnswer')}
                                                onChange={(e) => handleAnswer(e.target.value)}
                                            />
                                            <div className="flex justify-center gap-4">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setIsPlaying(!isPlaying)}
                                                >
                                                    {isPlaying ? <Pause /> : <Play />}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {/* Skip logic */ }}
                                                >
                                                    <SkipForward />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    {t('score', { score })}
                </div>
                <Button
                    variant="outline"
                    onClick={() => setSelectedService(null)}
                    disabled={!selectedService}
                >
                    {t('changeService')}
                </Button>
            </div>
        </div>
    );
}; 