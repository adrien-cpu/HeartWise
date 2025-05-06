import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import { Bot, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AdviceDisplayProps {
    advice: string;
    isLoadingAdvice: boolean;
}

const AdviceDisplay: React.FC<AdviceDisplayProps> = ({
    advice,
    isLoadingAdvice,
}) => {
    const t = useTranslations('AIConversationCoachPage');

    if (!advice && !isLoadingAdvice) return null; // Don't render if no advice and not loading

    return (
        <>
            {(isLoadingAdvice || advice) && <Separator />}
            {isLoadingAdvice && (
                <div className="flex justify-center items-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            {advice && !isLoadingAdvice && (
                <Card className="border shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"> <Bot className="h-5 w-5 text-primary"/> {t('tips')}</CardTitle>
                        <CardDescription>{t('adviceCardDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{advice}</p>
                    </CardContent>
                </Card>
            )}
        </>
    );
};

export default AdviceDisplay;
