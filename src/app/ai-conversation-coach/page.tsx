"use client";

import {useState} from 'react';
import {conversationCoach} from '@/ai/flows/conversation-coach';
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";

export default function AIConversationCoach() {
  const [message, setMessage] = useState('');
  const [partnerCharacteristics, setPartnerCharacteristics] = useState('');
  const [userStyle, setUserStyle] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState(null);

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
      <h1 className="text-2xl font-bold mb-4">AI Conversation Coach</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Message:
        </label>
        <Textarea
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Partner Characteristics (optional):
        </label>
        <Input
          type="text"
          placeholder="e.g., introverted, likes art"
          value={partnerCharacteristics}
          onChange={(e) => setPartnerCharacteristics(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Your Style (optional):
        </label>
        <Input
          type="text"
          placeholder="e.g., romantic, direct, poetic"
          value={userStyle}
          onChange={(e) => setUserStyle(e.target.value)}
        />
      </div>
      <Button onClick={handleAnalyze}>Analyze Message</Button>
      {error && <div className="text-red-500 mt-4">Error: {error}</div>}
      {suggestion && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Suggestion:</h2>
          <Card>
            <CardHeader>
              <CardTitle>Suggestion</CardTitle>
              <CardDescription>
                {suggestion.suggestion || 'No suggestion provided.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Explanation: {suggestion.explanation || 'No explanation.'}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
