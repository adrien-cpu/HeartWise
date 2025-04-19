;"use client";

import {useState} from 'react';
import {conversationCoach} from '@/ai/flows/conversation-coach';
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {useTranslations} from 'next-intl';

/**
 * @fileOverview AI Conversation Coach page component.
 *
 * @module AIConversationCoach
 *
 * @description This component provides an interface for users to input a message,
 * partner characteristics, and user style, then uses AI to analyze the message and
 * suggest improvements.  It leverages the `conversationCoach` flow from the AI module.
 */

/**
 * AIConversationCoach component.
 *
 * @component
 * @description A client component that provides an interface for analyzing and improving conversations using AI.
 * @returns {JSX.Element} The rendered AI Conversation Coach page.
 */
export default function AIConversationCoach() {
  const [message, setMessage] = useState('');
  const [partnerCharacteristics, setPartnerCharacteristics] = useState('');
  const [userStyle, setUserStyle] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState(null);
  const t = useTranslations('AIConversationCoach');

  /**
   * Handles the analysis of the message using the conversationCoach flow.
   * @async
   * @function handleAnalyze
   * @returns {Promise<void>}
   */
  const handleAnalyze = async () => {
    try {
      const result = await conversationCoach({
        message: message,
        partnerCharacteristics: partnerCharacteristics,
        userStyle: userStyle,
      });
      setSuggestion(result);
      setError(null);
    } catch (error: any) {
      setSuggestion(null);
      setError(error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {t('messageLabel')}:
        </label>
        <Textarea
          placeholder={t('messagePlaceholder')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {t('partnerCharacteristicsLabel')} ({t('optional')}):
        </label>
        <Input
          type="text"
          placeholder={t('partnerCharacteristicsPlaceholder')}
          value={partnerCharacteristics}
          onChange={(e) => setPartnerCharacteristics(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {t('userStyleLabel')} ({t('optional')}):
        </label>
        <Input
          type="text"
          placeholder={t('userStylePlaceholder')}
          value={userStyle}
          onChange={(e) => setUserStyle(e.target.value)}
        />
      </div>
      <Button onClick={handleAnalyze}>{t('analyzeButton')}</Button>
      {error && <div className="text-red-500 mt-4">Error: {error}</div>}
      {suggestion && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">{t('suggestionTitle')}:</h2>
          <Card>
            <CardHeader>
              <CardTitle>{t('suggestionCardTitle')}</CardTitle>
              <CardDescription>
                {suggestion.suggestion || t('noSuggestion')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('explanationLabel')}: {suggestion.explanation || t('noExplanation')}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
