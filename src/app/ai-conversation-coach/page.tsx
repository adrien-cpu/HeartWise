"use client";

import {useState} from 'react';
import {getConversationTips} from '@/ai/flows/conversation-coach';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useTranslations} from 'next-intl';

/**
 * @fileOverview AI Conversation Tips component.
 */

/**
 * @component
 * ConversationTips
 * @description A component that provides conversation tips based on user input.
 * @returns {JSX.Element} The rendered ConversationTips component.
 */
const ConversationTips = () => {
  const [message, setMessage] = useState('');
  const [tips, setTips] = useState('');
    const t = useTranslations('AIConversationCoach');

  /**
   * @function handleGetTips
   * @description Retrieves conversation tips based on the current message input.
   * It calls the `getConversationTips` function and updates the `tips` state with the result.
   */
  const handleGetTips = () => {
    const result = getConversationTips(message);
    setTips(result);
  };

  return (
    <div>
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('enterMessage')}
        className="mb-2"
      />
      <Button onClick={handleGetTips}>{t('getTips')}</Button>
      {tips && <p className="mt-2">{t('tips')}: {tips}</p>}
    </div>
  );
};

/**
 * @component
 * AIConversationCoachPage
 * @description A page component that includes the ConversationTips component.
 * @returns {JSX.Element} The rendered page.
 */
const AIConversationCoachPage = () => <ConversationTips />;

export default AIConversationCoachPage;
