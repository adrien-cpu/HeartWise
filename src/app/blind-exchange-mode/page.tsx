
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from "next-intl";
import { generateBlindExchangeProfile, BlindExchangeProfileInput, BlindExchangeProfileOutput, PsychologicalTraits } from "@/ai/flows/blind-exchange-profile";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Loader2, Send, Sparkles, Info, Lightbulb, User, Eye } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Mock data for the current user and the potential match for flow input
const mockCurrentUserPsychTraits: PsychologicalTraits = {
  openness: 0.7, conscientiousness: 0.6, extraversion: 0.8, agreeableness: 0.7, neuroticism: 0.3
};
const mockCurrentUserInterests: string[] = ["Reading", "Hiking"];

const mockMatchUserPsychTraits: PsychologicalTraits = {
  openness: 0.5, conscientiousness: 0.8, extraversion: 0.5, agreeableness: 0.9, neuroticism: 0.2
};
const mockMatchUserInterests: string[] = ["Hiking", "Photography", "Travel"]; // These are what we will reveal

// Data for the "mystery partner" to be revealed progressively
const MOCK_PARTNER_REVEAL_DATA = {
  name: "Mystery Person", // Not revealed initially
  interests: ["Photography", "Travel", "Classical Music"], // Order of reveal
  bioSnippets: [
    "Enjoys quiet evenings with a good book.",
    "Always up for trying new recipes.",
    "Believes kindness is key.",
  ],
  // profilePictureBlurred: "https://picsum.photos/seed/mystery_blurred/200/200?blur=10",
  // profilePictureClear: "https://picsum.photos/seed/mystery_clear/200/200",
};


interface Message {
  id: string;
  sender: 'user' | 'partner';
  text: string;
  timestamp: Date;
}

interface RevealedInfo {
  interests: string[];
  bioSnippets: string[];
  // photoUrl?: string; // For later
}

const CURRENT_USER_ID = 'user1';
const CURRENT_USER_NAME = 'You';


/**
 * @fileOverview Implements the Blind Exchange Mode page with progressive information reveal.
 * @module BlindExchangeModePage
 * @description A component for the Blind Exchange Mode, where users chat and information about their match is revealed progressively.
 *              **Requires Backend:** Real user data, psychological trait generation, real-time chat, and persistent reveal state.
 * @returns {JSX.Element} The rendered BlindExchangeModePage component.
 */
export default function BlindExchangeModePage() {
  const t = useTranslations("BlindExchangeMode");
  const { toast } = useToast();
  
  const [aiProfile, setAiProfile] = useState<BlindExchangeProfileOutput | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [revealedInfo, setRevealedInfo] = useState<RevealedInfo>({ interests: [], bioSnippets: [] });
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [partnerMessageCount, setPartnerMessageCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch AI-generated profile on initial load
  useEffect(() => {
    const fetchAiProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const input: BlindExchangeProfileInput = {
          currentUserPsychologicalTraits: mockCurrentUserPsychTraits,
          currentUserInterests: mockCurrentUserInterests,
          matchUserPsychologicalTraits: mockMatchUserPsychTraits,
          matchUserInterests: mockMatchUserInterests,
        };
        const profile = await generateBlindExchangeProfile(input);
        setAiProfile(profile);
        // Add an initial system message
        setMessages([{ 
            id: 'system-init', 
            sender: 'partner', // Visually from partner but could be system
            text: t('initialSystemMessage', { partnerName: MOCK_PARTNER_REVEAL_DATA.name }), 
            timestamp: new Date() 
        }]);
      } catch (error) {
        console.error("Error fetching AI profile for Blind Exchange:", error);
        toast({ variant: 'destructive', title: t('errorLoadingProfileTitle'), description: t('errorLoadingProfileDesc') });
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchAiProfile();
  }, [t, toast]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Progressive reveal logic
  useEffect(() => {
    const revealNextItem = () => {
      setRevealedInfo(prev => {
        const newRevealed: RevealedInfo = { ...prev, interests: [...prev.interests], bioSnippets: [...prev.bioSnippets] };
        let itemRevealedThisTurn = false;

        // Reveal interests
        if (userMessageCount >= 1 && partnerMessageCount >= 1 && newRevealed.interests.length < 1 && MOCK_PARTNER_REVEAL_DATA.interests.length >= 1) {
          newRevealed.interests.push(MOCK_PARTNER_REVEAL_DATA.interests[0]);
          itemRevealedThisTurn = true;
        }
        if (userMessageCount >= 2 && partnerMessageCount >= 2 && newRevealed.interests.length < 2 && MOCK_PARTNER_REVEAL_DATA.interests.length >= 2) {
          newRevealed.interests.push(MOCK_PARTNER_REVEAL_DATA.interests[1]);
           itemRevealedThisTurn = true;
        }
        // Reveal bio snippets
        if (userMessageCount >= 3 && partnerMessageCount >= 3 && newRevealed.bioSnippets.length < 1 && MOCK_PARTNER_REVEAL_DATA.bioSnippets.length >=1) {
            newRevealed.bioSnippets.push(MOCK_PARTNER_REVEAL_DATA.bioSnippets[0]);
            itemRevealedThisTurn = true;
        }
         if (userMessageCount >= 4 && partnerMessageCount >= 4 && newRevealed.interests.length < 3 && MOCK_PARTNER_REVEAL_DATA.interests.length >= 3) {
          newRevealed.interests.push(MOCK_PARTNER_REVEAL_DATA.interests[2]);
           itemRevealedThisTurn = true;
        }


        if (itemRevealedThisTurn) {
             toast({ title: t('infoRevealedTitle'), description: t('infoRevealedDesc') });
        }
        return newRevealed;
      });
    };
    revealNextItem();
  }, [userMessageCount, partnerMessageCount, toast, t]);


  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    setIsSending(true);

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setUserMessageCount(prev => prev + 1);

    // Simulate partner's reply
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    const partnerReplies = [
        t('partnerReply1'),
        t('partnerReply2'),
        t('partnerReply3', { interest: revealedInfo.interests[0] || MOCK_PARTNER_REVEAL_DATA.interests[0] || 'something interesting' }),
        t('partnerReply4'),
    ];
    const partnerMessage: Message = {
      id: `msg-partner-${Date.now()}`,
      sender: 'partner',
      text: partnerReplies[Math.floor(Math.random() * partnerReplies.length)],
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, partnerMessage]);
    setPartnerMessageCount(prev => prev + 1);
    setIsSending(false);
  };
  
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-bold text-center">{t("title")}</h1>
      
      {isLoadingProfile ? (
        <Card className="w-full max-w-2xl p-6">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">{t("loadingProfile")}</p>
          </div>
        </Card>
      ) : aiProfile ? (
        <Card className="w-full max-w-2xl shadow-lg border">
          <CardHeader className="items-center text-center">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {t("matchedProfileTitle")}
            </CardTitle>
            <div className="relative w-32 h-8 mx-auto my-2">
                <Progress value={aiProfile.compatibilityPercentage} className="h-full" aria-label={`${t('compatibilityLabel')} ${aiProfile.compatibilityPercentage}%`}/>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary-foreground">
                    {aiProfile.compatibilityPercentage}% {t('compatibilityLabel')}
                </span>
            </div>
            <CardDescription className="italic text-sm">
              &quot;{aiProfile.compatibleProfileDescription}&quot;
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
         <Card className="w-full max-w-2xl p-6">
            <p className="text-center text-destructive">{t("errorLoadingProfileDesc")}</p>
        </Card>
      )}

      {/* Chat and Revealed Info Section */}
      {!isLoadingProfile && aiProfile && (
        <div className="w-full max-w-2xl grid md:grid-cols-3 gap-6">
          {/* Chat Area */}
          <Card className="md:col-span-2 shadow-lg border h-[60vh] flex flex-col">
            <CardHeader>
              <CardTitle>{t('chatTitle')}</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-grow p-4 space-y-4 bg-muted/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end space-x-2 max-w-[85%]",
                    msg.sender === 'user' ? "ml-auto justify-end" : "mr-auto justify-start"
                  )}
                >
                  {msg.sender === 'partner' && (
                    <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0" data-ai-hint="mystery person">
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 shadow-sm",
                      msg.sender === 'user'
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card text-card-foreground border rounded-bl-none"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className="text-xs text-right opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                   {msg.sender === 'user' && (
                     <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0" data-ai-hint="user silhouette">
                       <AvatarFallback>{getInitials(CURRENT_USER_NAME)}</AvatarFallback>
                     </Avatar>
                   )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <CardFooter className="p-4 border-t bg-card">
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder={t('sendMessagePlaceholder')}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
                  disabled={isSending}
                  className="flex-grow"
                />
                <Button onClick={handleSendMessage} disabled={isSending || !userInput.trim()} size="icon" aria-label={t('sendButtonLabel')}>
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Revealed Information */}
          <Card className="md:col-span-1 shadow-lg border h-fit sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary"/>
                {t('revealedInfoTitle')}
              </CardTitle>
              <CardDescription>{t('revealedInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {revealedInfo.interests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">{t('revealedInterests')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {revealedInfo.interests.map((interest, i) => (
                      <Badge key={i} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {revealedInfo.bioSnippets.length > 0 && (
                 <div>
                  <h4 className="font-semibold text-sm mb-1">{t('revealedBio')}</h4>
                   <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {revealedInfo.bioSnippets.map((snippet, i) => (
                      <li key={i}>{snippet}</li>
                    ))}
                  </ul>
                </div>
              )}
              {revealedInfo.interests.length === 0 && revealedInfo.bioSnippets.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('nothingRevealedYet')}</p>
              )}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">{t('keepChatting')}</p>
             </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
