import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface Statement {
    text: string;
    isLie: boolean;
}

interface TwoTruthsOneLieGameProps {
    onGameComplete: (score: number) => void;
    onPhotoReveal: (percentage: number) => void;
}

const TwoTruthsOneLieGame: React.FC<TwoTruthsOneLieGameProps> = ({
    onGameComplete,
    onPhotoReveal,
}) => {
    const t = useTranslations('TwoTruthsOneLieGame');
    const [currentPhase, setCurrentPhase] = useState<'writing' | 'guessing'>('writing');
    const [statements, setStatements] = useState<Statement[]>([]);
    const [currentStatement, setCurrentStatement] = useState('');
    const [selectedLie, setSelectedLie] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(1);

    const handleStatementSubmit = () => {
        if (currentStatement.trim() && statements.length < 3) {
            setStatements([...statements, { text: currentStatement, isLie: false }]);
            setCurrentStatement('');

            if (statements.length === 2) {
                // Passer à la phase de sélection du mensonge
                setCurrentPhase('guessing');
            }
        }
    };

    const handleLieSelection = (index: number) => {
        setSelectedLie(index);
        const newStatements = [...statements];
        newStatements[index].isLie = true;
        setStatements(newStatements);
    };

    const handleGuess = (index: number) => {
        if (statements[index].isLie) {
            setScore(score + 1);
            onPhotoReveal((score + 1) * 33.33); // Dévoile environ 33.33% de la photo par bonne réponse
        }

        // Passer au joueur suivant ou terminer le jeu
        if (currentPlayer === 1) {
            setCurrentPlayer(2);
            setStatements([]);
            setCurrentStatement('');
            setSelectedLie(null);
            setCurrentPhase('writing');
        } else {
            onGameComplete(score);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-center">
                    {currentPhase === 'writing'
                        ? t('writeStatements', { player: currentPlayer })
                        : t('guessLie', { player: currentPlayer === 1 ? 2 : 1 })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    {currentPhase === 'writing' ? (
                        <motion.div
                            key="writing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                {statements.map((statement, index) => (
                                    <div key={index} className="p-2 bg-muted rounded">
                                        <p>{statement.text}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={currentStatement}
                                    onChange={(e) => setCurrentStatement(e.target.value)}
                                    placeholder={t('enterStatement')}
                                    disabled={statements.length >= 3}
                                />
                                <Button
                                    onClick={handleStatementSubmit}
                                    disabled={!currentStatement.trim() || statements.length >= 3}
                                >
                                    {t('add')}
                                </Button>
                            </div>
                            {statements.length === 2 && (
                                <Button
                                    className="w-full"
                                    onClick={() => setCurrentPhase('guessing')}
                                >
                                    {t('selectLie')}
                                </Button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="guessing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                {statements.map((statement, index) => (
                                    <Button
                                        key={index}
                                        variant={selectedLie === index ? "default" : "outline"}
                                        className="w-full justify-start"
                                        onClick={() => handleLieSelection(index)}
                                    >
                                        {statement.text}
                                    </Button>
                                ))}
                            </div>
                            {selectedLie !== null && (
                                <div className="space-y-2">
                                    <p className="text-center font-medium">{t('guessPrompt')}</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {statements.map((_, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                onClick={() => handleGuess(index)}
                                            >
                                                {t('guessStatement', { number: index + 1 })}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default TwoTruthsOneLieGame; 