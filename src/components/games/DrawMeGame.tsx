import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DrawMeGameProps {
    onGameComplete: (drawings: { player1: string; player2: string }) => void;
    onPhotoReveal: (percentage: number) => void;
}

const DrawMeGame: React.FC<DrawMeGameProps> = ({
    onGameComplete,
    onPhotoReveal,
}) => {
    const t = useTranslations('DrawMeGame');
    const [currentPhase, setCurrentPhase] = useState<'questions' | 'drawing'>('questions');
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [answers, setAnswers] = useState<string[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [drawing, setDrawing] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);

    const maxQuestions = 5;
    const questionsPerPlayer = 3;

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
            }
        }
    }, []);

    const handleQuestionSubmit = () => {
        if (currentQuestion.trim() && questions.length < maxQuestions) {
            setQuestions([...questions, currentQuestion]);
            setCurrentQuestion('');

            if (questions.length === questionsPerPlayer - 1) {
                setCurrentPhase('drawing');
            }
        }
    };

    const handleAnswerSubmit = () => {
        if (currentAnswer.trim()) {
            setAnswers([...answers, currentAnswer]);
            setCurrentAnswer('');
            onPhotoReveal((answers.length + 1) * 20); // Dévoile 20% de la photo par réponse
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setLastX(x);
        setLastY(y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        setLastX(x);
        setLastY(y);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleComplete = () => {
        if (canvasRef.current) {
            const drawingData = canvasRef.current.toDataURL();
            setDrawing(drawingData);
            onGameComplete({
                player1: drawingData,
                player2: '' // À implémenter pour le deuxième joueur
            });
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-center">
                    {currentPhase === 'questions'
                        ? t('askQuestions')
                        : t('drawBasedOnAnswers')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {currentPhase === 'questions' ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {questions.map((q, index) => (
                                <div key={index} className="p-2 bg-muted rounded">
                                    <p className="font-medium">{q}</p>
                                    {answers[index] && (
                                        <p className="text-sm text-muted-foreground">{answers[index]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={currentQuestion}
                                onChange={(e) => setCurrentQuestion(e.target.value)}
                                placeholder={t('enterQuestion')}
                                disabled={questions.length >= maxQuestions}
                            />
                            <Button
                                onClick={handleQuestionSubmit}
                                disabled={!currentQuestion.trim() || questions.length >= maxQuestions}
                            >
                                {t('ask')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {questions.map((q, index) => (
                                <div key={index} className="p-2 bg-muted rounded">
                                    <p className="font-medium">{q}</p>
                                    <p className="text-sm text-muted-foreground">{answers[index]}</p>
                                </div>
                            ))}
                        </div>
                        <canvas
                            ref={canvasRef}
                            width={400}
                            height={400}
                            className="border rounded bg-white"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseOut={stopDrawing}
                        />
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={clearCanvas}>
                                {t('clear')}
                            </Button>
                            <Button onClick={handleComplete}>
                                {t('complete')}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DrawMeGame; 