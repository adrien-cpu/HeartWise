"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useConversationCoach } from '@/hooks/useConversationCoach';
import ConversationInputForm from '@/components/ai-coach/ConversationInputForm';
import AdviceDisplay from '@/components/ai-coach/AdviceDisplay';
import StyleSuggestionsDisplay from '@/components/ai-coach/StyleSuggestionsDisplay';

/**
 * @fileOverview Implements the AI Conversation Coach page.
 */

/**
 * @function AIConversationCoachPage
 * @description A component that provides AI-powered conversation advice and style suggestions to users based on their conversation history and profiles.
 * @returns {JSX.Element} The rendered AIConversationCoach page.
 */
const AIConversationCoachPage: React.FC = () => {
  const t = useTranslations('AIConversationCoachPage');
  const { toast } = useToast();

  const {
    conversationHistory,
    setConversationHistory,
    user1Profile,
    setUser1Profile,
    user2Profile,
    setUser2Profile,
    userComfortLevel,
    setUserComfortLevel,
    advice,
    styleSuggestions,
    isLoadingAdvice,
    setIsLoadingAdvice,
    isLoadingStyles,
    setIsLoadingStyles,
    getAdvice,
    getStyleSuggestions,
  } = useConversationCoach();

  // Wrap the hook functions to include toast notifications
  const handleGetAdvice = async () => {
    if (!conversationHistory || !user1Profile || !user2Profile) {
      toast({
        title: t('missingInputError'),
        description: t('fillFieldsError'),
        variant: 'destructive'
      });
      return;
    }

    if (!conversationHistory.trim()) {
      toast({
        title: t('emptyConversationError'),
        description: t('conversationRequiredError'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoadingAdvice(true);
      await getAdvice();
      toast({
        title: t('adviceGenerated'),
        description: t('adviceReceived'),
      });
    } catch (error) {
      console.error("Error generating advice:", error);
      const errorMessage = error instanceof Error ? error.message : t('unknownError');
      toast({
        title: t('errorGeneratingAdvice'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const handleGetStyleSuggestions = async () => {
    if (!user1Profile || !user2Profile) {
      toast({
        title: t('missingProfileError'),
        description: t('fillProfileFieldsError'),
        variant: 'destructive'
      });
      return;
    }

    if (!user1Profile.trim() || !user2Profile.trim()) {
      toast({
        title: t('emptyProfileError'),
        description: t('profileRequiredError'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoadingStyles(true);
      await getStyleSuggestions();
      toast({
        title: t('styleSuggestionsGenerated'),
        description: t('styleSuggestionsReceived'),
      });
    } catch (error) {
      console.error("Error generating style suggestions:", error);
      const errorMessage = error instanceof Error ? error.message : t('unknownError');
      toast({
        title: t('errorGeneratingStyles'),
        description: errorMessage,
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

      <ConversationInputForm
        conversationHistory={conversationHistory}
        setConversationHistory={setConversationHistory}
        user1Profile={user1Profile}
        setUser1Profile={setUser1Profile}
        user2Profile={user2Profile}
        setUser2Profile={setUser2Profile}
        userComfortLevel={userComfortLevel}
        setUserComfortLevel={setUserComfortLevel}
        isLoadingAdvice={isLoadingAdvice}
        isLoadingStyles={isLoadingStyles}
        onGetAdvice={handleGetAdvice}
        onGetStyleSuggestions={handleGetStyleSuggestions}
      />

      <AdviceDisplay advice={advice} isLoadingAdvice={isLoadingAdvice} />

      <StyleSuggestionsDisplay styleSuggestions={styleSuggestions} isLoadingStyles={isLoadingStyles} />

    </div>
  );
};

export default AIConversationCoachPage;
