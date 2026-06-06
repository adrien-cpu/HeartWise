import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: string;
}

interface FlashQuestionGameProps {
    onGameComplete: (score: number) => void;
    onPhotoReveal: (percentage: number) => void;
}

const FlashQuestionGame: React.FC<FlashQuestionGameProps> = ({
    onGameComplete,
    onPhotoReveal,
}) => {
    const t = useTranslations('FlashQuestionGame');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);

    // Questions prédéfinies (à déplacer dans un fichier de configuration)
    const questions: Question[] = [
        {
            id: 1,
            text: "Plage ou montagne ?",
            options: ["Plage", "Montagne"],
            correctAnswer: "Plage"
        },
        {
            id: 2,
            text: "Café ou thé ?",
            options: ["Café", "Thé"],
            correctAnswer: "Café"
        },
        {
            id: 3,
            text: "Film ou série ?",
            options: ["Film", "Série"],
            correctAnswer: "Série"
        },
        {
            id: 4,
            text: "Voyage en solo ou en groupe ?",
            options: ["Solo", "Groupe"],
            correctAnswer: "Solo"
        },
        {
            id: 5,
            text: "Restaurant ou cuisine maison ?",
            options: ["Restaurant", "Cuisine maison"],
            correctAnswer: "Restaurant"
        }
    ];

    const handleNextQuestion = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setTimeLeft(30);
        } else {
            onGameComplete(score);
        }
    }, [currentQuestionIndex, questions.length, onGameComplete, score]);

    useEffect(() => {
        if (timeLeft > 0 && !isAnswered) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isAnswered) {
            handleNextQuestion();
        }
    }, [timeLeft, isAnswered, handleNextQuestion]);

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setIsAnswered(true);

        if (answer === questions[currentQuestionIndex].correctAnswer) {
            setScore((prev) => prev + 1);
            onPhotoReveal((score + 1) * 20); // Dévoile 20% de la photo par bonne réponse
        }

        setTimeout(() => {
            handleNextQuestion();
        }, 1500);
    };



    const currentQuestion = questions[currentQuestionIndex];

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-center">{t('title')}</CardTitle>
                <div className="flex justify-between items-center">
                    <span>{t('score', { score })}</span>
                    <span>{t('timeLeft', { time: timeLeft })}</span>
                </div>
                <Progress value={(timeLeft / 30) * 100} className="w-full" />
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <h3 className="text-lg font-medium text-center">
                            {currentQuestion.text}
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {currentQuestion.options.map((option) => (
                                <Button
                                    key={option}
                                    variant={selectedAnswer === option ? "default" : "outline"}
                                    className="w-full"
                                    onClick={() => handleAnswer(option)}
                                    disabled={isAnswered}
                                >
                                    {option}
                                </Button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default FlashQuestionGame; 