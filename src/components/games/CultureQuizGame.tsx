'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/UserProfile';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { cultureQuizQuestions, QuizQuestion } from '@/ai/questionnaires/culture_quiz_questions';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 4; // 4x4 grid
const QUESTIONS_PER_GAME = 5;

export default function CultureQuizGame() {
  const { user, loading: authLoading } = useAuth();
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [revealedCells, setRevealedCells] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'ended'>('playing');
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);

  const imageCells = useMemo(() => Array.from(Array(GRID_SIZE * GRID_SIZE).keys()), []);

  const setupGame = async () => {
    setLoading(true);
    setScore(0);
    setRevealedCells([]);
    setCurrentQuestionIndex(0);
    setGameState('playing');

    try {
      const usersSnapshot = await getDocs(collection(firestore, "users"));
      const allUsers = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
        .filter(p => p.id !== user?.id && p.profilePicture); // Ensure partner has a picture

      if (allUsers.length === 0) {
        // Handle case with no available partners
        setLoading(false);
        return;
      }

      const randomPartner = allUsers[Math.floor(Math.random() * allUsers.length)];
      setPartner(randomPartner);

      // Select random questions
      const shuffledQuestions = [...cultureQuizQuestions].sort(() => 0.5 - Math.random());
      setQuestions(shuffledQuestions.slice(0, QUESTIONS_PER_GAME));

    } catch (error) {
      console.error("Error setting up game: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      setupGame();
    }
  }, [user, authLoading]);

  const handleAnswer = (selectedOption: string) => {
    if (answerStatus) return; // Prevent multiple clicks

    const isCorrect = selectedOption === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
      setAnswerStatus('correct');
      // Reveal a new random cell
      setRevealedCells(prev => {
        const unrevealed = imageCells.filter(cell => !prev.includes(cell));
        if (unrevealed.length > 0) {
            const newCellToReveal = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            return [...prev, newCellToReveal];
        }
        return prev;
      });
    } else {
        setAnswerStatus('incorrect');
    }

    setTimeout(() => {
        setAnswerStatus(null);
        if (currentQuestionIndex < QUESTIONS_PER_GAME - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            setGameState('ended');
        }
    }, 1500);
  };

  if (loading || !partner) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const finalReveal = gameState === 'ended' && score >= 3;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Image Grid */}
          <div className="relative aspect-square w-full max-w-sm mx-auto select-none">
            <motion.div 
                className="grid grid-cols-4 grid-rows-4 w-full h-full border-2 border-primary/20 rounded-lg overflow-hidden"
                style={{ backgroundImage: `url(${partner.profilePicture})`, backgroundSize: 'cover' }}
            >
                {imageCells.map(cellIndex => (
                    <AnimatePresence key={cellIndex}>
                        {!revealedCells.includes(cellIndex) && !finalReveal && (
                             <motion.div
                                className="w-full h-full bg-primary flex items-center justify-center border border-primary-foreground/10"
                                initial={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.5 } }}
                             >
                                 <span className="text-primary-foreground font-bold text-lg">?</span>
                             </motion.div>
                        )}
                    </AnimatePresence>
                ))}
            </motion.div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <Avatar className="w-16 h-16 border-4 border-background shadow-lg">
                    <AvatarImage src={partner.profilePicture} />
                    <AvatarFallback>{partner.name?.[0] || 'P'}</AvatarFallback>
                </Avatar>
            </div>
          </div>

          {/* Game Content */}
          <div className="flex flex-col justify-center h-full text-center md:text-left">
            {gameState === 'playing' ? (
              <>
                <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} / {QUESTIONS_PER_GAME}</p>
                <h2 className="text-xl font-semibold my-4 min-h-[5rem]">{currentQuestion.question}</h2>
                <div className="grid grid-cols-2 gap-2">
                  {currentQuestion.options.map(option => (
                    <Button 
                        key={option}
                        variant={answerStatus && option === currentQuestion.correctAnswer ? 'default' : (answerStatus && option !== currentQuestion.correctAnswer ? 'destructive' : 'outline')}
                        onClick={() => handleAnswer(option)}
                        className="h-auto py-2 whitespace-normal min-h-[3rem] transition-all duration-300"
                        disabled={!!answerStatus}
                    >
                        {option}
                    </Button>
                  ))}
                </div>
                <AnimatePresence>
                {answerStatus === 'correct' && 
                    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="flex items-center justify-center mt-4 text-green-600"><CheckCircle className="mr-2"/> Bonne réponse !</motion.div>}
                {answerStatus === 'incorrect' && 
                    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="flex items-center justify-center mt-4 text-destructive"><XCircle className="mr-2"/> Mauvaise réponse...</motion.div>}
                </AnimatePresence>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-bold">Partie terminée !</h2>
                <p className="text-muted-foreground mt-2">Votre score : {score} / {QUESTIONS_PER_GAME}</p>
                {finalReveal ? (
                    <>
                        <p className="text-green-600 mt-4 font-semibold text-center">Félicitations ! Vous avez débloqué le profil de {partner.name}.</p>
                        <Button className="mt-6">Contacter {partner.name}</Button>
                    </>
                ) : (
                    <p className="text-destructive mt-4 text-center">Dommage ! Vous n'avez pas obtenu assez de bonnes réponses pour révéler complètement le profil.</p>
                )}
                <Button variant="outline" onClick={setupGame} className="mt-4"><RefreshCw className="mr-2 h-4 w-4"/> Rejouer</Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
