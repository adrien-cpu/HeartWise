"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';
import {Separator} from "@/components/ui/separator";
import { getConversationAdvice } from "@/ai/flows/conversation-coach";

const AIConversationCoachPage: React.FC = () => {
  const [conversationHistory, setConversationHistory] = useState('');
  const [advice, setAdvice] = useState('');
  const [user1Profile, setUser1Profile] = useState('');
  const [user2Profile, setUser2Profile] = useState('');
  const { toast } = useToast();
  const t = useTranslations('AIConversationCoachPage');

  const handleGetAdvice = async () => {
    try {
      const generatedAdvice = await getConversationAdvice({
        conversationHistory: conversationHistory,
        user1Profile: user1Profile,
        user2Profile: user2Profile,
      });
      setAdvice(generatedAdvice.advice);
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
    }
  };

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t('pageTitle')}</h1>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Conversation Input</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="conversation-history">Conversation History</Label>
              <Textarea
                id="conversation-history"
                placeholder="Enter the conversation history..."
                value={conversationHistory}
                onChange={(e) => setConversationHistory(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="user1-profile">User 1 Profile</Label>
              <Textarea
                id="user1-profile"
                placeholder="Enter the profile information for User 1..."
                value={user1Profile}
                onChange={(e) => setUser1Profile(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="user2-profile">User 2 Profile</Label>
              <Textarea
                id="user2-profile"
                placeholder="Enter the profile information for User 2..."
                value={user2Profile}
                onChange={(e) => setUser2Profile(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleGetAdvice}>{t('getTipsButton')}</Button>
        <Separator className="my-4" />
        {advice && (
          <Card>
            <CardHeader>
              <CardTitle>{t('tips')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{advice}</p>
            </CardContent>
          </Card>
        )}
      </div>
  )
}
export default AIConversationCoachPage;
