import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

interface StorySentence {
    text: string;
    player: number;
}

interface StoryBuilderGameProps {
    onGameComplete: (story: string) => void;
    onPhotoReveal: (percentage: number) => void;
}

const StoryBuilderGame: React.FC<StoryBuilderGameProps> = ({
    onGameComplete,
    onPhotoReveal,
}) => {
    const t = useTranslations('StoryBuilderGame');
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [story, setStory] = useState<StorySentence[]>([]);
    const [currentSentence, setCurrentSentence] = useState('');
    const [gamePhase, setGamePhase] = useState<'writing' | 'review'>('writing');
    const maxSentences = 6; // 3 phrases par joueur

    const handleSentenceSubmit = () => {
        if (currentSentence.trim() && story.length < maxSentences) {
            const newStory = [...story, { text: currentSentence, player: currentPlayer }];
            setStory(newStory);
            setCurrentSentence('');

            // Dévoiler une partie de la photo à chaque phrase
            onPhotoReveal((newStory.length / maxSentences) * 100);

            if (newStory.length === maxSentences) {
                setGamePhase('review');
            } else {
                // Passer au joueur suivant
                setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
            }
        }
    };

    const handleComplete = () => {
        const finalStory = story.map(s => s.text).join(' ');
        onGameComplete(finalStory);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-center">
                    {gamePhase === 'writing'
                        ? t('addSentence', { player: currentPlayer })
                        : t('reviewStory')}
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
                                {story.map((sentence, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-3 rounded ${sentence.player === 1 ? 'bg-primary/10' : 'bg-secondary/10'
                                            }`}
                                    >
                                        <p className="text-sm text-muted-foreground">
                                            {t('player', { number: sentence.player })}:
                                        </p>
                                        <p>{sentence.text}</p>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <Textarea
                                    value={currentSentence}
                                    onChange={(e) => setCurrentSentence(e.target.value)}
                                    placeholder={t('enterSentence')}
                                    disabled={story.length >= maxSentences}
                                    className="min-h-[100px]"
                                />
                                <Button
                                    onClick={handleSentenceSubmit}
                                    disabled={!currentSentence.trim() || story.length >= maxSentences}
                                    className="w-full"
                                >
                                    {t('add')}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">{t('finalStory')}</h3>
                                <div className="p-4 bg-muted rounded-lg">
                                    {story.map((sentence, index) => (
                                        <p key={index} className="mb-2">
                                            {sentence.text}
                                        </p>
                                    ))}
                                </div>
                                <Button onClick={handleComplete} className="w-full">
                                    {t('complete')}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default StoryBuilderGame; 