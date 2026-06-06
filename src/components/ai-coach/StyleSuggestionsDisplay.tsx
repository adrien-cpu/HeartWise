import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslations } from 'next-intl';
import { Lightbulb, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { StyleSuggestion } from '@/ai/flows/style-suggestions-flow'; // Assuming StyleSuggestion is now correctly exported as a type

interface StyleSuggestionsDisplayProps {
    styleSuggestions: StyleSuggestion[];
    isLoadingStyles: boolean;
}

const StyleSuggestionsDisplay: React.FC<StyleSuggestionsDisplayProps> = ({
    styleSuggestions,
    isLoadingStyles,
}) => {
    const t = useTranslations('AIConversationCoachPage');

    if (styleSuggestions.length === 0 && !isLoadingStyles) return null; // Don't render if no suggestions and not loading

    return (
        <>
            {(isLoadingStyles || styleSuggestions.length > 0) && <Separator />}
            {isLoadingStyles && (
                <div className="flex justify-center items-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            {styleSuggestions.length > 0 && !isLoadingStyles && (
                <Card className="border shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"> <Lightbulb className="h-5 w-5 text-primary"/> {t('styleSuggestionsTitle')}</CardTitle>
                        <CardDescription>{t('styleSuggestionsDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {styleSuggestions.map((suggestion: StyleSuggestion, index: number) => (
                                <AccordionItem value={`style-${index}`} key={index}>
                                    <AccordionTrigger className="text-lg font-semibold">{suggestion.styleName}</AccordionTrigger>
                                    <AccordionContent className="space-y-3 pl-2">
                                        <p className="text-muted-foreground italic">{suggestion.description}</p>
                                        <div>
                                            <h4 className="font-medium mb-1 text-sm">{t('examples')}</h4>
                                            <ul className="list-disc list-inside text-sm space-y-1">
                                                {suggestion.examples.map((example: string, i: number) => (
                                                    <li key={i}>{example}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </>
    );
};

export default StyleSuggestionsDisplay;
