import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslations } from 'next-intl';
import { Loader2, Lightbulb, Bot } from "lucide-react";

interface ConversationInputFormProps {
    conversationHistory: string;
    setConversationHistory: (history: string) => void;
    user1Profile: string;
    setUser1Profile: (profile: string) => void;
    user2Profile: string;
    setUser2Profile: (profile: string) => void;
    userComfortLevel: string;
    setUserComfortLevel: (level: string) => void;
    isLoadingAdvice: boolean;
    isLoadingStyles: boolean;
    onGetAdvice: () => void;
    onGetStyleSuggestions: () => void;
}

const ConversationInputForm: React.FC<ConversationInputFormProps> = ({
    conversationHistory,
    setConversationHistory,
    user1Profile,
    setUser1Profile,
    user2Profile,
    setUser2Profile,
    userComfortLevel,
    setUserComfortLevel,
    isLoadingAdvice,
    isLoadingStyles,
    onGetAdvice,
    onGetStyleSuggestions,
}) => {
    const t = useTranslations('AIConversationCoachPage');

    return (
        <Card className="shadow-lg border">
            <CardHeader>
                <CardTitle>{t('conversationInputTitle')}</CardTitle>
                <CardDescription>{t('provideContext')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="user1-profile">{t('user1ProfileLabel')}</Label>
                    <Textarea
                        id="user1-profile"
                        placeholder={t('user1ProfilePlaceholder')}
                        value={user1Profile}
                        onChange={(e) => setUser1Profile(e.target.value)}
                        className="h-24"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="user2-profile">{t('user2ProfileLabel')}</Label>
                    <Textarea
                        id="user2-profile"
                        placeholder={t('user2ProfilePlaceholder')}
                        value={user2Profile}
                        onChange={(e) => setUser2Profile(e.target.value)}
                        className="h-24"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="conversation-history">{t('conversationHistoryLabel')}</Label>
                    <Textarea
                        id="conversation-history"
                        placeholder={t('conversationHistoryPlaceholder')}
                        value={conversationHistory}
                        onChange={(e) => setConversationHistory(e.target.value)}
                        rows={6}
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="user-comfort-level">{t('userComfortLevelLabel')}</Label>
                    <Input
                        id="user-comfort-level"
                        placeholder={t('userComfortLevelPlaceholder')}
                        value={userComfortLevel}
                        onChange={(e) => setUserComfortLevel(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">{t('comfortLevelHelp')}</p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row gap-4 justify-end">
                <Button onClick={onGetAdvice} disabled={isLoadingAdvice || isLoadingStyles}>
                    <>
                        {isLoadingAdvice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                        {t('getTipsButton')}
                    </>
                </Button>
                <Button onClick={onGetStyleSuggestions} variant="outline" disabled={isLoadingAdvice || isLoadingStyles}>
                    <>
                        {isLoadingStyles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                        {t('getStyleSuggestionsButton')}
                    </>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ConversationInputForm;
