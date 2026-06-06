"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from "next-intl";
import blindExchangeProfileFlow, { BlindExchangeProfileInput, BlindExchangeProfileOutput, PsychologicalTraits } from "@/ai/flows/blind-exchange-profile"; // Corrected import
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
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import Image from 'next/image'; // Import next/image

/**
 * @fileOverview Implements the Blind Exchange Mode page with progressive information reveal.
 * @module BlindExchangeModePage
 * @description A component for the Blind Exchange Mode, where users chat and information about their match is revealed progressively.
 *              **Requires Backend:** Real user data, psychological trait generation, real-time chat, and persistent reveal state.
 */

// --- Mock Data ---
const mockCurrentUserPsychTraits: PsychologicalTraits = {
  openness: 0.7, conscientiousness: 0.6, extroversion: 0.8, agreeableness: 0.7, neuroticism: 0.3 // Corrected extroversion
};
const mockCurrentUserInterests: string[] = ["Reading", "Hiking"];

const mockMatchUserPsychTraits: PsychologicalTraits = {
  openness: 0.5, conscientiousness: 0.8, extroversion: 0.5, agreeableness: 0.9, neuroticism: 0.2 // Corrected extroversion
};
const mockMatchUserInterests: string[] = ["Hiking", "Photography", "Travel", "Classical Music"]; // Match data used for generating AI profile

// Data for the "mystery partner" to be revealed progressively
const MOCK_PARTNER_REVEAL_DATA = {
  name: "Mystery Person", // Not revealed initially
  interests: ["Photography", "Travel", "Classical Music"], // Order of reveal
  bioSnippets: [
    "Enjoys quiet evenings with a good book.",
    "Always up for trying new recipes.",
    "Believes kindness is key.",
  ],
  profilePictureBlurred: "https://picsum.photos/seed/mystery_blurred/200/200?blur=5", // Blurred image
  profilePictureClear: "https://picsum.photos/seed/mystery_clear/200/200", // Clear image
  dataAiHint: "person portrait" // AI hint for image
};

// --- Types ---
interface Message {
  id: string;
  sender: 'user' | 'partner' | 'system'; // Added 'system' type
  text: string;
  timestamp: Date;
}

interface RevealedInfo {
  interests: string[];
  bioSnippets: string[];
  photoUrl?: string; // For profile picture reveal
}

// Reveal Milestones (User messages + Partner messages combined)
const REVEAL_MILESTONES = [
    { messages: 2, type: 'interest', index: 0, textKey: 'revealedInterest' },
    { messages: 4, type: 'bio', index: 0, textKey: 'revealedBioSnippet' },
    { messages: 6, type: 'interest', index: 1, textKey: 'revealedInterest' },
    { messages: 8, type: 'bio', index: 1, textKey: 'revealedBioSnippet' },
    { messages: 10, type: 'interest', index: 2, textKey: 'revealedInterest' },
    { messages: 12, type: 'photo', textKey: 'revealedPhoto' }, // Milestone for photo
];

const CURRENT_USER_ID = 'user1';
const CURRENT_USER_NAME = 'You';

// --- Component ---
export default function BlindExchangeModePage() {
  const t = useTranslations("BlindExchangeMode");
  const { toast } = useToast();

  const [aiProfile, setAiProfile] = useState<BlindExchangeProfileOutput | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [revealedInfo, setRevealedInfo] = useState<RevealedInfo>({ interests: [], bioSnippets: [], photoUrl: undefined });
  const [totalMessagesSent, setTotalMessagesSent] = useState(0); // Combined count for milestones
  const [lastRevealedMilestoneIndex, setLastRevealedMilestoneIndex] = useState(-1);

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
        const profile = await blindExchangeProfileFlow(input); // Corrected function call
        setAiProfile(profile);
        // Add an initial system message
        setMessages([{
            id: 'system-init',
            sender: 'system', // Use system type
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

 // Progressive reveal logic based on total messages
  useEffect(() => {
    let somethingRevealed = false;
    let revealedItemsMessages: string[] = [];

    REVEAL_MILESTONES.forEach((milestone, index) => {
        if (index > lastRevealedMilestoneIndex && totalMessagesSent >= milestone.messages) {
            let newItemRevealed = false;
            let revealedValue: string | undefined;

            setRevealedInfo(prev => {
                const newRevealed: RevealedInfo = { ...prev, interests: [...prev.interests], bioSnippets: [...prev.bioSnippets] };
                if (milestone.type === 'interest' && milestone.index !== undefined && milestone.index < MOCK_PARTNER_REVEAL_DATA.interests.length && !newRevealed.interests.includes(MOCK_PARTNER_REVEAL_DATA.interests[milestone.index])) {
                    revealedValue = MOCK_PARTNER_REVEAL_DATA.interests[milestone.index];
                    newRevealed.interests.push(revealedValue);
                    newItemRevealed = true;
                } else if (milestone.type === 'bio' && milestone.index !== undefined && milestone.index < MOCK_PARTNER_REVEAL_DATA.bioSnippets.length && !newRevealed.bioSnippets.includes(MOCK_PARTNER_REVEAL_DATA.bioSnippets[milestone.index])) {
                    revealedValue = MOCK_PARTNER_REVEAL_DATA.bioSnippets[milestone.index];
                    newRevealed.bioSnippets.push(revealedValue);
                     newItemRevealed = true;
                } else if (milestone.type === 'photo' && !newRevealed.photoUrl) {
                     newRevealed.photoUrl = MOCK_PARTNER_REVEAL_DATA.profilePictureClear;
                     newItemRevealed = true;
                     revealedValue = t('photo'); // Generic term for photo
                }
                 return newItemRevealed ? newRevealed : prev; // Only update state if something new was revealed
            });

            if (newItemRevealed) {
                somethingRevealed = true;
                setLastRevealedMilestoneIndex(index);
                const systemMessageText = t(milestone.textKey, { value: revealedValue || '' });
                revealedItemsMessages.push(systemMessageText);
            }
        }
    });

    if (somethingRevealed) {
        toast({ title: t('infoRevealedTitle'), description: t('infoRevealedDesc') });
        // Add system messages for revealed items
        const systemMessages: Message[] = revealedItemsMessages.map((text, i) => ({
            id: `system-reveal-${lastRevealedMilestoneIndex}-${i}`,
            sender: 'system',
            text: text,
            timestamp: new Date(),
        }));
        setMessages(prev => [...prev, ...systemMessages]);
    }

  }, [totalMessagesSent, lastRevealedMilestoneIndex, toast, t]);


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
    setTotalMessagesSent(prev => prev + 1); // Increment total count
    const currentUserInput = userInput; // Store before clearing
    setUserInput('');

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
    setTotalMessagesSent(prev => prev + 1); // Increment total count
    setIsSending(false);
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

   const partnerAvatar = revealedInfo.photoUrl || MOCK_PARTNER_REVEAL_DATA.profilePictureBlurred;


  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-bold text-center">{t("title")}</h1>

      {/* AI Profile Card */}
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
              &quot;{aiProfile.compatibleProfileDescription}&quot; {/* Corrected access to property */}
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
                    msg.sender === 'user' ? "ml-auto justify-end" : "mr-auto justify-start",
                    msg.sender === 'system' ? "mx-auto justify-center w-full max-w-full" : "" // Center system messages
                  )}
                >
                  {msg.sender === 'partner' && (
                    <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0" data-ai-hint={MOCK_PARTNER_REVEAL_DATA.dataAiHint}>
                       <AvatarImage src={partnerAvatar} alt={MOCK_PARTNER_REVEAL_DATA.name} />
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 shadow-sm text-sm",
                      msg.sender === 'user'
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : msg.sender === 'partner'
                            ? "bg-card text-card-foreground border rounded-bl-none"
                            : "bg-accent text-accent-foreground w-fit mx-auto italic text-xs" // System message style
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.sender !== 'system' && ( // Don't show timestamp for system messages
                      <p className="text-xs text-right opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                   {msg.sender === 'user' && (
                     <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0" data-ai-hint="user silhouette">
                       {/* Placeholder for current user's avatar if available */}
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
                  aria-label={t('sendMessagePlaceholder')}
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
            <CardContent className="space-y-4">
              {/* Revealed Photo */}
              {revealedInfo.photoUrl && (
                 <div className="flex flex-col items-center">
                    <h4 className="font-semibold text-sm mb-1">{t('photo')}</h4>
                    <Image
                        src={revealedInfo.photoUrl}
                        alt={t('partnerPhotoAlt')}
                        width={100}
                        height={100}
                        className="rounded-full border shadow-md"
                        data-ai-hint={MOCK_PARTNER_REVEAL_DATA.dataAiHint}
                    />
                 </div>
              )}

              {/* Revealed Interests */}
              {revealedInfo.interests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">{t('revealedInterests')}</h4>
                  <div className="flex flex-wrap gap-1">
                    {revealedInfo.interests.map((interest, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Revealed Bio Snippets */}
              {revealedInfo.bioSnippets.length > 0 && (
                 <div>
                  <h4 className="font-semibold text-sm mb-1">{t('revealedBio')}</h4>
                   <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
                    {revealedInfo.bioSnippets.map((snippet, i) => (
                      <li key={i}>{snippet}</li>
                    ))}
                  </ul>
                </div>
              )}

               {/* Placeholder if nothing is revealed yet */}
               {!revealedInfo.photoUrl && revealedInfo.interests.length === 0 && revealedInfo.bioSnippets.length === 0 && (
                 <p className="text-sm text-muted-foreground text-center py-4">{t('nothingRevealedYet')}</p>
               )}

               {/* Progress Bar for next reveal */}
               {lastRevealedMilestoneIndex < REVEAL_MILESTONES.length - 1 && (
                 <div className="pt-4">
                   <h4 className="font-semibold text-xs mb-1 text-muted-foreground">{t('nextRevealProgress')}</h4>
                   <Progress
                     value={(totalMessagesSent / (REVEAL_MILESTONES[lastRevealedMilestoneIndex + 1]?.messages || totalMessagesSent + 1)) * 100}
                     className="h-2"
                     aria-label={t('nextRevealProgress')}
                    />
                 </div>
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
