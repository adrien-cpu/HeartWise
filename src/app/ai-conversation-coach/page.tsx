
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"; // Added CardFooter, CardDescription
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Added Input
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';
import { Separator } from "@/components/ui/separator";
import { getConversationAdvice } from "@/ai/flows/conversation-coach";
import { getStyleSuggestions, StyleSuggestion } from "@/ai/flows/style-suggestions-flow"; // Added Style Suggestions imports
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Added Accordion
import { Loader2, Lightbulb, Bot } from "lucide-react"; // Added Loader2, Lightbulb, Bot icons

/**
 * @fileOverview Implements the AI Conversation Coach page.
 */

/**
 * @function AIConversationCoachPage
 * @description A component that provides AI-powered conversation advice and style suggestions to users based on their conversation history and profiles.
 * @returns {JSX.Element} The rendered AIConversationCoach page.
 */
const AIConversationCoachPage: React.FC = () => {
  const [conversationHistory, setConversationHistory] = useState('');
  const [advice, setAdvice] = useState('');
  const [user1Profile, setUser1Profile] = useState('');
  const [user2Profile, setUser2Profile] = useState('');
  const [userComfortLevel, setUserComfortLevel] = useState(''); // Added state for comfort level
  const [styleSuggestions, setStyleSuggestions] = useState<StyleSuggestion[]>([]); // Added state for style suggestions
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false); // Loading state for advice
  const [isLoadingStyles, setIsLoadingStyles] = useState(false); // Loading state for styles
  const { toast } = useToast();
  const t = useTranslations('AIConversationCoachPage');

  /**
   * @async
   * @function handleGetAdvice
   * @description Retrieves conversation advice from the AI and updates the state.
   * @throws {Error} If there is an error generating the advice.
   */
  const handleGetAdvice = async () => {
    if (!conversationHistory || !user1Profile || !user2Profile) {
        toast({ title: t('missingInputError'), description: t('fillFieldsError'), variant: 'destructive'});
        return;
    }
    setIsLoadingAdvice(true);
    setAdvice(''); // Clear previous advice
    try {
      const result = await getConversationAdvice({
        conversationHistory: conversationHistory,
        user1Profile: user1Profile,
        user2Profile: user2Profile,
      });
      setAdvice(result.advice);
      toast({
        title: t('adviceGenerated'),
        description: t('adviceReceived'),
      });
    } catch (error: any) {
      console.error("Error generating advice:", error);
      toast({
        title: t('errorGeneratingAdvice'),
        description: t('adviceGenerationFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  /**
   * @async
   * @function handleGetStyleSuggestions
   * @description Retrieves style suggestions from the AI and updates the state.
   * @throws {Error} If there is an error generating the suggestions.
   */
  const handleGetStyleSuggestions = async () => {
      if (!user1Profile || !user2Profile) {
        toast({ title: t('missingProfileError'), description: t('fillProfileFieldsError'), variant: 'destructive'});
        return;
    }
    setIsLoadingStyles(true);
    setStyleSuggestions([]); // Clear previous suggestions
    try {
      const result = await getStyleSuggestions({
        userProfile: user1Profile,
        partnerProfile: user2Profile,
        conversationContext: conversationHistory, // Use existing history
        userComfortLevel: userComfortLevel,
      });
      setStyleSuggestions(result.suggestions);
      toast({
        title: t('styleSuggestionsGenerated'),
        description: t('styleSuggestionsReceived'),
      });
    } catch (error: any) {
      console.error("Error generating style suggestions:", error);
      toast({
        title: t('errorGeneratingStyles'),
        description: t('styleGenerationFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoadingStyles(false);
    }
  };


  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">{t('pageTitle')}</h1>
      <p className="text-center text-muted-foreground mb-8">{t('pageDescription')}</p>

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
             <Button onClick={handleGetAdvice} disabled={isLoadingAdvice || isLoadingStyles}>
                 {isLoadingAdvice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                 {t('getTipsButton')}
             </Button>
             <Button onClick={handleGetStyleSuggestions} variant="outline" disabled={isLoadingAdvice || isLoadingStyles}>
                 {isLoadingStyles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                 {t('getStyleSuggestionsButton')}
             </Button>
         </CardFooter>
      </Card>


      {/* Advice Section */}
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

      {/* Style Suggestions Section */}
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
                    {styleSuggestions.map((suggestion, index) => (
                        <AccordionItem value={`style-${index}`} key={index}>
                           <AccordionTrigger className="text-lg font-semibold">{suggestion.styleName}</AccordionTrigger>
                            <AccordionContent className="space-y-3 pl-2">
                                <p className="text-muted-foreground italic">{suggestion.description}</p>
                                <div>
                                    <h4 className="font-medium mb-1 text-sm">{t('examples')}</h4>
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                       {suggestion.examples.map((example, i) => (
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
    </div>
  );
};

export default AIConversationCoachPage;

